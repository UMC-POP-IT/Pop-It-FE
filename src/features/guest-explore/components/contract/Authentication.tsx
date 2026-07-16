import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import kakaoIcon from "@/features/guest-explore/icons/Kakao.png";
import naverIcon from "@/features/guest-explore/icons/Naver.png";
import passIcon from "@/features/guest-explore/icons/PASS.png";
import tossIcon from "@/features/guest-explore/icons/Toss.png";

interface AuthenticationProps {
  onVerified?: (identityVerificationId: string) => Promise<void>;
}

const Authentication = ({ onVerified }: AuthenticationProps) => {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");

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
      await onVerified?.(identityVerificationId);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-text-primary text-xl font-bold rounded-sm">통합 본인 인증</h4>

      <button
        type="button"
        onClick={handleVerify}
        disabled={status === "pending" || status === "done"}
        className="border-border flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 disabled:cursor-not-allowed hover:bg-bg"
      >
        <div className="flex items-center gap-1">
          <img src={naverIcon} alt="네이버" className="h-10 w-10 rounded-md"/>
          <img src={kakaoIcon} alt="카카오" className="h-10 w-10 rounded-md"/>
          <img src={passIcon} alt="PASS" className="h-10 w-10 rounded-md"/>
          <img src={tossIcon} alt="토스" className="h-10 w-10 rounded-md border border-border"/>
        </div>

        <span className="text-text-primary shrink-0 text-sm font-medium">
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
