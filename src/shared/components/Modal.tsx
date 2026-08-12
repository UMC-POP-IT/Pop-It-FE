import { useId, type ReactNode } from "react";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";
import iconCheckBigSized from "@/assets/icons/icon_check_big_sized.svg";
import iconWarningBigSized from "@/assets/icons/icon_warn_big_sized.svg";

interface ModalProps {
  isOpen: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true면 확인 버튼 하나만 표시 */
  singleButton?: boolean;
  /** check: 상단에 파란 체크 아이콘 표시, warning: 상단에 느낌표 회색 아이콘 표시 */
  iconVariant?: "check" | "warning";
  /** true면 처리 중으로 보고 확인·취소 버튼과 백드롭·Escape 닫기를 모두 막는다 */
  confirmDisabled?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const Modal = ({
  isOpen,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  singleButton = false,
  iconVariant,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ModalProps) => {
  const titleId = useId();
  const dialogRef = useDialogA11y<HTMLDivElement>({
    isOpen,
    // 처리 중에는 Escape로도 닫히지 않도록 닫기 핸들러를 떼어 둔다
    onClose: confirmDisabled ? undefined : onCancel,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={confirmDisabled ? undefined : onCancel}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex w-full max-w-[328px] flex-col items-center gap-10 overflow-y-auto rounded-xl bg-white p-5 max-h-[calc(100dvh-2rem)] md:max-w-[590px] md:p-0 md:py-8"
      >
        <div className="flex flex-col items-center gap-5">
          {/* 체크 아이콘 (Figma 기준: icon_check_big_sized) */}
          {iconVariant === "check" && (
            <img
              src={iconCheckBigSized}
              alt=""
              className="h-[72px] w-[72px]"
            />
          )}
          {iconVariant === "warning" && (
            <img
              src={iconWarningBigSized}
              alt=""
              className="h-[72px] w-[72px]"
            />
          )}

          <div className="flex flex-col items-center gap-2 text-center">
            <h3
              id={titleId}
              className="text-text-primary text-[22px] font-bold whitespace-pre-line break-keep"
            >
              {title}
            </h3>

            {description && (
              <div className="text-text-tertiary text-base font-medium whitespace-pre-line break-keep">
                {description}
              </div>
            )}
          </div>
        </div>

        {singleButton ? (
          onConfirm && (
            <button
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="bg-primary-hover hover:bg-primary h-14 w-[clamp(172px,_161.41px_+_2.941vw,_184px)] rounded-lg text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          )
        ) : (
          <div className="flex w-full flex-row items-center gap-4 md:w-auto md:gap-5">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={confirmDisabled}
                className="bg-surface-blue text-text-primary hover:bg-primary-light h-14 flex-1 rounded-lg text-lg font-medium disabled:cursor-not-allowed disabled:opacity-50 md:w-[184px] md:flex-none"
              >
                {cancelLabel}
              </button>
            )}
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={confirmDisabled}
                className="bg-primary-hover hover:bg-primary h-14 flex-1 rounded-lg text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 md:w-[184px] md:flex-none"
              >
                {confirmLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
