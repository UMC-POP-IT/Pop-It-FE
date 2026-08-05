import iconCheckBigSized from "@/assets/icons/icon_check_big_sized.svg";

interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true면 확인 버튼 하나만 표시 */
  singleButton?: boolean;
  /** true면 상단에 파란 체크 아이콘 표시 */
  showCheckIcon?: boolean;
  /** true면 확인 버튼을 비활성화 (예: 비동기 처리 중 중복 클릭 방지) */
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
  showCheckIcon = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={confirmDisabled ? undefined : onCancel}
      />
      <div className="relative z-10 flex w-[590px] flex-col items-center gap-10 rounded-xl bg-white py-8">
        <div className="flex flex-col items-center gap-5">
          {/* 체크 아이콘 */}
          {showCheckIcon && (
            <div className="flex h-[72px] w-[72px] items-center justify-center">
              <img
                src={iconCheckBigSized}
                alt=""
                className="h-[72px] w-[72px]"
              />
            </div>
          )}

          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-text-primary text-[22px] font-bold whitespace-pre-line">
              {title}
            </h3>

            {description && (
              <p className="text-text-tertiary text-base font-medium whitespace-pre-line">
                {description}
              </p>
            )}
          </div>
        </div>

        {singleButton ? (
          onConfirm && (
            <button
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="bg-primary-hover hover:bg-primary h-14 w-[184px] rounded-lg text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {confirmLabel}
            </button>
          )
        ) : (
          <div className="flex items-center gap-5">
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={confirmDisabled}
                className="bg-surface-blue text-text-primary hover:bg-primary-light h-14 w-[184px] rounded-lg text-lg font-medium disabled:cursor-not-allowed disabled:opacity-50"

              >
                {cancelLabel}
              </button>
            )}
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={confirmDisabled}
                className="bg-primary-hover hover:bg-primary h-14 w-[184px] rounded-lg text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
