import { useState, useEffect } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import kakaoIcon from "@/features/guest-explore/icons/Kakao.png";
import naverIcon from "@/features/guest-explore/icons/Naver.png";
import passIcon from "@/features/guest-explore/icons/PASS.png";
import tossIcon from "@/features/guest-explore/icons/Toss.png";
import { GetVerificationStatus, RequestVerification } from "@/features/guest-explore/api/my_reservation_api";

interface AuthenticationProps {
  onVerified?: (identityVerificationId: string) => Promise<void>;
  onIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const Authentication = ({ onVerified, onIsAuthenticated }: AuthenticationProps) => {
  const [status, setStatus] = useState<"idle" | "checking" | "pending" | "done" | "error">("checking");

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

  // PortOne 인증 완료 직후 서버 확정 반영이 약간 지연될 수 있어, 실패 시 잠시 뒤 상태를 재조회해 확인한다.
  const pollVerificationStatus = async (retries = 3, delayMs = 1500): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      try {
        const { isVerified } = await GetVerificationStatus();
        if (isVerified) return true;
      } catch {
        // 재조회 실패는 무시하고 다음 시도로 넘어간다.
      }
    }
    return false;
  };

  const handleVerify = async () => {
    if (status === "pending" || status === "done") return;
    setStatus("pending");

    const identityVerificationId = `identity-verification-${crypto.randomUUID()}`;

    const response = await PortOne.requestIdentityVerification({
      storeId: import.meta.env.VITE_PORTONE_STORE_ID,
      channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY,
      identityVerificationId,
      redirectUrl: window.location.href,
    });

    if (response?.code !== undefined) {
      setStatus("error");
      return;
    }

    try {
      await RequestVerification({ identityVerificationId });
      await onVerified?.(identityVerificationId);
      setStatus("done");
      onIsAuthenticated(true); // 인증 성공 처리
    } catch {
      // PortOne 인증 자체는 성공했지만, 서버에 인증 결과가 반영되기까지 약간의 지연이 있을 수 있어
      // 즉시 실패 처리하지 않고 상태를 재조회해 확인한 뒤 최종 실패 여부를 판단한다.
      const verified = await pollVerificationStatus();
      setStatus(verified ? "done" : "error");
      onIsAuthenticated(verified);
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
          <img src={naverIcon} alt="네이버" className="h-10 w-10 rounded-md"/>
          <img src={kakaoIcon} alt="카카오" className="h-10 w-10 rounded-md"/>
          <img src={passIcon} alt="PASS" className="h-10 w-10 rounded-md"/>
          <img src={tossIcon} alt="토스" className="h-10 w-10 rounded-md border border-border"/>
        </div>

        <span className="text-text-primary shrink-0 text-sm font-medium">
          {status === "checking" && "확인 중..."}
          {status === "pending" && "인증 중..."}
          {status === "done" && "인증 완료"}
          {status === "error" && "다시 시도"}
          {status === "idle" && "간편인증 하기"}
        </span>
      </button>
    </div>
  );
};

export default Authentication;
