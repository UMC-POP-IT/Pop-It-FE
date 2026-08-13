import type { ReactNode } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * "한 달치" 날짜 그리드(요일 헤더 + 날짜 칸 42/35개) 렌더링을 전담하는 공용
 * 프레젠테이션 컴포넌트. 검색바 날짜 필터(DateRangeCalendar), 공간상세 예약
 * 캘린더(ExploreReservationCard), 호스트 계약 기간 캘린더(DateRangePicker)
 * 세 곳이 전부 이 컴포넌트로 달을 그린다 - 이슈 #287 디자인 QA: "모바일뷰
 * 달력 숫자 위치·선택 시 뜨는 도형(원/밴드)이 태블릿/데스크톱에도 완전히
 * 똑같아야 한다"를 만족시키려면 애초에 하나의 컴포넌트에만 그 스타일이
 * 존재해야 breakpoint별로/파일별로 값이 다시 벌어지지 않는다.
 *
 * 날짜 칸 높이(56px)·선택/오늘 원 지름(44px)·밴드 높이(44px)는 항상 이
 * 리터럴 값 그대로 고정이며, 세 사용처 어디서도 오버라이드하지 않는다(prop으로
 * 받지 않음 - 값이 갈라질 여지를 아예 없앤다). 칸의 "가로폭"만 사용처별로
 * 다를 수 있다: 모바일 바텀시트는 화면 폭이 360~767px로 다양해 고정 px를 쓰면
 * 좁은 기기에서 넘치므로 유동(fr) 그리드를, 그 외(태블릿/데스크톱 팝오버,
 * 항상 폭이 넉넉한 인라인 카드)는 56px 고정 그리드를 쓴다 - 아래
 * cellWidthClassName/gridColsClassName 참고.
 */
export const CALENDAR_CELL_HEIGHT_PX = 56;
export const CALENDAR_CIRCLE_SIZE_PX = 44;

export interface CalendarMonthGridProps {
  /** 이 그리드가 보여주는 달(1일 기준 아무 날짜나 가능). 헤더 "YYYY.MM" 라벨에 쓰인다. */
  monthDate: Date;
  /** 항상 7의 배수(보통 35 또는 42) - 그 달에 속하지 않는 자리는 null로 채운다.
   * (다른 달 날짜를 옅게라도 보여주고 싶으면 null 대신 실제 Date를 넣고
   * getDayTextClassName으로 색만 옅게 처리한다 - ExploreReservationCard 참고.) */
  cells: (Date | null)[];
  showPrevArrow: boolean;
  showNextArrow: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  /** 꽉 찬 원(파란 배경)으로 강조할 날짜 - 시작일/종료일(또는 하루만 선택 시 그 하루). */
  isSelectedEndpoint: (date: Date) => boolean;
  /** 오늘이면 항상 회색 테두리 원 + 취소선으로 그린다(선택 가능 여부와 무관하게 시각적으로 고정). */
  isToday: (date: Date) => boolean;
  /** 버튼의 실제 disabled 여부이자, 선택되지 않았을 때 회색 취소선 텍스트로 그릴지 여부.
   * (호스트 계약 캘린더처럼 "오늘"은 클릭은 받되 안내 문구만 띄우고 싶다면, 여기서
   * 오늘을 false로 두고 isToday만 true를 반환하면 된다 - 시각은 오늘 스타일이 적용되고
   * 버튼은 클릭 가능한 상태로 남는다.)
   * (선택되지 않았을 때는 회색 취소선 텍스트로 그린다.) */
  isDisabled: (date: Date) => boolean;
  /** 시작~종료 사이를 잇는 하늘색 밴드의 배경색 클래스만 반환한다(높이는 이 컴포넌트가 고정). */
  getBandClassName: (date: Date) => string;
  onSelectDate: (date: Date) => void;
  getAriaLabel?: (date: Date) => string;
  /** 스크린 리더용 aria-pressed - 기본값은 isSelectedEndpoint와 같지만, 범위 전체(시작~종료
   * 사이 날짜 포함)를 "선택됨"으로 알리고 싶으면 별도로 넘긴다. */
  isAriaPressed?: (date: Date) => boolean;
  /** 기본 텍스트 색(text-text-primary) 대신 쓸 색 - 다른 달 날짜를 옅게 보여줄 때만 필요. */
  getDayTextClassName?: (date: Date) => string;
  /** 달력 전체 폭 컨테이너 클래스. 기본값(w-fit)은 칸이 고정 폭이라 그리드 자체 크기로
   * 결정되는 태블릿/데스크톱/인라인 카드용 - 화면 폭이 좁을 수 있는 모바일 바텀시트만
   * "w-full"로 오버라이드한다. */
  monthWidthClassName?: string;
  /** 그리드 컬럼 폭. 기본값은 56px 고정 7열 - 모바일 바텀시트만 유동(fr) 7열로 오버라이드한다. */
  gridColsClassName?: string;
  /** 칸 하나의 가로폭. 기본값은 56px 고정 - 모바일 바텀시트만 min-w-0(유동)으로 오버라이드한다. */
  cellWidthClassName?: string;
}

const defaultAriaLabel = (date: Date) =>
  `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

// 월 이동 화살표 - 세 사용처가 조금씩 다른 스타일(hover 배경 유무 등)을 각자
// 갖고 있었는데, 이제 한 군데서만 그리므로 접근성이 더 좋은(hover/focus-visible
// 링) 버전으로 통일한다.
const MonthNavArrow = ({
  direction,
  visible,
  onClick,
}: {
  direction: "prev" | "next";
  visible: boolean;
  onClick: () => void;
}) => (
  <div className="flex h-8 w-8 items-center justify-center">
    {visible && (
      <button
        type="button"
        aria-label={direction === "prev" ? "이전 달" : "다음 달"}
        onClick={onClick}
        className="text-text-primary hover:bg-primary-light active:bg-primary-light focus-visible:ring-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xl transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {direction === "prev" ? "‹" : "›"}
      </button>
    )}
  </div>
);

const CalendarMonthGrid = ({
  monthDate,
  cells,
  showPrevArrow,
  showNextArrow,
  onPrevMonth,
  onNextMonth,
  isSelectedEndpoint,
  isToday,
  isDisabled,
  getBandClassName,
  onSelectDate,
  getAriaLabel = defaultAriaLabel,
  isAriaPressed,
  getDayTextClassName,
  monthWidthClassName = "w-fit",
  gridColsClassName = "grid grid-cols-[repeat(7,56px)]",
  cellWidthClassName = "w-14",
}: CalendarMonthGridProps) => {
  // 칸 안의 숫자를 어떤 모양으로 그릴지: 선택됨(꽉 찬 원) > 오늘(회색 테두리 원 +
  // 취소선) > 그 외 선택 불가(회색 취소선) > 기본. 오늘은 대부분의 사용처에서
  // isDisabled에도 true라, 오늘 전용 스타일을 적용하려면 반드시 일반 disabled
  // 분기보다 먼저 검사해야 한다.
  const renderDayNumber = (date: Date): ReactNode => {
    const day = date.getDate();

    if (isSelectedEndpoint(date)) {
      return (
        <span className="bg-primary relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full text-white">
          {day}
        </span>
      );
    }
    if (isToday(date)) {
      return (
        <span className="border-text-disabled text-text-disabled relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border line-through">
          {day}
        </span>
      );
    }
    if (isDisabled(date)) {
      return <span className="text-text-disabled line-through">{day}</span>;
    }
    return day;
  };

  return (
    <div
      className={`mx-auto flex ${monthWidthClassName} flex-col items-center gap-7 px-3.5 py-5`}
    >
      {/* 화살표 유무와 상관없이 "YYYY.MM" 라벨 위치가 고정되도록, 이동 불가 방향이어도
          자리(w-8)는 항상 비워둔다. */}
      <div className="flex w-full items-center justify-center gap-3">
        <MonthNavArrow
          direction="prev"
          visible={showPrevArrow}
          onClick={onPrevMonth}
        />
        <span className="text-text-primary text-xl font-bold">
          {monthDate.getFullYear()}.
          {String(monthDate.getMonth() + 1).padStart(2, "0")}
        </span>
        <MonthNavArrow
          direction="next"
          visible={showNextArrow}
          onClick={onNextMonth}
        />
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <div className={gridColsClassName}>
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className={`text-text-primary flex ${cellWidthClassName} h-14 items-center justify-center text-base`}
            >
              {day}
            </span>
          ))}
        </div>

        <div className={gridColsClassName}>
          {cells.map((date, index) => {
            if (!date) {
              return (
                <span
                  key={`blank-${index}`}
                  className={`h-14 ${cellWidthClassName}`}
                  aria-hidden="true"
                />
              );
            }
            const disabled = isDisabled(date);
            return (
              <button
                type="button"
                key={date.toISOString()}
                onClick={() => onSelectDate(date)}
                disabled={disabled}
                aria-pressed={
                  isAriaPressed ? isAriaPressed(date) : isSelectedEndpoint(date)
                }
                aria-label={getAriaLabel(date)}
                className={`focus-visible:ring-primary relative box-border flex h-14 ${cellWidthClassName} cursor-pointer items-center justify-center border-0 p-0 text-base font-bold focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed ${
                  getDayTextClassName
                    ? getDayTextClassName(date)
                    : "text-text-primary"
                }`}
              >
                {/* 밴드(하늘색 연결 배경): 칸이 몇 주에 걸치든 항상 원과 같은 고정
                    높이(44px)로만 그린다(세로 중앙 정렬) - 절대 칸 높이만큼 커지지 않는다. */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 ${getBandClassName(date)}`}
                />
                <span className="relative z-10 flex size-14 items-center justify-center rounded-full">
                  {renderDayNumber(date)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarMonthGrid;
