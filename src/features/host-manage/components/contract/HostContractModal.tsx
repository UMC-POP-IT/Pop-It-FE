import { useState, useRef } from "react";
import type { ApiHostReservation } from "@/types";
import Authentication from "@/features/guest-explore/components/contract/Authentication";
import SignatureBoard, { type SignatureBoardRef } from "@/features/guest-explore/components/contract/SignatureBoard";
import { formatHostDate, getDurationDays } from "@/features/host-manage/utils/dateUtils";
import {
  GetPresignedURL,
  UploadFileToPresignedURL,
  SubmitSignature,
} from "@/features/guest-explore/api/my_reservation_api";

interface SpaceBasicInfo {
  name: string;
  address: string;
}

interface HostContractModalProps {
  isOpen: boolean;
  reservation: ApiHostReservation;
  space: SpaceBasicInfo;
  onClose: () => void;
  onComplete: () => void;
}

const HostContractModal = ({
  isOpen,
  reservation,
  space,
  onClose,
  onComplete,
}: HostContractModalProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const signatureBoardRef = useRef<SignatureBoardRef>(null);

  const handleComplete = async () => {
    const signatureBlob = await signatureBoardRef.current?.getSignatureBlob();
    if (!signatureBlob) return;
    setIsSubmitting(true);
    setSubmitError(false);
    try {
      const { uploads } = await GetPresignedURL({
        uploadType: "CONTRACT_SIGNATURE",
        files: [{ contentType: "image/png" }],
      });
      const { presignedUrl, fileUrl } = uploads[0];
      const signatureFile = new File([signatureBlob], `signature_${reservation.reservationId}_host.png`, { type: "image/png" });
      await UploadFileToPresignedURL(presignedUrl, signatureFile);
      await SubmitSignature(reservation.reservationId, { signatureUrl: fileUrl });
      onComplete();
    } catch (err) {
      console.error("[HostContractModal] 서명 제출 실패:", err);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const { startDate, endDate, totalPrice } = reservation;
  const days = getDurationDays(startDate, endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={isSubmitting ? undefined : onClose} aria-hidden={true} />
      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-[590px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col gap-10 overflow-y-auto p-5 md:p-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-[22px] font-bold break-keep text-[#121212]">단기 임대차 계약서</h3>
            <span className="text-[18px] font-medium break-keep text-[#747474]">
              {`임대인(이하 "호스트")과 임차인(이하 "게스트")은 공간 중개 플랫폼 '팝잇'을 통하여 다음과 같이 단기 공간 임대차 계약을 체결하며, 본 계약서에 기재된 임대 조건에 상호 합의합니다.`}
            </span>
          </div>

          <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 text-[16px]">
                <div className="flex justify-between">
                  <span className="text-[#747474]">공간</span>
                  <span className="font-bold text-[#121212]">{space.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#747474]">주소</span>
                  <span className="font-bold text-[#121212]">{space.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#747474]">기간</span>
                  <span className="font-bold text-[#121212]">
                    {formatHostDate(startDate)} ~ {formatHostDate(endDate)} ({days}일)
                  </span>
                </div>
              </div>

              <div className="h-px bg-[#d9d9d9]" />

              <div className="flex flex-col gap-2 text-[16px]">
                <div className="flex justify-between">
                  <span className="text-[#747474]">임대료</span>
                  <span className="font-bold text-[#121212]">{totalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#747474]">보증금(에스크로)</span>
                  <span className="font-bold text-[#121212]">{Math.round(totalPrice * 0.2).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#747474]">단기 공간 보험료 5% 적용</span>
                  <span className="font-bold text-[#121212]">{Math.round(totalPrice * 0.05).toLocaleString()}원</span>
                </div>
              </div>

              <div className="h-px bg-[#d9d9d9]" />

              <div className="flex justify-between text-[22px] font-bold text-[#121212]">
                <span>총 결제 금액</span>
                <span>
                  {(totalPrice + Math.round(totalPrice * 0.2) + Math.round(totalPrice * 0.05)).toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-[#f2f2f2] p-5">
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-bold text-[#3783f7]">제 1조(목적)</span>
                <span className="text-[14px] break-keep text-[#747474]">
                  호스트는 상기 공간을 게스트에게 단기 임대하며, 게스트는 약정된 용도로만 사용합니다.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-bold text-[#3783f7]">제 2조(보증금)</span>
                <span className="text-[14px] break-keep text-[#747474]">
                  보증금은 에스크로 계좌에 안전하게 보관되며, 퇴실 시 공간 상태 점검 후 이상이 없을 경우 전액 환불됩니다.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-bold text-[#3783f7]">제 3조(원상복구)</span>
                <span className="text-[14px] break-keep text-[#747474]">
                  게스트 사용 종료 시 공간을 입주 전 상태로 원상복구해야 합니다.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-bold text-[#3783f7]">제 4조(보험)</span>
                <span className="text-[14px] break-keep text-[#747474]">
                  단기 공간 보험은 임대 기간 중 우발적 사고로 인한 손해를 보장합니다.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-bold text-[#3783f7]">제 5조(이웃 화합)</span>
                <span className="text-[14px] break-keep text-[#747474]">
                  게스트는 소음, 대기열, 쓰레기 관리 등 이웃 화합 가이드를 준수해야 합니다.
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-bold text-[#3783f7]">제 6조(결제 및 정산)</span>
                <span className="text-[14px] break-keep text-[#747474]">
                  본 계약에 따른 대금 결제, 에스크로 보관 및 호스트에 대한 최종 정산은 '팝잇'의 플랫폼 이용 약관 및 정책에 따릅니다.
                </span>
              </div>
            </div>
          </div>

          <Authentication onIsAuthenticated={setIsAuthenticated} />
          <SignatureBoard ref={signatureBoardRef} onIsSigned={setIsSigned} />

          {submitError && (
            <p role="alert" className="text-sm font-medium text-[#f74b4b]">
              서명 제출에 실패했습니다. 잠시 후 다시 시도해주세요.
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4 md:gap-5">
            <button
              className="h-14 w-[136px] rounded-lg bg-[#f0f6fe] text-[18px] font-medium text-[#121212] disabled:cursor-not-allowed disabled:opacity-50 md:w-[184px]"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              className="h-14 w-[136px] rounded-lg bg-[#3783f7] text-[18px] font-bold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 md:w-[184px]"
              disabled={!(isAuthenticated && isSigned) || isSubmitting}
              onClick={handleComplete}
            >
              {isSubmitting ? "제출 중..." : "작성 완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostContractModal;
