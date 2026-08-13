import { useId, useRef, useState } from "react";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";

interface ReservationRequestModalProps {
  isOpen: boolean;
  guestName: string;
  /** 시작일/종료일이 아직 선택되지 않은 경우 undefined일 수 있다 */
  periodLabel?: string;
  /** 클라이언트에서 계산한 대여료 예상치. 보험료·보증금이 포함된 실제 총 결제 금액이 아니므로
   * "총 금액"이 아닌 "대여료(예상)"으로만 안내한다. 실제 총액은 요청 성공 응답으로 완료 모달에서 보여준다. */
  estimatedRentalFee: number;
  isSubmitting: boolean;
  submitError?: string | null;
  onCancel: () => void;
  onSubmit: (usagePurpose: string) => void;
}

const ReservationRequestModal = ({
  isOpen,
  guestName,
  periodLabel,
  estimatedRentalFee,
  isSubmitting,
  submitError,
  onCancel,
  onSubmit,
}: ReservationRequestModalProps) => {
  const [usagePurpose, setUsagePurpose] = useState("");
  const [showValidationError, setShowValidationError] = useState(false);
  const titleId = useId();
  const textareaId = useId();
  const validationErrorId = useId();
  const submitErrorId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useDialogA11y<HTMLDivElement>({
    isOpen,
    onClose: isSubmitting ? undefined : onCancel,
    initialFocusRef: textareaRef,
  });

  if (!isOpen) return null;

  const describedByIds =
    [showValidationError ? validationErrorId : null, submitError ? submitErrorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

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
            <span className="font-medium">{periodLabel ?? "-"}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-text-tertiary w-20 shrink-0">임대료:</span>
            <span className="font-medium">{estimatedRentalFee.toLocaleString()} 원</span>
          </div>
        </div>
        <p className="text-text-tertiary -mt-4 text-xs">
          보험료·보증금은 제외된 금액이에요. 실제 결제 예정 금액은 요청 완료 후 안내돼요.
        </p>

        <div className="flex flex-col gap-2">
          <label htmlFor={textareaId} className="text-text-primary text-base font-bold">
            사업 설명
          </label>
          <textarea
            id={textareaId}
            ref={textareaRef}
            value={usagePurpose}
            onChange={(e) => {
              setUsagePurpose(e.target.value);
              if (showValidationError) setShowValidationError(false);
            }}
            placeholder="운영하실 팝업 또는 사업의 내용을 간략히 설명해주세요. 호스트가 검토 후 승인합니다."
            rows={4}
            aria-required="true"
            aria-invalid={showValidationError}
            aria-describedby={describedByIds}
            // Focus 시 테두리 색만 파란색(primary)으로 바꾸고 두께(border-2)는 Default와 동일하게
            // 유지한다. ring을 쓰면 테두리 바깥에 링이 추가로 그려져 Default보다 두꺼워 보이므로
            // (Input.tsx와 동일한 이유로) 여기서는 border 색상 전환만 사용한다.
            // 다만 오류 상태는 테두리 색이 focus 전후로 그대로(danger)라 색 변화만으로는 포커스
            // 위치를 알 수 없어, 그 경우에만 예외적으로 ring을 남긴다.
            className={`text-text-primary placeholder:text-text-placeholder resize-none rounded-lg border-2 bg-white p-3 text-sm transition-colors focus:outline-none ${
              showValidationError
                ? "border-danger focus:ring-danger focus:ring-2"
                : "border-divider focus:border-primary"
            }`}
          />
          {showValidationError && (
            <span id={validationErrorId} role="alert" className="text-danger text-xs">
              예약 요청을 위해 사업 설명을 입력해 주세요.
            </span>
          )}
          {submitError && (
            <span id={submitErrorId} role="alert" className="text-danger text-xs">
              {submitError}
            </span>
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
