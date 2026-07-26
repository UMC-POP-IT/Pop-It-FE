import { useMemo, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface ExploreReservationCardProps {
  dayCost: number;
  onLoginRequired?: () => void;
}

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dow = WEEKDAYS[date.getDay()];
  return `${y}.${m}.${d} (${dow})`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const diffDays = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;

const ExploreReservationCard = ({ dayCost, onLoginRequired }: ExploreReservationCardProps) => {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const gridStart = new Date(year, month, 1 - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [viewDate]);

  const handleSelectDate = (date: Date) => {
    if (onLoginRequired) {
      onLoginRequired();
      return;
    }
    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }
    if (date < startDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }
    setEndDate(date);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const totalDays = startDate && endDate ? diffDays(startDate, endDate) : 0;
  const totalPrice = totalDays * dayCost;

  const getDayClassName = (date: Date) => {
    const isCurrentMonth = date.getMonth() === viewDate.getMonth();

    if (startDate && !endDate && isSameDay(date, startDate)) {
      return "bg-primary-100 rounded-full text-text-primary";
    }
    if (startDate && endDate) {
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

  return (
    <div className="flex w-[488px] shrink-0 items-center rounded-xl bg-[#F6FAFF] p-5">
      <div className="flex w-full flex-col gap-6">
        <div className="border-primary flex w-fit items-center justify-center border-b py-1">
          <h3 className="text-text-primary text-xl font-bold">예약하기</h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* 시작일 / 종료일 */}
          <div className="flex items-center justify-center gap-10 rounded-lg bg-white px-8 py-2">
            <span className="text-text-primary text-base font-bold">
              {startDate ? formatDate(startDate) : "시작일 선택"}
            </span>
            <span className="bg-border h-[22px] w-px" />
            <span className="text-text-primary text-base font-bold">
              {endDate ? formatDate(endDate) : "종료일 선택"}
            </span>
          </div>

          {/* 달력 */}
          <div className="flex flex-col gap-7 rounded-lg bg-white px-3.5 py-5">
            <div className="flex w-full items-center justify-center gap-1">
              <button
                type="button"
                aria-label="이전 달"
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
                  )
                }
                className="text-text-primary flex h-8 w-8 items-center justify-center text-xl"
              >
                ‹
              </button>
              <span className="text-text-primary text-xl font-bold">
                {viewDate.getFullYear()}.
                {String(viewDate.getMonth() + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
                  )
                }
                className="text-text-primary flex h-8 w-8 items-center justify-center text-xl"
              >
                ›
              </button>
            </div>

            <div className="flex flex-col gap-3">
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

              <div className="grid grid-cols-7">
                {calendarDays.map((date) => (
                  <button
                    type="button"
                    key={date.toISOString()}
                    onClick={() => handleSelectDate(date)}
                    className={`flex w-full items-center justify-center p-3 text-base font-bold ${getDayClassName(date)}`}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-6">
          <div className="text-text-primary flex w-full flex-col items-end gap-1">
            <div className="flex w-full items-center justify-between">
              <span className="text-base">예약 기간:</span>
              <span className="text-xl font-bold">
                {totalDays > 0 ? `${totalDays}일` : "-"}
              </span>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-base whitespace-nowrap">예상 가격:</span>
              <span className="text-xl font-bold whitespace-nowrap">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          <div className="flex w-full items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="border-primary-hover text-primary-hover flex h-[52px] w-[94px] items-center justify-center rounded-lg border bg-white text-lg font-bold"
            >
              초기화
            </button>
            <button
              type="button"
              disabled={!(startDate && endDate)}
              className="bg-primary-hover flex h-[52px] flex-1 items-center justify-center rounded-lg text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              예약 요청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreReservationCard;
