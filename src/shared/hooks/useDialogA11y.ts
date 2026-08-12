import { useEffect, useLayoutEffect, useRef } from "react";

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

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement as HTMLElement | null;

    // 렌더되지 않은 요소는 목록에서 뺀다.
    // display:none인 요소는 브라우저가 포커스를 주지 않으므로, 목록에 남아 있으면
    // 반응형으로 한 벌만 보이는 모달에서 first/last가 숨겨진 버튼이 된다.
    // (HostRegisterStart는 모바일용·데스크톱용 버튼을 2벌 두고 lg 기준으로 한 벌씩 숨긴다.
    //  데스크톱에서 first가 lg:hidden인 모바일 닫기 버튼이라 초기 포커스가 무효가 되고,
    //  last도 숨겨진 모바일 버튼이라 아래 Tab 순환의 active === last가 성립하지 않아
    //  포커스가 딤 뒤 헤더·푸터로 새어나갔다.)
    //
    // 판정에 getClientRects()를 쓰는 이유 — "실제로 그려진 상자가 있는가"만 보기 때문이다.
    //   display:none        → 상자 없음 → 제외 (의도한 동작)
    //   position:fixed      → 상자 있음 → 유지
    //   sr-only (1x1px)     → 상자 있음 → 유지 (PhotoVerificationModal의 파일 input)
    // offsetParent !== null은 position:fixed 요소도 null이라 보이는 버튼까지 걸러내므로 쓰지 않는다.
    const getFocusable = () => {
      const node = dialogRef.current;
      if (!node) return [];
      return Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.getClientRects().length > 0);
    };

    const initialTarget =
      initialFocusRef?.current ?? getFocusable()[0] ?? dialogRef.current;
    // preventScroll: 포커스 대상이 스크롤 영역 아래쪽에 있을 때 브라우저가 자동으로
    // 그 위치까지 스크롤해버려 대화상자가 맨 위가 아닌 곳부터 보이는 것을 방지한다.
    initialTarget?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // capture 단계에서 전파를 끊어, 현재 이 훅을 쓰는 대화상자가 Escape를 온전히 소유하도록 한다.
        // 지금은 중첩 모달이나 모달 내부의 자체 Escape 처리 위젯(드롭다운/데이트피커 등)이 없어 문제되지 않지만,
        // 그런 요소가 추가되면 가장 안쪽(마지막에 열린) 대화상자만 반응하도록 트랩 우선순위를 다시 검토해야 한다.
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
