import { useId } from "react";
import Button from "@/shared/components/Button";
import type { GetPaymentInfoResponse, Reservation } from "@/features/guest-explore/api/my_reservation_api";
import { formatDate } from "@/shared/utils/date";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";
import shieldCheckIcon from "@/features/guest-explore/icons/shield-check.svg";

interface PaymentModalProps {
  isOpen: boolean;
  reservation: Reservation;
  agreedToGuide: boolean;
  onAgreedToGuideChange: (agreed: boolean) => void;
  onClose: () => void;
  onSignContract: () => void;
  paymentInfo: GetPaymentInfoResponse;
}

const PaymentModal = ({
  isOpen,
  reservation,
  agreedToGuide,
  onAgreedToGuideChange,
  onClose,
  onSignContract,
  paymentInfo
}: PaymentModalProps) => {
  const titleId = useId();
  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-[420px] flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 id={titleId} className="text-text-primary text-lg font-bold">결제 예정</h3>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">공간</span>
            <span className="text-text-primary font-medium">{reservation.space.buildingName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">기간</span>
            <span className="text-text-primary font-medium">
              {formatDate(reservation.startDate)} ~ {formatDate(reservation.endDate)} ({paymentInfo.period}일)
            </span>
          </div>
        </div>

        <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">임대료</span>
            <span className="text-text-primary font-medium">{paymentInfo.rentalFee.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">보증금(에스크로)</span>
            {/* TODO: 보증금 계산 로직 확정 후 반영 */}
            <span className="text-text-primary font-medium">{paymentInfo.deposit.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">단기 공간 보험료 5% 적용</span>
            {/* TODO: 보험료 계산 로직 확정 후 반영 */}
            <span className="text-text-primary font-medium">{paymentInfo.insuranceFee.toLocaleString()}원</span>
          </div>
        </div>

        <div className="border-border flex items-center justify-between border-t pt-4 font-bold">
          <span className="text-text-primary text-base">총 결제 금액</span>
          <span className="text-lg">{paymentInfo.totalPrice.toLocaleString()}원</span>
        </div>

        <div className="bg-secure-payment-bg flex gap-2 rounded-lg p-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-1">
              <img src={shieldCheckIcon} alt="보증금 및 보험 안내" className="h-5 w-5" />
              <span className="text-primary text-sm">안전 결제 안내</span>
            </div>
            <p className="text-text-secondary text-xs">
              보증금은 에스크로 계좌에서 안전하게 보관되며, 퇴실 시 공간 상태 확인 후 환불됩니다. 보험료는 단기 임대
              기간 중 발생할 수 있는 우발적 손해를 보장합니다.
            </p>
          </div>
        </div>

        <label className="text-text-secondary flex items-start gap-2 text-xs">
          <input
            type="checkbox"
            className="border-[#808080] checked:bg-primary mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-full border"
            checked={agreedToGuide}
            onChange={(e) => onAgreedToGuideChange(e.target.checked)}
          />
          이웃 화합가이드에 동의합니다. (소음 관리, 대기열 관리, 쓰레기 처리 등 이웃과의 조화로운 공존을 위한
          가이드라인을 준수합니다.)
        </label>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            className="flex-1 border-none! bg-secure-payment-bg! text-text-secondary! font-normal"
            onClick={onClose}
          >
            돌아가기
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 font-normal"
            disabled={!agreedToGuide}
            onClick={onSignContract}
          >
            계약서 서명하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
