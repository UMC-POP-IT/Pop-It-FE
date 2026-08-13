import { useState } from "react";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import CalendarMonthGrid from "@/shared/components/calendar/CalendarMonthGrid";

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
 *
 * 실제 "한 달치" 그리드(요일 헤더 + 날짜 칸)는 CalendarMonthGrid가 그린다 -
 * 이슈 #287 디자인 QA: 모바일/태블릿/데스크톱 어디서나 날짜 칸·선택 원·밴드가
 * 완전히 같은 픽셀 값이어야 해서, 그 스타일은 이제 이 컴포넌트가 아니라
 * CalendarMonthGrid 한 곳에만 존재한다(ExploreReservationCard·
 * DateRangePicker도 동일하게 그 컴포넌트를 재사용한다).
 */
const DateRangeCalendar = ({
  value,
  onChange,
  onConfirm,
  onReset,
}: DateRangeCalendarProps) => {
  const todayStart = startOfToday();
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Figma 태블릿(768~1023) 스펙: 2개월 나란히 보이던 캘린더가 1개월만 노출된다
  // (840px짜리 2개월 다이얼로그는 768px 뷰포트에서 애초에 다 들어가지도 않는다).
  // lg(1024) 미만이면 1개월, 그 이상이면 기존과 동일하게 2개월을 보여준다.
  const isTwoMonthView = useMediaQuery("(min-width: 1024px)");
  const isMobileCalendar = useMediaQuery("(max-width: 767px)");

  const secondViewDate = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    1,
  );
  // 실제로 화면에 보이는 달 중 가장 오른쪽(=가장 미래) 달. 2개월 뷰에서는 secondViewDate,
  // 1개월 뷰에서는 viewDate 자신이다 - "다음 달로 더 못 넘어가는" 기준을 여기에 맞춘다.
  const rightmostViewDate = isTwoMonthView ? secondViewDate : viewDate;

  // 오늘이 속한 달보다 과거로는 이동할 수 없다(ExploreReservationCard와 동일한 규칙).
  // 가장 왼쪽(=viewDate) 달이 이동 불가한 상태면 "이전 달" 화살표 자체를 렌더링하지 않는다.
  const currentMonthStart = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    1,
  );
  const viewedMonthStart = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  );
  const isPrevMonthDisabled = viewedMonthStart <= currentMonthStart;

  // 오늘로부터 90일 이후의 달로는 이동할 수 없다(공간상세 예약 캘린더와 동일한 규칙).
  // 가장 오른쪽(미래) 달이 이미 그 상한 달이면 "다음 달" 화살표를 렌더링하지 않는다.
  const maxSelectableDate = new Date(todayStart);
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 90);
  const isNextMonthDisabled =
    rightmostViewDate.getFullYear() === maxSelectableDate.getFullYear() &&
    rightmostViewDate.getMonth() === maxSelectableDate.getMonth();

  const handleSelectDate = (date: Date) => {
    if (date <= todayStart || date > maxSelectableDate) return;
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

  // 오늘이거나(당일 예약 불가) 그 이전(과거), 혹은 오늘로부터 90일을 넘는
  // 날짜는 선택할 수 없다 - 오늘은 항상 회색 취소선 + 회색 원으로 표시하고
  // 선택 대상에서 제외한다(이슈 #287 디자인 QA).
  const isDateDisabled = (date: Date) =>
    date <= todayStart || date > maxSelectableDate;

  // 두 날짜(시작~종료) 사이를 잇는 "밴드"의 배경색만 반환한다. 실제 높이는
  // CalendarMonthGrid가 고정값(44px)으로 그린다. 시작/종료 칸은 원의 가로
  // 중심까지만 배경을 채우고 반대쪽은 비워서, 원 뒤로 배경이 삐져나오지 않게 한다.
  const getBandClassName = (date: Date) => {
    const { start, end } = value;
    if (isDateDisabled(date)) return "";

    if (start && end && !isSameDay(start, end)) {
      if (isSameDay(date, start)) {
        return "bg-[linear-gradient(to_right,transparent_50%,var(--color-primary-100)_50%)]";
      }
      if (isSameDay(date, end)) {
        return "bg-[linear-gradient(to_right,var(--color-primary-100)_50%,transparent_50%)]";
      }
      if (date > start && date < end) {
        return "bg-primary-100";
      }
    }
    return "";
  };

  const isSelectedEndpoint = (date: Date) => {
    const { start, end } = value;
    if (start && !end) return isSameDay(date, start);
    if (start && end) return isSameDay(date, start) || isSameDay(date, end);
    return false;
  };

  const isToday = (date: Date) => isSameDay(date, todayStart);

  // 모바일 바텀시트는 화면 폭이 다양(360~767px)해 칸 가로폭에 고정 px를 쓸 수
  // 없으므로 유동(fr) 7열을 쓴다. 태블릿/데스크톱(팝오버)은 항상 폭이 넉넉해
  // CalendarMonthGrid 기본값(56px 고정 7열)을 그대로 쓴다.
  const mobileGridProps = isMobileCalendar
    ? {
        monthWidthClassName: "w-full",
        gridColsClassName: "grid w-full grid-cols-7",
        cellWidthClassName: "min-w-0",
      }
    : {};

  const renderMonth = (
    monthDate: Date,
    {
      showPrevArrow,
      showNextArrow,
    }: { showPrevArrow: boolean; showNextArrow: boolean },
  ) => {
    const cells = getMonthCells(monthDate.getFullYear(), monthDate.getMonth());

    return (
      <CalendarMonthGrid
        monthDate={monthDate}
        cells={cells}
        showPrevArrow={showPrevArrow && !isPrevMonthDisabled}
        showNextArrow={showNextArrow && !isNextMonthDisabled}
        onPrevMonth={() =>
          setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
          )
        }
        onNextMonth={() =>
          setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
          )
        }
        isSelectedEndpoint={isSelectedEndpoint}
        isToday={isToday}
        isDisabled={isDateDisabled}
        getBandClassName={getBandClassName}
        onSelectDate={handleSelectDate}
        {...mobileGridProps}
      />
    );
  };

  return (
    <div
      role={isMobileCalendar ? undefined : "dialog"}
      aria-label={isMobileCalendar ? undefined : "날짜 범위 선택"}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onConfirm();
        }
      }}
      className={`mx-auto flex shrink-0 flex-col items-center bg-white ${
        isMobileCalendar
          ? "h-auto w-full"
          : "border-divider h-auto w-fit max-w-[calc(100vw-24px)] rounded-xl border-2 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]"
      }`}
    >
      <div className="flex items-center rounded-xl">
        {isTwoMonthView ? (
          <>
            {renderMonth(viewDate, {
              showPrevArrow: true,
              showNextArrow: false,
            })}
            {renderMonth(secondViewDate, {
              showPrevArrow: false,
              showNextArrow: true,
            })}
          </>
        ) : (
          renderMonth(viewDate, { showPrevArrow: true, showNextArrow: true })
        )}
      </div>
      <div className="flex w-full items-center justify-end gap-5 p-5 max-md:pt-2">
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
