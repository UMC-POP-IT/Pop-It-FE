  import { useState, useEffect, useRef } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { GetVerificationStatus, RequestVerification } from "@/features/guest-explore/api/my_reservation_api";
import { pollVerificationStatus } from "@/features/guest-explore/utils/verificationPolling";
import { PENDING_CONTRACT_RESERVATION_KEY } from "@/features/guest-explore/utils/contractSession";
import PASS_ICON from "@/features/guest-explore/icons/pass.svg";

interface AuthenticationProps {
  reservationId: number;
  onVerified?: (identityVerificationId: string) => Promise<void>;
  onIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const Authentication = ({ reservationId, onVerified, onIsAuthenticated }: AuthenticationProps) => {
  const [status, setStatus] = useState<"idle" | "checking" | "pending" | "done" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // polling 도중 컴포넌트가 언마운트되면 이후 상태/콜백 갱신을 막기 위한 플래그
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isStale = false;

    const checkVerificationStatus = async () => {
      try {
        const { isVerified } = await GetVerificationStatus();
        if (isStale) return;

        if (isVerified) { // 이미 인증된 상태라면 인증 절차 없이 바로 완료 처리
          setStatus("done");
          onIsAuthenticated(true);
        } else {
          setStatus("idle");
          onIsAuthenticated(false);
        }
      } catch {
        if (isStale) return;
        setStatus("error");
        onIsAuthenticated(false);
      }
    };
    checkVerificationStatus();

    return () => {
      isStale = true;
    };
  }, [onIsAuthenticated]);

  const handleVerify = async () => {
    if (status === "pending" || status === "done") return;
    setStatus("pending");
    setErrorMessage(null);

    const identityVerificationId = `identity-verification-${crypto.randomUUID()}`;

    // 모바일에서는 PASS 인증이 팝업이 아닌 페이지 리다이렉트로 진행되어 이 지점 이후 코드가
    // 실행되지 못한 채 페이지가 새로고침될 수 있다. 복귀 후 어떤 예약의 계약서 모달을
    // 다시 열어야 하는지 알 수 있도록 리다이렉트 전에 reservationId를 남겨둔다.
    sessionStorage.setItem(PENDING_CONTRACT_RESERVATION_KEY, String(reservationId));

    let response;
    try {
      response = await PortOne.requestIdentityVerification({
        storeId: import.meta.env.VITE_PORTONE_STORE_ID,
        channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
        identityVerificationId,
        redirectUrl: window.location.href,
        bypass: {
          inicisUnified: {
            flgFixedUser: "N",
            directAgency: "PASS"
          }
        }
      });
    } catch (error) {
      // 실패를 response.code로 알려주지 않고 프로미스 자체를 reject하는 경우가 있다
      // (예: 인증창 호출 자체가 막힌 경우). catch 없이 두면 status가 "pending"에 멈추고
      // pendingContractReservationId도 지워지지 않아 사용자가 재시도할 수 없게 된다.
      console.error("[Authentication] PortOne 본인인증 호출 실패:", error);
      sessionStorage.removeItem(PENDING_CONTRACT_RESERVATION_KEY);
      setStatus("error");
      setErrorMessage("본인인증 창을 여는 데 실패했습니다. 다시 시도해주세요.");
      onIsAuthenticated(false);
      return;
    }

    // 이 지점에 도달했다는 것은 리다이렉트 없이(팝업/아이프레임 방식) 현재 페이지에서
    // 프로미스가 그대로 resolve됐다는 뜻이므로, 복귀 처리용 플래그는 더 이상 필요 없다.
    sessionStorage.removeItem(PENDING_CONTRACT_RESERVATION_KEY);

    if (response?.code !== undefined) {
      setStatus("error");
      return;
    }

    try {
      await RequestVerification({ identityVerificationId });
    } catch (error) {
      // 원인 진단용: 409가 "이미 인증됨"인지 "identityVerificationId 중복"인지 등은
      // 서버가 내려주는 status/code/message로만 구분할 수 있다.
      const { status: httpStatus, code, message } = error as { status?: number; code?: string; message?: string };
      console.error("[Authentication] RequestVerification 실패:", { httpStatus, code, message, identityVerificationId });

      // PortOne 인증 자체는 성공했지만, 서버에 인증 결과가 반영되기까지 약간의 지연이 있을 수 있어
      // 즉시 실패 처리하지 않고 상태를 재조회해 확인한 뒤 최종 실패 여부를 판단한다.
      const verified = await pollVerificationStatus(() => !isMountedRef.current);
      if (!isMountedRef.current) return; // 언마운트 이후 도착한 응답으로 상태를 갱신하지 않음
      if (!verified) {
        setStatus("error");
        // 서버 message는 "API error: 500" / "Failed to fetch" 같은 기술적 문자열이 섞여 올 수 있어
        // 화면에는 고정 문구만 노출하고, 진단은 위 console.error에 남긴 값으로 한다.
        setErrorMessage("본인인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        onIsAuthenticated(false);
        return;
      }
    }

    try {
      await onVerified?.(identityVerificationId);
      setStatus("done");
      onIsAuthenticated(true); // 인증 성공 처리
    } catch {
      // 서버 인증 반영과 무관한 완료 콜백 자체의 실패이므로 재조회로 처리하지 않는다.
      setStatus("error");
      onIsAuthenticated(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-text-primary text-xl font-bold rounded-sm">통합 본인 인증</h4>

      <button
        type="button"
        onClick={handleVerify}
        disabled={status === "checking" || status === "pending" || status === "done"}
        className="border-border flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 disabled:cursor-not-allowed hover:bg-bg"
      >
        <div className="flex items-center gap-1">
          <img src={PASS_ICON} alt="PASS" className="h-[46px] w-[146px]"/>
        </div>

        <span className="text-grey-700 shrink-0 text-sm font-medium">
          {status === "checking" && "확인 중..."}
          {status === "pending" && "인증 중..."}
          {status === "done" && "인증 완료"}
          {status === "error" && "다시 시도"}
          {status === "idle" && "간편인증 하기"}
        </span>
      </button>

      {status === "error" && errorMessage && (
        <span role="alert" className="text-sm text-red-500">{errorMessage}</span>
      )}
    </div>
  );
};

export default Authentication;
