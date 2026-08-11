import {
  Outlet,
  useNavigate,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import Modal from "@/shared/components/Modal";
import { LoginModal } from "@/shared/components/LoginModal";
import { useAuthStore } from "@/store/authStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useHostModeSwitch } from "@/shared/hooks/useHostModeSwitch";
import {
  handleOAuthCallback,
  switchMode,
  getCurrentUser,
} from "@/shared/utils/oauth";
import { PaymentApproval } from "@/features/guest-explore/api/my_reservation_api";
import { TOSS_PENDING_PAYMENT_KEY, clearTossPaymentCache } from "@/features/guest-explore/components/contract/TossPayments";

// 새로고침 시 authStore의 user는 초기화되지만 localStorage의 토큰은 남아있으므로,
// 앱 시작 시 토큰이 있으면 /users/me로 로그인 상태를 복원한다.
const SessionBootstrap = () => {
  const login = useAuthStore((s) => s.login);
  const setSessionReady = useAuthStore((s) => s.setSessionReady);
  const refreshHostStatus = useAuthStore((s) => s.refreshHostStatus);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      setSessionReady();
      return;
    }
    getCurrentUser()
      .then(async (user) => {
        const isHostPath = window.location.pathname.startsWith("/host");
        login({ ...user, currentMode: isHostPath ? "HOST" : "GUEST" });
        // hostStatus는 새로고침하면 unknown으로 돌아간다. 세션을 복원한 김에 채워두면
        // 호스트 등록 가드가 이미 등록한 계정을 막을 수 있고, 헤더 모드 전환도 따로 조회하지 않는다.
        //
        // 결과를 기다린 뒤에 setSessionReady()가 돌아야 한다. 기다리지 않으면 가드가
        // unknown인 채로 판단해 이미 등록한 호스트에게 등록 화면이 잠깐 보였다 사라진다.
        // 이 대기가 늦추는 것은 isSessionReady를 보는 HostGuard(/host/* 경로)뿐이고,
        // 헤더·게스트 화면은 위 login()으로 이미 복원돼 있다.
        // 실패해도 store가 unknown으로 되돌리고 삼키므로 로그인 복원 흐름은 막지 않는다.
        await refreshHostStatus();
      })
      .catch(() => {
        // accessToken/refreshToken 모두 만료 등 복원 실패 → 남은 토큰 정리
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .finally(() => {
        setSessionReady();
      });
  }, [login, setSessionReady, refreshHostStatus]);

  return null;
};

const PendingActionExecutor = () => {
  const user = useAuthStore((s) => s.user);
  const pendingAction = useAuthStore((s) => s.pendingAction);
  const clearPendingAction = useAuthStore((s) => s.clearPendingAction);
  const setMode = useAuthStore((s) => s.setMode);
  const { handleWishToggle } = useWishGuard();
  const navigate = useNavigate();
  const switchToHost = useHostModeSwitch();

  useEffect(() => {
    if (!user || !pendingAction) return;
    switch (pendingAction.type) {
      case "wish":
        handleWishToggle(pendingAction.spaceId).catch((err: unknown) => {
          console.error("Pending wishToggle 실패: ", err);
        });
        break;
      case "navigate":
        navigate(pendingAction.path);
        break;
      case "modeToggle":
        // 로그인 전에 저장해둔 navigateTo는 그 시점엔 hostStatus를 알 수 없어 신뢰할 수 없다.
        // HOST 전환이면 훅이 로그인 직후 등록 여부를 다시 조회해 목적지를 정한다.
        if (pendingAction.targetMode === "HOST") {
          switchToHost()
            .then((status) => {
              // 조회 실패 시 훅은 이동하지 않는다. 미등록으로 단정해 등록 화면으로
              // 보내면 이미 등록한 호스트가 엉뚱한 곳에 떨어진다. 헤더에서 다시 시도할 수 있다.
              if (status === "unknown") {
                console.error(
                  "[PendingActionExecutor] 호스트 등록 여부를 확인하지 못해 모드 전환을 중단했습니다",
                );
              }
            })
            .finally(clearPendingAction);
        } else {
          setMode(pendingAction.targetMode);
          navigate(pendingAction.navigateTo);
          // 서버 currentMode 동기화 (실패해도 화면 전환은 이미 끝났으니 막지 않는다)
          switchMode(pendingAction.targetMode).catch((err: unknown) => {
            console.error(
              "[PendingActionExecutor] 게스트 모드 서버 동기화 실패:",
              err,
            );
          });
          clearPendingAction();
        }
        break;
    }
    // navigate·handleWishToggle·setMode·clearPendingAction·switchToHost는 안정적 참조(stable ref)라 deps 제외
  }, [user, pendingAction]);

  return null;
};

const OAuthCallbackHandler = () => {
  const login = useAuthStore((s) => s.login);
  const setPendingAction = useAuthStore((s) => s.setPendingAction);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Toss 결제 리다이렉트(code/message를 자체적으로 붙여서 돌아옴)는
    // TossPaymentResultHandler가 처리하므로 OAuth 콜백으로 오인하지 않도록 제외
    if (params.get("tossPayment")) return;

    // 카카오/구글에서 에러 파라미터로 돌아온 경우
    const error = params.get("error");
    if (error) {
      console.error("OAuth error:", error, params.get("error_description"));
      sessionStorage.removeItem("oauth_pending_action");
      sessionStorage.removeItem("oauth_verifier");
      window.history.replaceState(null, "", window.location.pathname);
      navigate("/", { replace: true });
      return;
    }

    const code = params.get("code");
    if (!code) return;

    // URL에서 code 제거 (히스토리 오염 방지 및 새로고침 중복 실행 방지)
    window.history.replaceState(null, "", window.location.pathname);

    handleOAuthCallback(code)
      .then((user) => {
        // 리다이렉트 전에 저장했던 pendingAction 복원
        const saved = sessionStorage.getItem("oauth_pending_action");
        if (saved) {
          try {
            setPendingAction(JSON.parse(saved));
          } catch {
            // 파싱 실패 시 무시
          }
          sessionStorage.removeItem("oauth_pending_action");
        }
        login({ ...user, currentMode: "GUEST" });
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("OAuth token exchange failed:", err);
        sessionStorage.removeItem("oauth_pending_action");
        sessionStorage.removeItem("oauth_verifier");
        navigate("/", { replace: true });
      });
  }, [login]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

interface TossPaymentResultState {
  success: boolean;
  title: string;
  description: string;
}

const TossPaymentResultHandler = () => {
  const [result, setResult] = useState<TossPaymentResultState | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("tossPayment")) return;

    // URL에서 결제 파라미터 제거 (히스토리 오염 방지 및 새로고침 중복 실행 방지)
    window.history.replaceState(null, "", window.location.pathname);

    const pendingRaw = sessionStorage.getItem(TOSS_PENDING_PAYMENT_KEY);
    sessionStorage.removeItem(TOSS_PENDING_PAYMENT_KEY);

    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");

    let paymentId: number | undefined;
    let reservationId: number | undefined;
    if (pendingRaw) {
      try {
        const parsed = JSON.parse(pendingRaw);
        if (typeof parsed?.paymentId === "number") {
          paymentId = parsed.paymentId;
        }
        if (typeof parsed?.reservationId === "number") {
          reservationId = parsed.reservationId;
        }
      } catch (error) {
        console.error("Failed to parse pending payment info:", error);
      }
    }

    // 성공/최종 실패/취소 중 무엇으로 끝나든 이 결제 시도는 여기서 종결된다.
    // 다음 계약 작성 시 이전 시도의 contractId·멱등키를 이어받지 않도록 지금 정리한다.
    if (reservationId !== undefined) clearTossPaymentCache(reservationId);

    // 성공 리다이렉트: paymentKey/orderId/amount + 결제 요청 시 저장해둔 paymentId가 모두 있어야 승인 가능
    if (paymentKey && orderId && amount && paymentId !== undefined) {
      PaymentApproval(paymentId, {
        paymentKey,
        orderId,
        amount: Number(amount),
      })
        .then(() => {
          setResult({
            success: true,
            title: "계약 작성 및 입금이 완료되었습니다",
            description: "계약일부터 바로 이용을 시작하실 수 있습니다",
          });
        })
        .catch((error) => {
          console.error("Toss payment approval failed:", error);
          setResult({
            success: false,
            title: "결제에 실패했습니다",
            description: "결제 정보를 확인한 후 다시 시도해주시기 바랍니다",
          });
        });
      return;
    }

    // 실패/취소 리다이렉트
    setResult({
      success: false,
      title: "결제에 실패했습니다",
      description: "결제 정보를 확인한 후 다시 시도해주시기 바랍니다", // 그냥 결제 실패와 취소를 구분할 수 없으므로 같은 메시지로 처리하는 게 맞을 듯하다.
    });
  }, []);

  return (
    <Modal
      isOpen={!!result}
      title={result?.title ?? ""}
      description={result?.description}
      iconVariant={result?.success ? "check" : "warning"}
      singleButton
      confirmLabel="확인"
      onConfirm={() => setResult(null)}
    />
  );
};

const RouteModeSync = () => {
  const { pathname } = useLocation();
  const mode = useAuthStore((s) => s.mode);
  const setMode = useAuthStore((s) => s.setMode);

  useEffect(() => {
    // /host/* 직접 접근 시 헤더 모드를 URL에 맞게 동기화
    // 현재 모드와 같으면 스킵하는 방어 추가
    const nextMode = pathname.startsWith("/host") ? "HOST" : "GUEST";
    if (nextMode !== mode) setMode(nextMode);
  }, [pathname]);

  return null;
};

// SPA 라우팅은 브라우저 기본 페이지 이동과 달리 스크롤 위치를 그대로 유지한다.
// 검색 결과 화면에서 스크롤을 내려 헤더의 pill이 뜬 상태로 로고/nav 등을 눌러
// 다른 페이지로 이동하면, 이동한 페이지도 스크롤이 내려간 채로 보이던 문제.
//
// pathname만 보면 안 되는 이유: "/"와 "/explore" 둘 다 ExplorePage를 그대로
// 렌더링하고, 게스트 메인 로고·"공간탐색" NavLink도 목적지가 "/"라서 - 검색
// 결과 화면(예: "/?keyword=...")에서 그 버튼을 눌러 빈 "/"로 돌아가도
// pathname("/")은 그대로라 안 바뀐다. 대신 실제 이동 방식(navigationType)으로
// 구분한다: 로고/nav 클릭 같은 실제 페이지 이동은 PUSH, ExplorePage가 필터
// 바뀔 때 URL만 갱신하는 setSearchParams는 REPLACE를 쓰므로(스크롤 유지가
// 자연스러움) 대상에서 제외하고, 뒤로/앞으로가기(POP)도 브라우저 기본 스크롤
// 복원을 존중해 건드리지 않는다.
const ScrollToTopOnNavigate = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "PUSH") {
      window.scrollTo(0, 0);
    }
  }, [location.key, navigationType]);

  return null;
};

export const MainLayout = () => (
  // overflow-x-clip: Banner의 -mx-[50vw] w-screen full-bleed가 스크롤바 너비만큼
  // 뷰포트를 넘겨 가로 스크롤을 유발하므로, 뷰포트 폭인 이 루트에서 그 여분만 잘라낸다.
  <div className="bg-bg flex min-h-screen flex-col overflow-x-clip">
    <Header />
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-6">
      <Outlet />
    </main>
    <Footer />
    <MobileBottomNav />
    <LoginModal />
    <SessionBootstrap />
    <PendingActionExecutor />
    <RouteModeSync />
    <ScrollToTopOnNavigate />
    <OAuthCallbackHandler />
    <TossPaymentResultHandler />
  </div>
);
