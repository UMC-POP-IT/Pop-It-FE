import { useMemo, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export interface UnavailablePeriod {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
}

interface HostReservationCalendarProps {
  unavailablePeriods?: UnavailablePeriod[];
}

const parseDate = (str: string) => {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const BOOKING_WINDOW_DAYS = 90;

const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isUnavailable = (date: Date, periods: UnavailablePeriod[], today: Date) => {
  const todayOnly = toDateOnly(today);
  const maxDate = new Date(todayOnly);
  maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS);

  // 과거 또는 오늘, 90일 이후는 예약 불가
  if (date <= todayOnly || date > maxDate) return true;

  return periods.some(({ startDate, endDate }) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    return date >= start && date <= end;
  });
};

const HostReservationCalendar = ({
  unavailablePeriods = [],
}: HostReservationCalendarProps) => {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const gridStart = new Date(year, month, 1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      return date;
    });
  }, [viewDate]);

  const getDayClassName = (date: Date) => {
    const isCurrentMonth = date.getMonth() === viewDate.getMonth();
    if (!isCurrentMonth) return "text-text-disabled";
    if (isUnavailable(date, unavailablePeriods, today)) {
      return "text-white bg-[#d0d0d0] rounded-full";
    }
    if (isSameDay(date, today)) {
      return "text-primary font-bold";
    }
    return "text-text-primary";
  };

  return (
    <div className="flex w-[488px] shrink-0 flex-col gap-4 rounded-xl bg-[#F6FAFF] p-5">
      <div className="border-primary flex w-fit items-center justify-center border-b py-1">
        <h3 className="text-text-primary text-xl font-bold">예약 현황</h3>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-4 w-4 rounded-full bg-[#d0d0d0]" />
          <span className="text-text-secondary">예약 불가</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-4 w-4 rounded-full bg-white border border-[#d0d0d0]" />
          <span className="text-text-secondary">예약 가능</span>
        </div>
      </div>

      <div className="flex flex-col gap-7 rounded-lg bg-white px-3.5 py-5">
        {/* 월 네비게이션 */}
        <div className="flex w-full items-center justify-center gap-3">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() =>
              setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
            }
            className="text-text-primary flex h-8 w-8 items-center justify-center text-xl"
          >
            ‹
          </button>
          <span className="text-text-primary text-xl font-bold">
            {viewDate.getFullYear()}.{String(viewDate.getMonth() + 1).padStart(2, "0")}
          </span>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() =>
              setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
            }
            className="text-text-primary flex h-8 w-8 items-center justify-center text-xl"
          >
            ›
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* 요일 헤더 */}
          <div className="flex items-center">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="text-text-primary flex w-[60px] items-center justify-center py-2 text-sm"
              >
                {day}
              </span>
            ))}
          </div>

          {/* 날짜 그리드 — 선택 불가 */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date) => (
              <span
                key={date.toISOString()}
                className={`flex w-full items-center justify-center p-3 text-base font-bold select-none ${getDayClassName(date)}`}
              >
                {date.getDate()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostReservationCalendar;
