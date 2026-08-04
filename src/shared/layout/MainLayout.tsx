import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Modal from "@/shared/components/Modal";
import { LoginModal } from "@/shared/components/LoginModal";
import { useAuthStore } from "@/store/authStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { handleOAuthCallback, switchMode, getCurrentUser } from "@/shared/utils/oauth";
import { PaymentApproval } from "@/features/guest-explore/api/my_reservation_api";
import { TOSS_PENDING_PAYMENT_KEY } from "@/features/guest-explore/components/contract/TossPayments";

// 새로고침 시 authStore의 user는 초기화되지만 localStorage의 토큰은 남아있으므로,
// 앱 시작 시 토큰이 있으면 /users/me로 로그인 상태를 복원한다.
const SessionBootstrap = () => {
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;
    getCurrentUser()
      .then((user) => {
        const isHostPath = window.location.pathname.startsWith("/host");
        login(isHostPath ? { ...user, currentMode: "HOST" } : user);
      })
      .catch(() => {
        // accessToken/refreshToken 모두 만료 등 복원 실패 → 남은 토큰 정리
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      });
  }, [login]);

  return null;
};

const PendingActionExecutor = () => {
  const user = useAuthStore((s) => s.user);
  const pendingAction = useAuthStore((s) => s.pendingAction);
  const clearPendingAction = useAuthStore((s) => s.clearPendingAction);
  const setMode = useAuthStore((s) => s.setMode);
  const { handleWishToggle } = useWishGuard();
  const navigate = useNavigate();

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
        switchMode(pendingAction.targetMode)
          .then(() => {
            setMode(pendingAction.targetMode);
            navigate(pendingAction.navigateTo);
          })
          .catch((err: unknown) => {
            const status = (err as { status?: number }).status;
            if (status === 400) {
              // 호스트 미등록 → 호스트 등록 안내 페이지로
              navigate("/host/host-register");
            }
          });
        break;
    }
    clearPendingAction();
    // navigate·setMode·clearPendingAction은 안정적 참조(stable ref)이고, handleWishToggle은
    // pendingAction 처리 시점에 한 번만 실행하면 되므로 deps에서 제외
  }, [user, pendingAction]); // eslint-disable-line react-hooks/exhaustive-deps

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
        login(user);
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
    if (pendingRaw) {
      try {
        const parsed = JSON.parse(pendingRaw);
        if (typeof parsed?.paymentId === "number") {
          paymentId = parsed.paymentId;
        }
      } catch (error) {
        console.error("Failed to parse pending payment info:", error);
      }
    }

    // 성공 리다이렉트: paymentKey/orderId/amount + 결제 요청 시 저장해둔 paymentId가 모두 있어야 승인 가능
    if (paymentKey && orderId && amount && paymentId !== undefined) {
      PaymentApproval(paymentId, { paymentKey, orderId, amount: Number(amount) })
        .then(() => {
          setResult({
            success: true,
            title: "계약 작성 및 결제가 완료되었습니다",
            description: "계약일부터 바로 이용을 시작하실 수 있습니다",
          });
        })
        .catch((error) => {
          console.error("Toss payment approval failed:", error);
          setResult({
            success: false,
            title: "결제 처리에 실패했습니다",
            description: "결제 승인에 실패했습니다. 잠시 후 다시 시도해주세요.",
          });
        });
      return;
    }

    // 실패/취소 리다이렉트
    setResult({
      success: false,
      title: "결제에 실패했습니다",
      description: params.get("message") ?? "결제가 취소되었거나 실패했습니다.",
    });
  }, []);

  return (
    <Modal
      isOpen={!!result}
      title={result?.title ?? ""}
      description={result?.description}
      showCheckIcon={result?.success}
      singleButton
      confirmLabel="확인"
      onConfirm={() => setResult(null)}
    />
  );
};

const RouteModeSync = () => {
  const { pathname } = useLocation();
  const setMode = useAuthStore((s) => s.setMode);

  useEffect(() => {
    // /host/* 직접 접근 시 헤더 모드를 URL에 맞게 동기화
    setMode(pathname.startsWith("/host") ? "HOST" : "GUEST");
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export const MainLayout = () => (
  <div className="bg-bg flex min-h-screen flex-col">
    <Header />
    <main className="mx-auto w-full max-w-screen-xl flex-1 px-6 py-8">
      <Outlet />
    </main>
    <Footer />
    <LoginModal />
    <SessionBootstrap />
    <PendingActionExecutor />
    <RouteModeSync />
    <OAuthCallbackHandler />
    <TossPaymentResultHandler />
  </div>
);
