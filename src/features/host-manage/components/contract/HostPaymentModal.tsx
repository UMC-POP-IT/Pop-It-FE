import Button from "@/shared/components/Button";
import type { ApiHostReservation } from "@/types";
import { formatHostDate, getDurationDays } from "@/features/host-manage/utils/dateUtils";

interface SpaceBasicInfo {
  name: string;
  address: string;
}

interface HostPaymentModalProps {
  isOpen: boolean;
  reservation: ApiHostReservation;
  space: SpaceBasicInfo;
  agreedToGuide: boolean;
  onAgreedToGuideChange: (agreed: boolean) => void;
  isSubmitting?: boolean;
  submitError?: boolean;
  onClose: () => void;
  onSignContract: () => void;
}

const HostPaymentModal = ({
  isOpen,
  reservation,
  space,
  agreedToGuide,
  onAgreedToGuideChange,
  isSubmitting = false,
  submitError = false,
  onClose,
  onSignContract,
}: HostPaymentModalProps) => {
  if (!isOpen) return null;

  const { startDate, endDate, totalPrice } = reservation;
  const platformFee = Math.round(totalPrice * 0.1);
  const netAmount = totalPrice - platformFee;
  const days = getDurationDays(startDate, endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={isSubmitting ? undefined : onClose} />
      <div className="relative z-10 flex w-full max-w-[420px] flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-text-primary text-lg font-bold">입금 예정</h3>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">공간</span>
            <span className="text-text-primary font-medium">{space.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">기간</span>
            <span className="text-text-primary font-medium">
              {formatHostDate(startDate)} ~ {formatHostDate(endDate)} ({days}일)
            </span>
          </div>
        </div>

        <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">임대료</span>
            <span className="text-text-primary font-medium">{totalPrice.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">플랫폼 수수료 10%</span>
            <span className="text-text-primary font-medium">-{platformFee.toLocaleString()}원</span>
          </div>
        </div>

        <div className="border-border flex items-center justify-between border-t pt-4 font-bold">
          <span className="text-text-primary text-base">총 수령 금액</span>
          <span className="text-lg">{netAmount.toLocaleString()}원</span>
        </div>

        <div className="bg-secure-payment-bg flex gap-2 rounded-lg p-3">
          <div className="flex flex-col gap-1">
            <span className="text-primary text-sm font-medium">입금 안내</span>
            <p className="text-text-secondary text-xs break-keep">
              이용 완료된 건에 대한 정산은 영업일 기준 3~7일 소요됩니다. 주말 및 공휴일은 입금 기간에서
              제외되며, 정산 내역은 문자로 자동 발송됩니다. 문자를 받지 못하셨을 경우 호스트 센터로
              문의해주세요.
            </p>
          </div>
        </div>

        <label className="text-text-secondary flex items-start gap-2 text-xs break-keep">
          <input
            type="checkbox"
            className="border-[#808080] checked:bg-primary mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-full border"
            checked={agreedToGuide}
            onChange={(e) => onAgreedToGuideChange(e.target.checked)}
          />
          결제 및 정산 조건에 동의합니다. (플랫폼 수수료 10% 공제 및 영업일 기준 3~7일 후 입금되는 정산
          정책을 확인했습니다.)
        </label>

        {submitError && (
          <p role="alert" className="text-sm font-medium text-text-danger">
            예약 승인에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            className="flex-1 border-none! bg-secure-payment-bg! text-text-secondary! font-normal"
            onClick={onClose}
            disabled={isSubmitting}
          >
            돌아가기
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1 font-normal"
            disabled={!agreedToGuide || isSubmitting}
            onClick={onSignContract}
          >
            {isSubmitting ? "승인 중..." : "계약서 서명하기"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostPaymentModal;
