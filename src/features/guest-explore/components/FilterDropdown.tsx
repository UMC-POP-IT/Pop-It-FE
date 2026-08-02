import { useRef, useState } from "react";
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

// 옵션 한 줄의 대략적인 높이(px) - maxVisibleOptions로 패널 높이를 계산할 때 쓴다.
const OPTION_ROW_HEIGHT = 48;

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
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => setIsOpen(false), isOpen);

  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex cursor-pointer items-center gap-2 rounded-lg bg-tag-bg px-4 py-3 text-lg text-text-primary transition-colors hover:bg-tag-bg/80 focus:ring-primary focus:outline-none focus:ring-2 ${
          isOpen ? "ring-primary ring-2" : ""
        }`}
      >
        <span>{selected?.label}</span>
        <Chevron open={isOpen} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="border-divider absolute top-full left-0 z-20 mt-2 w-max min-w-full overflow-y-auto rounded-xl border-2 bg-white p-2 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8d8d8] [&::-webkit-scrollbar-track]:bg-transparent"
          style={
            maxVisibleOptions
              ? { maxHeight: maxVisibleOptions * OPTION_ROW_HEIGHT }
              : undefined
          }
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value || "all"} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
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
