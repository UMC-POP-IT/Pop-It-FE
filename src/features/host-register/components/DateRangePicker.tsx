import { useState } from "react";

// 요일 헤더 (일~토)
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 두 날짜가 '같은 날'인지 확인 (년·월·일 비교)
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Date → "2026-06-21" 문자열로 (store에 저장할 형식)
const toYmd = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getCalendarDays = (base: Date): Date[] => {
  const year = base.getFullYear();
  const month = base.getMonth();
  const startOffset = new Date(year, month, 1).getDay(); // 그 달 1일이 무슨 요일? (0은 일요일)
  const gridStart = new Date(year, month, 1 - startOffset); // 1일에서 그 요일 만큼 앞으로 당김
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
};

interface DateRangePickerProps {
  onConfirm: (start: string, end: string) => void; // 확인 누르면 부모(store)에 전달
}

export const DateRangePicker = ({ onConfirm }: DateRangePickerProps) => {
  // 지금 보는 '왼쪽 달' (2개월 중 첫 달)
  const [viewDate, setViewDate] = useState(new Date());
  // 선택한 범위 (아직 없으면 null)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSelectDate = (date: Date) => {
    // 시작이 없거나, 이미 범위를 다 골랐으면 → 새로 시작
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
    // 그 외 → 종료일로 확정
    setEndDate(date);
  };

  //날짜 칸 하이라이트
  const getDayClassName = (date: Date, base: Date) => {
    const isCurrentMonth = date.getMonth() === base.getMonth();

    // 시작일 또는 종료일 → 파란 동그라미
    if (
      (startDate && isSameDay(date, startDate)) ||
      (endDate && isSameDay(date, endDate))
    ) {
      return "bg-primary text-white rounded-md";
    }
    // 시작~종료 사이 → 연한 파랑
    if (startDate && endDate && date > startDate && date < endDate) {
      return "bg-primary-light text-text-primary";
    }
    // 이번 달이 아니면(앞뒤 달 날짜) 흐리게
    return isCurrentMonth ? "text-text-primary" : "text-text-disabled";
  };

  // 한 달치 달력 JSX를 만든다 (base = 그릴 달)
  const renderMonth = (base: Date) => (
    <div className="flex flex-col gap-3">
      {/* 월 표시 (예: 2026.06) */}
      <div className="text-text-primary text-center text-lg font-bold">
        {base.getFullYear()}.{String(base.getMonth() + 1).padStart(2, "0")}
      </div>
      {/* 요일 줄 */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-text-secondary py-2 text-center text-sm"
          >
            {day}
          </span>
        ))}
      </div>
      {/* 날짜 42칸 */}
      <div className="grid grid-cols-7">
        {getCalendarDays(base).map((date) => (
          <button
            type="button"
            key={date.toISOString()}
            onClick={() => handleSelectDate(date)}
            className={`py-2 text-sm ${getDayClassName(date, base)}`}
          >
            {date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );

  const nextMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    1,
  );

  // 월 이동
  const goPrev = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const goNext = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  return (
    <div className="border-border rounded-lg border bg-white p-4">
      <div className="flex items-start gap-4">
        {/* 이전 달 */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="이전 달"
          className="text-text-primary px-2 text-xl"
        >
          ‹
        </button>

        {/* 2개월 나란히 */}
        {renderMonth(viewDate)}
        {renderMonth(nextMonth)}

        {/* 다음 달 */}
        <button
          type="button"
          onClick={goNext}
          aria-label="다음 달"
          className="text-text-primary px-2 text-xl"
        >
          ›
        </button>
      </div>

      {/* 선택된 범위 표시 + 확인 버튼 */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-text-primary text-sm">
          {startDate ? toYmd(startDate) : "시작일"} ~{" "}
          {endDate ? toYmd(endDate) : "종료일"}
        </span>
        <button
          type="button"
          disabled={!(startDate && endDate)}
          onClick={() => {
            if (startDate && endDate)
              onConfirm(toYmd(startDate), toYmd(endDate));
          }}
          className="bg-primary rounded-lg px-6 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;
