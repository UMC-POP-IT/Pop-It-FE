import { useEffect, useId, useRef, useState } from "react";
import { useOutsideClick } from "@/shared/hooks/useOutsideClick";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  /** 고른 값만 넘긴다 (네이티브 select가 아니라 ChangeEvent가 없다) */
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 바깥 <label htmlFor>와 잇기 위한 id — button도 label이 가리킬 수 있는 요소다 */
  id?: string;
  className?: string;
}

/**
 * 선택 목록 (은행 등).
 *
 * 네이티브 <select>를 쓰지 않는 이유: 열렸을 때 목록을 OS가 그려서 CSS가 닿지 않는다.
 * 시안은 입력칸 아래에 카드가 펼쳐지는 모양이라 button + 목록을 직접 만든다.
 *
 * 직접 만든 만큼 네이티브가 공짜로 주던 것들을 손으로 채워야 한다:
 *  - 역할 알림: combobox / listbox / option + aria-selected
 *  - 키보드: ↓↑ 이동, Enter 선택, Esc 닫기, Tab으로 나가면 닫기
 *  - 바깥 클릭으로 닫기, 닫힐 때 포커스를 트리거로 되돌리기
 */
const Select = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  id,
  className = "",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // 키보드로 훑는 중인 항목. 마우스만 쓰면 -1로 둬도 되지만,
  // 열 때 현재 값에 맞춰두면 ↓를 눌렀을 때 다음 항목부터 이어진다
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const selected = options.find((opt) => opt.value === value);

  const close = (restoreFocus = true) => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const open = () => {
    if (disabled) return;
    setIsOpen(true);
    // 이미 고른 값이 있으면 거기서부터, 없으면 첫 항목부터
    setActiveIndex(options.findIndex((opt) => opt.value === value));
  };

  const select = (optionValue: string) => {
    onChange(optionValue);
    close();
  };

  // 바깥 클릭으로 닫기 — 사용자가 이미 다른 곳으로 갔으므로 포커스는 되돌리지 않는다
  useOutsideClick(containerRef, () => close(false), isOpen);

  // 키보드로 옮긴 항목이 목록 밖으로 나가면 따라 스크롤한다.
  // 8개가 다 안 보이고 5개까지만 보이므로(max-h) 이게 없으면 커서를 놓친다
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      // 닫힌 상태에서 여는 키들 (네이티브 select와 같은 조작감)
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        open();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0) select(options[activeIndex].value);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        // Tab은 막지 않는다 — 다음 요소로 넘어가되 목록만 닫는다
        close(false);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        // 포커스는 이 버튼에 계속 남아 있고 목록으로 옮기지 않는다.
        // 그래서 "지금 훑고 있는 항목"을 알리는 aria-activedescendant도 목록이 아니라
        // 포커스를 가진 이 요소에 붙어야 스크린리더가 읽는다
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        className={`border-divider focus:border-primary focus:ring-primary flex h-14 w-full items-center justify-between rounded-lg border bg-white px-5 text-left text-lg font-medium transition-colors focus:ring-2 focus:outline-none ${
          disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
        } ${selected ? "text-text-primary" : "text-text-placeholder"} ${className}`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        {/* 열리면 화살표가 위를 본다 */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        // 입력칸 아래 8px에 카드로 펼친다. absolute라 아래 필드를 밀지 않는다.
        // max-h는 항목 5개(56×5) + 위아래 여백 — 그보다 많으면 목록만 스크롤된다
        <ul
          id={listboxId}
          role="listbox"
          className="border-divider absolute top-full right-0 left-0 z-20 mt-2 max-h-[296px] overflow-y-auto rounded-lg border bg-white py-2 shadow-lg"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                id={`${listboxId}-${i}`}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                role="option"
                aria-selected={isSelected}
                onClick={() => select(opt.value)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex h-14 cursor-pointer items-center px-5 text-lg transition-colors ${
                  activeIndex === i ? "bg-tag-bg" : ""
                } ${isSelected ? "text-primary font-bold" : "text-text-primary font-medium"}`}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
