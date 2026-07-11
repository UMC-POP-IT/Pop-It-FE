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
  onConfirm,
  onCancel,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div className="relative z-10 flex w-[590px] flex-col items-center gap-10 rounded-xl bg-white py-8">
        <div className="flex flex-col items-center gap-5">
          {/* 체크 아이콘 */}
          {showCheckIcon && (
            <div className="bg-primary-hover flex h-[72px] w-[72px] items-center justify-center rounded-full">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12L10 17L19 8"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-text-primary text-[22px] font-bold whitespace-pre-line">
              {title}
            </h3>

            {description && (
              <p className="text-text-tertiary whitespace-pre-line text-base font-medium">
                {description}
              </p>
            )}
          </div>
        </div>

        {singleButton ? (
          onConfirm && (
            <button
              onClick={onConfirm}
              className="bg-primary-hover h-14 w-[184px] rounded-lg text-lg font-medium text-white"
            >
              {confirmLabel}
            </button>
          )
        ) : (
          <div className="flex items-center gap-5">
            {onCancel && (
              <button
                onClick={onCancel}
                className="bg-tag-bg text-text-tertiary h-14 w-[184px] rounded-lg text-lg font-medium"
              >
                {cancelLabel}
              </button>
            )}
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="bg-primary-hover h-14 w-[184px] rounded-lg text-lg font-medium text-white"
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
