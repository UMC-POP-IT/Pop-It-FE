import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  // 키보드로 옵션 사이를 이동할 때 현재 포커스가 가 있는 옵션의 인덱스.
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

  const selected = options.find((option) => option.value === value) ?? options[0];

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
        className={`flex cursor-pointer items-center gap-2 rounded-lg bg-tag-bg px-4 py-3 text-lg text-text-primary transition-colors hover:bg-tag-bg/80 focus:ring-primary focus:outline-none focus:ring-2 ${
          isOpen ? "ring-primary ring-2" : ""
        }`}
      >
        <span>{selected?.label}</span>
        <Chevron open={isOpen} />
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
