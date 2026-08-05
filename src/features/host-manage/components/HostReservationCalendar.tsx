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

  // 오늘 포함 이전 날짜, 90일 이후는 예약 불가
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

  const isCurrentMonth =
    viewDate.getFullYear() === today.getFullYear() &&
    viewDate.getMonth() === today.getMonth();

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

  return (
    <div className="flex w-full max-w-[488px] shrink-0 flex-col gap-[24px] rounded-[12px] bg-[#f6faff] p-[20px] drop-shadow-[0px_2px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-[28px] rounded-[8px] bg-white px-[14px] py-[20px]">
        {/* 월 네비게이션 */}
        <div className="flex w-full items-center justify-center gap-[12px]">
          {/* 이전 달: 현재 달이면 숨김 */}
          {isCurrentMonth ? (
            <div className="h-[32px] w-[32px]" />
          ) : (
            <button
              type="button"
              aria-label="이전 달"
              onClick={() =>
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
              }
              className="flex h-[32px] w-[32px] items-center justify-center"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
                <path d="M7 1L1 7L7 13" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <span className="flex gap-[4px] text-[20px] font-bold text-[#121212]">
            <span>{viewDate.getFullYear()}</span>
            <span>.</span>
            <span>{String(viewDate.getMonth() + 1).padStart(2, "0")}</span>
          </span>

          <button
            type="button"
            aria-label="다음 달"
            onClick={() =>
              setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
            }
            className="flex h-[32px] w-[32px] items-center justify-center"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
              <path d="M1 1L7 7L1 13" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-[12px]">
          {/* 요일 헤더 */}
          <div className="flex w-full items-center">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="flex flex-1 items-center justify-center py-[8px] text-[14px] font-medium text-[#121212]"
              >
                {day}
              </span>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid w-full grid-cols-7">
            {calendarDays.map((date) => {
              const isCurrentMonth = date.getMonth() === viewDate.getMonth();

              // 다른 달 날짜: 빈 셀
              if (!isCurrentMonth) {
                return (
                  <div key={date.toISOString()} className="h-[46px]" />
                );
              }

              const unavailable = isUnavailable(date, unavailablePeriods, today);
              const isToday = isSameDay(date, today);

              return (
                <div
                  key={date.toISOString()}
                  className="flex items-center justify-center p-[12px]"
                >
                  <span aria-hidden="true" className={`text-[16px] font-bold select-none ${
                      unavailable
                        ? "text-[#121212] opacity-25"
                        : isToday
                          ? "text-[#0564f5]"
                          : "text-[#121212]"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <span className="sr-only">
                    {date.getDate()}일 {unavailable ? "예약 불가" : "예약 가능"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostReservationCalendar;
