import Button from "./Button";

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
  onConfirm: () => void;
  onCancel: () => void;
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
      <div className="relative z-10 flex w-80 flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-xl">
        {/* 체크 아이콘 */}
        {showCheckIcon && (
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full">
            <svg
              width="24"
              height="24"
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

        <h3 className="text-text-primary text-base font-bold whitespace-pre-line">
          {title}
        </h3>

        {description && (
          <p className="text-text-secondary text-sm">{description}</p>
        )}

        {singleButton ? (
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        ) : (
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
