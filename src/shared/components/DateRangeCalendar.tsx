import { useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangeCalendarProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onConfirm: () => void;
  onReset?: () => void;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// 7일 x 6주 = 42칸으로 항상 고정한다. 5주로 끝나는 달이어도 뒤쪽을 빈 칸으로
// 채워 42칸을 유지해야, 6주까지 필요한 달로 이동해도 캘린더(팝오버) 높이가
// 그대로 유지되고 확인/초기화 버튼 위치가 달마다 위아래로 흔들리지 않는다.
const WEEKS_PER_MONTH_VIEW = 6;
const CELLS_PER_MONTH_VIEW = WEEKS_PER_MONTH_VIEW * 7;

/** 해당 월의 날짜 그리드(항상 42칸). 앞/뒤 다른 달에 해당하는 칸은 null(빈 칸)로 채운다. */
const getMonthCells = (year: number, month: number): (Date | null)[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = new Date(year, month, 1).getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length < CELLS_PER_MONTH_VIEW) cells.push(null);
  return cells;
};

/**
 * 2개월을 나란히 보여주는 날짜 범위 선택 캘린더.
 * 공간상세 예약 캘린더(ExploreReservationCard)와 같은 선택 상태 전이 규칙을
 * 쓰되(첫 클릭=시작일, 두번째 클릭=종료일, 시작일 이전 클릭 시 재시작),
 * 검색 필터용이라 특정 공간의 예약 가능 여부는 확인하지 않는다.
 */
const DateRangeCalendar = ({ value, onChange, onConfirm, onReset }: DateRangeCalendarProps) => {
  const todayStart = startOfToday();
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const secondViewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  // 오늘이 속한 달보다 과거로는 이동할 수 없다(ExploreReservationCard와 동일한 규칙).
  // 왼쪽 달이 이동 불가한 상태면 "이전 달" 화살표 자체를 렌더링하지 않는다.
  const currentMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const viewedMonthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const isPrevMonthDisabled = viewedMonthStart <= currentMonthStart;

  // 오늘로부터 90일 이후의 달로는 이동할 수 없다(공간상세 예약 캘린더와 동일한 규칙).
  // 오른쪽(다음) 달이 이미 그 상한 달이면 "다음 달" 화살표를 렌더링하지 않는다.
  const maxSelectableDate = new Date(todayStart);
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 90);
  const isNextMonthDisabled =
    secondViewDate.getFullYear() === maxSelectableDate.getFullYear() &&
    secondViewDate.getMonth() === maxSelectableDate.getMonth();

  const handleSelectDate = (date: Date) => {
    if (date < todayStart || date > maxSelectableDate) return;
    const { start, end } = value;
    if (!start || end) {
      onChange({ start: date, end: null });
      return;
    }
    if (date < start) {
      onChange({ start: date, end: null });
      return;
    }
    // 시작일 이후(또는 같은) 날짜를 두 번째로 클릭한 경우 - 시작일은 그대로 두고
    // 종료일만 확정한다. date가 시작일과 같으면(같은 날짜를 두 번 클릭) 하루만
    // 선택된 상태가 된다.
    onChange({ start, end: date });
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange({ start: null, end: null });
    }
  };

  // 오늘 이전이거나(과거) 오늘로부터 90일을 넘는 날짜는 선택할 수 없다
  // (공간상세 예약 캘린더와 동일한 규칙 - 회색 취소선으로 표시).
  const isDateDisabled = (date: Date) => date < todayStart || date > maxSelectableDate;

  // 공간상세 예약 캘린더(ExploreReservationCard)와 동일한 시스템: 시작일=종료일이
  // 아닌 기간을 선택했을 때만 칸 배경에 캡슐(이어지는 옅은 파란 배경)을 그린다.
  // 시작/종료 칸은 원의 세로 지름(칸 정중앙)까지만 배경을 채우고 반대쪽은 비워서
  // renderDayNumber가 그리는 꽉 찬 원 뒤로 배경이 삐져나오지 않게 한다.
  const getDayClassName = (date: Date) => {
    const { start, end } = value;
    if (isDateDisabled(date)) return "cursor-not-allowed";

    if (start && end && !isSameDay(start, end)) {
      if (isSameDay(date, start)) {
        return "text-text-primary bg-[linear-gradient(to_right,transparent_50%,var(--color-primary-100)_50%)]";
      }
      if (isSameDay(date, end)) {
        return "text-text-primary bg-[linear-gradient(to_right,var(--color-primary-100)_50%,transparent_50%)]";
      }
      if (date > start && date < end) {
        return "bg-primary-100 text-text-primary";
      }
    }
    return "text-text-primary";
  };

  const isSelectedEndpoint = (date: Date) => {
    const { start, end } = value;
    if (start && !end) return isSameDay(date, start);
    if (start && end) return isSameDay(date, start) || isSameDay(date, end);
    return false;
  };

  // 날짜 칸 안의 숫자: 선택됨(꽉 찬 원, 흰 글씨) > 오늘(옅은 테두리 원) >
  // 선택 불가(회색 취소선) > 기본. ExploreReservationCard의 renderDayNumber와 동일한 우선순위.
  const renderDayNumber = (date: Date) => {
    const day = date.getDate();

    if (isSelectedEndpoint(date)) {
      return (
        <span className="bg-primary relative z-10 flex aspect-square h-full shrink-0 items-center justify-center rounded-full text-white">
          {day}
        </span>
      );
    }
    if (isDateDisabled(date)) {
      return <span className="text-text-disabled line-through">{day}</span>;
    }
    if (isSameDay(date, todayStart)) {
      return (
        <span className="border-primary-100 relative z-10 flex aspect-square h-8 shrink-0 items-center justify-center rounded-full border text-text-primary">
          {day}
        </span>
      );
    }
    return day;
  };

  const renderMonth = (monthDate: Date, edge: "left" | "right") => {
    const cells = getMonthCells(monthDate.getFullYear(), monthDate.getMonth());

    return (
      <div className="flex w-[420px] flex-col items-center gap-7 px-3.5 py-5">
        <div className="flex w-full items-center justify-center gap-3">
          {/* 화살표 유무와 상관없이 "YYYY.MM" 라벨 위치가 고정되도록, 이동 불가
              방향이어도 자리(w-8)는 항상 비워둔다(ExploreReservationCard와 동일). */}
          <div className="flex h-8 w-8 items-center justify-center">
            {edge === "left" && !isPrevMonthDisabled && (
              <button
                type="button"
                aria-label="이전 달"
                onClick={() =>
                  setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
                }
                className="text-text-primary hover:bg-primary-light active:bg-primary-light flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xl transition-colors"
              >
                ‹
              </button>
            )}
          </div>
          <span className="text-text-primary text-xl font-bold">
            {monthDate.getFullYear()}.{String(monthDate.getMonth() + 1).padStart(2, "0")}
          </span>
          <div className="flex h-8 w-8 items-center justify-center">
            {edge === "right" && !isNextMonthDisabled && (
              <button
                type="button"
                aria-label="다음 달"
                onClick={() =>
                  setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
                }
                className="text-text-primary hover:bg-primary-light active:bg-primary-light flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xl transition-colors"
              >
                ›
              </button>
            )}
          </div>
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
            {cells.map((date, index) =>
              date ? (
                <button
                  type="button"
                  key={date.toISOString()}
                  onClick={() => handleSelectDate(date)}
                  disabled={isDateDisabled(date)}
                  aria-pressed={isSelectedEndpoint(date)}
                  className={`relative box-border flex h-[46px] w-[60px] cursor-pointer items-center justify-center border-0 p-0 text-base font-bold disabled:cursor-not-allowed ${getDayClassName(date)}`}
                >
                  {renderDayNumber(date)}
                </button>
              ) : (
                <span key={`blank-${index}`} className="h-[46px] w-[60px]" aria-hidden="true" />
              ),
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-label="날짜 범위 선택"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onConfirm();
        }
      }}
      className="border-divider flex flex-col items-start rounded-xl border-2 bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center rounded-xl">
        {renderMonth(viewDate, "left")}
        {renderMonth(secondViewDate, "right")}
      </div>
      <div className="flex w-full items-center justify-end gap-5 p-5">
        <button
          type="button"
          onClick={handleReset}
          className="border-primary-hover text-primary-hover flex h-[52px] w-[94px] cursor-pointer items-center justify-center rounded-lg border bg-white text-lg font-bold"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="bg-primary-hover flex h-[52px] w-[94px] cursor-pointer items-center justify-center rounded-lg text-lg font-bold text-white"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default DateRangeCalendar;
