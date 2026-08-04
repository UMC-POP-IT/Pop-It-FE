import { useEffect, type RefObject } from "react";

/**
 * ref로 감싼 영역 밖을 클릭했을 때 onOutsideClick을 호출한다.
 * 드롭다운/메뉴처럼 열려 있을 때만 감지가 필요한 UI를 위해 enabled로 리스너
 * 등록 여부를 제어한다(닫혀 있을 땐 매번 document에 리스너를 달지 않는다).
 */
export const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  enabled = true,
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;

      if (!ref.current.contains(e.target)) {
        onOutsideClick();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, onOutsideClick, enabled]);
};
