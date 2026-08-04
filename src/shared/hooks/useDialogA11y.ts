import { useEffect, useRef } from "react";

interface UseDialogA11yOptions {
  /** 대화상자가 열려 있는지 여부 */
  isOpen: boolean;
  /** Escape 키 입력 시 호출할 닫기 핸들러 (없으면 Escape는 무시됨) */
  onClose?: () => void;
  /** 열릴 때 포커스를 이동할 대상. 생략 시 대화상자 내 첫 포커스 가능 요소로 이동 */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 모달/대화상자 컴포넌트에 붙이는 접근성 훅.
 * - 열릴 때 지정된(또는 첫) 요소로 포커스 이동
 * - Tab/Shift+Tab 포커스 트랩
 * - Escape 키로 닫기
 * - 닫힌 뒤 대화상자를 열었던 트리거 요소로 포커스 복원
 *
 * 반환된 ref를 대화상자 컨테이너(role="dialog" 요소)에 연결해서 사용합니다.
 */
export const useDialogA11y = <T extends HTMLElement>({
  isOpen,
  onClose,
  initialFocusRef,
}: UseDialogA11yOptions) => {
  const dialogRef = useRef<T | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement as HTMLElement | null;

    const getFocusable = () => {
      const node = dialogRef.current;
      if (!node) return [];
      return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    };

    const initialTarget = initialFocusRef?.current ?? getFocusable()[0] ?? dialogRef.current;
    initialTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isInsideDialog = !!active && !!dialogRef.current?.contains(active);

      if (event.shiftKey) {
        if (!isInsideDialog || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!isInsideDialog || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      triggerRef.current?.focus?.();
    };
  }, [isOpen, initialFocusRef]);

  return dialogRef;
};

export default useDialogA11y;
