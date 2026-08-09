import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useOutsideClick } from "@/shared/hooks/useOutsideClick";

export interface FilterDropdownOption<T extends string> {
  value: T;
  label: string;
}

interface FilterDropdownProps<T extends string> {
  ariaLabel: string;
  options: FilterDropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /**
   * 지정하면 그 개수만큼만 옵션을 보여주고 나머지는 스크롤로 접근한다.
   * (예: [지역] 드롭다운 - 25개 구 중 일부만 노출하고 스크롤)
   */
  maxVisibleOptions?: number;
  /**
   * 트리거 버튼을 커스텀 렌더링한다(예: 히어로 검색바의 "라벨 위 / 값 아래"
   * 2줄 세그먼트 형태). 지정하지 않으면 기본 pill 트리거(label + Chevron)를 쓴다.
   * 열림/닫힘 상태, 키보드/외부 클릭 처리 등 나머지 동작은 그대로 재사용된다.
   */
  renderTrigger?: (args: { selected: FilterDropdownOption<T> | undefined; isOpen: boolean }) => ReactNode;
  /** 기본 pill 트리거 대신 renderTrigger를 쓸 때 버튼에 적용할 className */
  triggerClassName?: string;
}

// 옵션 버튼 한 줄의 실제 높이(px) - py-3(24px) + text-lg 기본 줄높이(28px).
// maxVisibleOptions로 패널 높이를 계산할 때 쓴다.
const OPTION_ROW_HEIGHT = 52;
// <ul>에 적용된 p-2(위아래 8px씩)만큼도 높이 예산에 더해야 마지막 옵션 줄이
// 잘리지 않는다 - 이걸 빼먹으면 maxVisibleOptions만큼 다 안 보이고 스크롤이
// 먼저 발생해버린다.
const LIST_PADDING_Y = 16;

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FilterDropdown = function <T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
  maxVisibleOptions,
  renderTrigger,
  triggerClassName,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  // 키보드로 옵션 사이를 이동할 때 현재 포커스가 가 있는 옵션의 인덱스.
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

  // value가 options에 없는 경우(현재는 그런 경로가 없지만, 추후 URL
  // 쿼리에서 필터를 복원하는 기능이 붙으면 잘못된 값이 들어올 수 있다)
  // options[0]("전체")로 조용히 폴백하면 실제 필터 조건과 트리거에 보이는
  // 라벨이 어긋난다. 그런 상황에서는 라벨을 비워 보여줘서 문제를 드러낸다.
  const selected = options.find((option) => option.value === value);

  // 열릴 때 선택된 옵션으로 포커스를 옮기고, 이후 activeIndex가 바뀔 때마다
  // (화살표 키 이동) 실제 DOM 포커스도 함께 옮긴다. setActiveIndex 업데이터
  // 안에서 직접 focus()를 호출하면 impure해지므로 여기 effect로 분리한다.
  useEffect(() => {
    if (isOpen) {
      optionRefs.current[activeIndex]?.focus();
    }
  }, [isOpen, activeIndex]);

  const openDropdown = () => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const closeAndReturnFocus = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const moveActiveIndex = (delta: 1 | -1) => {
    setActiveIndex((prev) => {
      return (prev + delta + options.length) % options.length;
    });
  };

  const handleListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActiveIndex(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActiveIndex(-1);
        break;
      case "Escape":
        e.preventDefault();
        closeAndReturnFocus();
        break;
      case "Tab":
        // preventDefault를 호출하지 않아 브라우저가 포커스를 다음 요소로
        // 자연스럽게 옮기게 두고, 패널만 닫는다. 열린 채로 Tab이 나가면
        // useOutsideClick(mousedown 전용)이 감지하지 못해 패널이 화면에
        // 계속 떠 있게 되는 문제를 막는다.
        setIsOpen(false);
        break;
      // Enter/Space는 각 옵션이 실제 <button>이라 브라우저 기본 동작으로
      // 이미 onClick이 호출된다 - 별도 처리가 필요 없다.
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
        className={
          renderTrigger
            ? triggerClassName
            : `flex cursor-pointer items-center gap-2 rounded-lg bg-tag-bg px-4 py-3 text-lg text-text-primary transition-colors hover:bg-tag-bg/80 focus:ring-primary focus:outline-none focus:ring-2 ${
                isOpen ? "ring-primary ring-2" : ""
              }`
        }
      >
        {renderTrigger ? (
          renderTrigger({ selected, isOpen })
        ) : (
          <>
            <span>{selected?.label}</span>
            <Chevron open={isOpen} />
          </>
        )}
      </button>

      {isOpen && (
        <ul
          role="menu"
          aria-label={ariaLabel}
          onKeyDown={handleListKeyDown}
          className="border-divider absolute top-full left-0 z-20 mt-2 w-max min-w-full overflow-y-auto rounded-xl border-2 bg-white p-2 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8d8d8] [&::-webkit-scrollbar-track]:bg-transparent"
          style={
            maxVisibleOptions
              ? {
                  maxHeight:
                    maxVisibleOptions * OPTION_ROW_HEIGHT + LIST_PADDING_Y,
                }
              : undefined
          }
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value || "all"} role="none">
                <button
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    closeAndReturnFocus();
                  }}
                  className={`w-full cursor-pointer rounded-lg px-4 py-3 text-left text-lg whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-tag-bg text-text-primary font-bold"
                      : "text-text-primary hover:bg-tag-bg/60"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FilterDropdown;
