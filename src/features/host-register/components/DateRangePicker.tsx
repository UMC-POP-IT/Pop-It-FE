import { useState, useRef, useEffect, useId } from "react";
import calendarIcon from "@/assets/icons/icon_calendar.svg";

// 요일 헤더 (일~토)
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 두 날짜가 '같은 날'인지 확인 (년·월·일 비교)
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Date → "2026-06-21" (store 저장용)
const toYmd = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// "2026-06-21" → 로컬 시간대 기준 Date (날짜만 있는 문자열의 UTC 파싱 버그 방지)
const parseYmd = (ymd: string): Date => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d); // 로컬 자정 (month는 0부터라 -1)
};

// Date → "2026.06.21" (화면 표시용)
const toDisplay = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
};

// 어떤 '달(base)'의 달력 42칸(6주×7일) 날짜 배열
const getCalendarDays = (base: Date): Date[] => {
  const year = base.getFullYear();
  const month = base.getMonth();
  const startOffset = new Date(year, month, 1).getDay(); // 그 달 1일의 요일 (0=일)
  const gridStart = new Date(year, month, 1 - startOffset); // 1일에서 요일만큼 앞으로
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
};

interface DateRangePickerProps {
  initialStart?: string; // store에 저장된 시작일 ("2026-06-21")
  initialEnd?: string; // store에 저장된 종료일
  onConfirm: (start: string, end: string) => void; // 확인 시 부모(store)에 전달
}

export const DateRangePicker = ({
  initialStart,
  initialEnd,
  onConfirm,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false); // 달력 팝업 열림/닫힘
  // 시작일·종료일 버튼이 같은 팝업을 가리키도록 id를 하나만 만들어 공유한다
  const popupId = useId();
  // 저장된 시작일이 있으면 그 달을 먼저 보여줌 (없으면 이번 달)
  const [viewDate, setViewDate] = useState(
    initialStart ? parseYmd(initialStart) : new Date(),
  );
  // 선택 범위 (store 값이 있으면 그걸로 초기화 — 로컬 시간대로 안전 파싱)
  const [startDate, setStartDate] = useState<Date | null>(
    initialStart ? parseYmd(initialStart) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    initialEnd ? parseYmd(initialEnd) : null,
  );
  const containerRef = useRef<HTMLDivElement>(null); // 달력 전체를 가리키는 리모컨
  // 팝업을 연 필드 버튼 — 닫을 때 여기로 포커스를 되돌린다
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // 달력이 열려있을 때만: 바깥 클릭 / Esc 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus(); // 팝업이 사라지기 전에 포커스를 트리거로 되돌림
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      // 클릭이 달력(container) 밖이면 닫기
      // (사용자가 다른 곳으로 이동한 것이므로 포커스는 되돌리지 않는다)
      if (
        containerRef.current &&
        e.target instanceof Node &&
        !containerRef.current.contains(e.target)
      ) {
        if (startDate && endDate) {
          onConfirm(toYmd(startDate), toYmd(endDate));
        }
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    // 뒷정리: 닫히거나 언마운트될 때 감지 해제
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, startDate, endDate, onConfirm]);

  // 시작일 기준 '최대 3개월'을 넘는 날짜인지 (계약 한도)
  const isOverLimit = (date: Date) =>
    !!startDate &&
    date >
      new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 3,
        startDate.getDate(),
      );

  const handleSelectDate = (date: Date) => {
    // 시작이 없거나 이미 범위를 다 골랐으면 → 새로 시작
    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }
    // 시작일보다 앞을 누르면 → 그걸 새 시작으로
    if (date < startDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }
    if (isOverLimit(date)) return; // 3개월 초과면 종료일로 못 고름
    setEndDate(date);
  };

  // 날짜 칸 색칠
  const getDayClassName = (date: Date, base: Date) => {
    const isCurrentMonth = date.getMonth() === base.getMonth();
    // 시작일만 선택 (종료일 아직) → 연파랑 완전 원
    if (startDate && !endDate && isSameDay(date, startDate)) {
      return "bg-primary-100 rounded-full text-text-primary";
    }
    // 범위 완성 → 시작=왼쪽반원, 종료=오른쪽반원, 중간=채움 (예약 달력 스타일 통일)
    if (startDate && endDate) {
      // 시작일 = 종료일 (하루만 선택) → 완전한 원 (반원 안 잘리게)
      if (isSameDay(startDate, endDate) && isSameDay(date, startDate)) {
        return "bg-primary-100 rounded-full text-text-primary";
      }
      if (isSameDay(date, startDate)) {
        return "bg-primary-100 rounded-l-full text-text-primary";
      }
      if (isSameDay(date, endDate)) {
        return "bg-primary-100 rounded-r-full text-text-primary";
      }
      if (date > startDate && date < endDate) {
        return "bg-primary-light text-text-primary";
      }
    }
    return isCurrentMonth ? "text-text-primary" : "text-text-disabled";
  };

  // 확인 → store에 저장하고 팝업 닫기
  const handleConfirm = () => {
    if (startDate && endDate) {
      onConfirm(toYmd(startDate), toYmd(endDate));
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const nextMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    1,
  );
  const goPrev = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const goNext = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  // 한 달치 달력 JSX
  const renderMonth = (base: Date) => (
    // flex-1: 두 달이 팝업 안에서 폭을 반씩 나눠 갖는다 (칸 크기를 직접 정하지 않는다)
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      {/* 월 표시 (예: 2026.06) — 피그마 20px/700 #121212 */}
      <div className="text-text-primary mb-1 text-center text-xl font-bold">
        {base.getFullYear()}.{String(base.getMonth() + 1).padStart(2, "0")}
      </div>
      {/* 요일 줄 */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-text-secondary flex h-9 w-full items-center justify-center text-sm font-medium"
          >
            {day}
          </span>
        ))}
      </div>
      {/* 날짜 42칸 */}
      <div className="grid grid-cols-7">
        {getCalendarDays(base).map((date) => {
          // 다른 달 날짜(회색) 또는 종료일 고르는 중 3개월 초과 → 비활성(클릭 X)
          const isOtherMonth = date.getMonth() !== base.getMonth();
          const disabled =
            isOtherMonth || (!!startDate && !endDate && isOverLimit(date));
          // 선택된 날(시작·종료·범위 안)인지 → 스크린리더용 aria-pressed
          const isSelected =
            (!!startDate && isSameDay(date, startDate)) ||
            (!!endDate && isSameDay(date, endDate)) ||
            (!!startDate && !!endDate && date > startDate && date < endDate);
          return (
            <button
              type="button"
              key={date.toISOString()}
              disabled={disabled}
              aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}
              aria-pressed={isSelected}
              onClick={() => handleSelectDate(date)}
              className={`flex h-10 w-full items-center justify-center text-base font-medium ${getDayClassName(date, base)} ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  // 필드에 보여줄 텍스트
  const fieldText = (d: Date | null, placeholder: string) =>
    d ? toDisplay(d) : placeholder;

  return (
    <div
      className="relative"
      ref={containerRef}
    >
      {/* 시작일 / 종료일 필드 (클릭하면 달력 팝업 열림) */}
      {/* 피그마: 필드 387 + gap 20 + 필드 387 = 본문 794 */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { date: startDate, label: "시작일" },
          { date: endDate, label: "종료일" },
        ].map((field) => (
          <button
            key={field.label}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={popupId}
            onClick={(e) => {
              triggerRef.current = e.currentTarget; // 방금 누른 버튼을 기억
              setIsOpen((v) => !v);
            }}
            className="border-divider flex h-14 items-center gap-2 rounded-lg border bg-white px-5 text-lg font-bold"
          >
            <img
              src={calendarIcon}
              alt=""
              className="h-8 w-8"
            />

            {/* 피그마: 미선택 #808080, 선택 후 #121212 (둘 다 18px/700) */}
            <span
              className={
                field.date ? "text-text-primary" : "text-text-secondary"
              }
            >
              {fieldText(field.date, field.label)}
            </span>
          </button>
        ))}
      </div>

      {/* 달력 팝업 (isOpen일 때만, 필드 아래에 떠 있음)
          inset-x-0: 팝업 폭을 위 필드 두 개(= 본문 폭)와 같게 맞춘다.
          폭을 고정하면 본문(794px)을 넘겨 오른쪽으로 삐져나온다 */}
      {isOpen && (
        <div
          id={popupId}
          role="dialog"
          aria-label="계약 가능 기간 선택"
          className="border-border absolute inset-x-0 z-10 mt-2 overflow-hidden rounded-lg border bg-white shadow-lg"
        >
          {/* 달력 영역 — 화살표 · 이번 달 · 다음 달 · 화살표 */}
          <div className="flex items-start gap-4 px-3.5 py-5">
            <button
              type="button"
              onClick={goPrev}
              aria-label="이전 달"
              className="text-text-primary mt-1 flex h-9 w-6 shrink-0 items-center justify-center text-2xl"
            >
              ‹
            </button>
            {renderMonth(viewDate)}
            {renderMonth(nextMonth)}
            <button
              type="button"
              onClick={goNext}
              aria-label="다음 달"
              className="text-text-primary mt-1 flex h-9 w-6 shrink-0 items-center justify-center text-2xl"
            >
              ›
            </button>
          </div>

          {/* 선택 범위 + 확인 — 피그마: padding 20, 우측 정렬, 버튼 94×52 */}
          <div className="flex items-center justify-between p-5">
            {/* 피그마: 20px/700 #121212 */}
            <span className="text-text-primary text-xl font-bold">
              {fieldText(startDate, "시작일")} ~ {fieldText(endDate, "종료일")}
            </span>
            <button
              type="button"
              disabled={!(startDate && endDate)}
              onClick={handleConfirm}
              className="bg-primary-hover flex h-[52px] w-[94px] shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white disabled:opacity-40"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
