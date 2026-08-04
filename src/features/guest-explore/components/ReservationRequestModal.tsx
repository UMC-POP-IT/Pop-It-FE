import { useId, useRef, useState } from "react";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";

interface ReservationRequestModalProps {
  isOpen: boolean;
  guestName: string;
  periodLabel: string;
  totalPrice: number;
  isSubmitting: boolean;
  submitError?: string | null;
  onCancel: () => void;
  onSubmit: (usagePurpose: string) => void;
}

const ReservationRequestModal = ({
  isOpen,
  guestName,
  periodLabel,
  totalPrice,
  isSubmitting,
  submitError,
  onCancel,
  onSubmit,
}: ReservationRequestModalProps) => {
  const [usagePurpose, setUsagePurpose] = useState("");
  const [showValidationError, setShowValidationError] = useState(false);
  const titleId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useDialogA11y<HTMLDivElement>({
    isOpen,
    onClose: isSubmitting ? undefined : onCancel,
    initialFocusRef: textareaRef,
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!usagePurpose.trim()) {
      setShowValidationError(true);
      return;
    }
    setShowValidationError(false);
    onSubmit(usagePurpose.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (isSubmitting) return;
          onCancel();
        }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex w-[590px] flex-col gap-6 rounded-xl bg-white p-8"
      >
        <h3 id={titleId} className="text-text-primary text-[22px] font-bold">
          예약 요청
        </h3>

        <div className="text-text-primary flex flex-col gap-2 text-base">
          <div className="flex gap-4">
            <span className="text-text-tertiary w-20 shrink-0">게스트:</span>
            <span className="font-medium">{guestName}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-text-tertiary w-20 shrink-0">기간:</span>
            <span className="font-medium">{periodLabel}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-text-tertiary w-20 shrink-0">총 금액:</span>
            <span className="font-medium">{totalPrice.toLocaleString()} 원</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-base font-bold">사업 설명</span>
          <textarea
            ref={textareaRef}
            value={usagePurpose}
            onChange={(e) => {
              setUsagePurpose(e.target.value);
              if (showValidationError) setShowValidationError(false);
            }}
            placeholder="운영하실 팝업 또는 사업의 내용을 간략히 설명해주세요. 호스트가 검토 후 승인합니다."
            rows={4}
            className={`text-text-primary placeholder:text-text-placeholder resize-none rounded-lg border-2 bg-white p-3 text-sm transition-colors focus:outline-none focus:ring-2 ${
              showValidationError
                ? "border-danger focus:ring-danger"
                : "border-divider focus:border-primary focus:ring-primary"
            }`}
          />
          {showValidationError && (
            <span className="text-danger text-xs">
              예약 요청을 위해 사업 설명을 입력해 주세요.
            </span>
          )}
          {submitError && (
            <span className="text-danger text-xs">{submitError}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-tag-bg text-text-tertiary h-14 flex-1 rounded-lg text-lg font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            돌아가기
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary-hover flex h-14 flex-1 items-center justify-center rounded-lg text-lg font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "요청 중..." : "요청하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationRequestModal;
