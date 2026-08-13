import type { ReactNode } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 호스트 "계약 가능 기간" 달력의 한 달치 그리드 (요일 헤더 + 날짜 칸).
 * DateRangePicker 전용 — host-register 폴더 안에만 있다.
 *
 * 왜 공용 `shared/components/calendar/CalendarMonthGrid`를 쓰지 않는가
 * ------------------------------------------------------------------
 * 그 공용 컴포넌트는 이슈 #287(게스트 홈 디자인 QA)에서 달력 세 곳(검색바 날짜
 * 필터·공간상세 예약·호스트 계약 기간)을 하나로 합치며 만들어졌고, 칸 56px·원 44px를
 * 리터럴로 고정한 뒤 prop으로도 못 바꾸게 막아뒀다("값이 갈라질 여지를 아예 없앤다").
 *
 * 그 통일이 호스트 계약 달력에는 두 가지 문제를 만들었다.
 *   1. 칸 크기가 이 화면의 시안(데스크톱 60×46 / 태블릿 40×36 / 모바일 46 높이)과
 *      다르다. 특히 높이가 46 → 56으로 커져 6주짜리 달은 60px 길어진다.
 *   2. 칸이 56px로 커지자 두 달이 840px(420×2)가 되어 태블릿 768px에 안 들어가고,
 *      그래서 2개월 보기가 lg(1024) 이상으로 밀렸다. 원래 태블릿은 칸을 40×36으로
 *      작게 써서 616px(308×2)로 두 달을 나란히 보여주고 있었다.
 *
 * 공용 파일의 56/44를 고치거나 prop을 열면 검색바 날짜 필터·공간상세 예약 달력까지
 * 같이 흔들린다(둘 다 1번 담당 영역). 그래서 공용 파일은 한 줄도 건드리지 않고,
 * 이 화면의 그리드만 여기로 분리해 원래 크기를 되살렸다.
 * 공용 컴포넌트와 두 사용처는 그대로 남는다.
 *
 * 크기 규격 (시안 card_calendar_X5)
 * ---------------------------------
 *   월 카드   모바일 w-full(시트 폭) / 태블릿 308 / 데스크톱 448 (= px-3.5×2 + 60×7)
 *   날짜 칸   높이 46 / 태블릿만 36. 가로폭은 카드 폭 ÷ 7 (모바일 46.9 / 태블릿 40 / 데스크톱 60)
 *   선택 원   칸 높이를 꽉 채우는 정사각 원 (aspect-square h-full)
 *   오늘 원   32px 정사각 원 + 취소선 (선택 못 하는 날이라는 표시)
 *   범위 띠   칸 배경 전체 (칸 높이만큼)
 */
export interface ContractCalendarGridProps {
  /** 이 그리드가 보여주는 달. 헤더 "YYYY.MM" 라벨에 쓰인다. */
  monthDate: Date;
  /** 항상 7의 배수(35 또는 42). 그 달에 속하지 않는 자리는 null로 채운다. */
  cells: (Date | null)[];
  showPrevArrow: boolean;
  showNextArrow: boolean;
  /** md 미만에서 이 카드가 '다음 달' 화살표도 함께 가질지. 달 카드가 하나뿐일 때 필요하다. */
  showNextArrowOnMobile?: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  /** 꽉 찬 원(파란 배경)으로 강조할 날짜 — 시작일/종료일. */
  isSelectedEndpoint: (date: Date) => boolean;
  /** 오늘이면 회색 테두리 원 + 취소선으로 그린다. */
  isToday: (date: Date) => boolean;
  /** 버튼의 실제 disabled 여부. (오늘은 클릭을 받아야 하므로 여기서 false를 주고 isToday만 true를 준다.) */
  isDisabled: (date: Date) => boolean;
  /** 시작~종료 사이를 잇는 하늘색 띠의 배경색 클래스만 반환한다. */
  getBandClassName: (date: Date) => string;
  onSelectDate: (date: Date) => void;
  getAriaLabel: (date: Date) => string;
  isAriaPressed: (date: Date) => boolean;
}

// 월 이동 화살표 — 갈 수 없는 방향은 버튼을 아예 그리지 않되 자리(h-8 w-8)는 비워둬
// "YYYY.MM" 라벨이 한쪽으로 밀리지 않게 한다.
const MonthNavArrow = ({
  direction,
  visible,
  onClick,
  className = "",
}: {
  direction: "prev" | "next";
  visible: boolean;
  onClick: () => void;
  className?: string;
}) =>
  visible ? (
    <button
      type="button"
      aria-label={direction === "prev" ? "이전 달" : "다음 달"}
      onClick={onClick}
      className={`text-text-primary hover:bg-primary-light focus-visible:ring-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xl transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${className}`}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  ) : null;

const ContractCalendarGrid = ({
  monthDate,
  cells,
  showPrevArrow,
  showNextArrow,
  showNextArrowOnMobile = false,
  onPrevMonth,
  onNextMonth,
  isSelectedEndpoint,
  isToday,
  isDisabled,
  getBandClassName,
  onSelectDate,
  getAriaLabel,
  isAriaPressed,
}: ContractCalendarGridProps) => {
  // 칸 안의 숫자를 어떤 모양으로 그릴지: 선택됨(꽉 찬 원) > 오늘(회색 테두리 원 + 취소선)
  // > 그 외 선택 불가(회색 취소선) > 기본.
  // 오늘은 대부분 isDisabled에도 걸리므로 반드시 일반 disabled 분기보다 먼저 검사한다.
  const renderDayNumber = (date: Date): ReactNode => {
    const day = date.getDate();

    if (isSelectedEndpoint(date)) {
      // aspect-square h-full — 칸 높이를 그대로 지름으로 쓴다(46 / 태블릿 36).
      // 고정 px가 아니라 칸 높이에 묶여 있어 breakpoint마다 따라 줄고 늘어난다
      return (
        <span className="bg-primary relative z-10 flex aspect-square h-full shrink-0 items-center justify-center rounded-full text-white">
          {day}
        </span>
      );
    }
    if (isToday(date)) {
      return (
        <span className="border-text-disabled text-text-disabled relative z-10 flex aspect-square h-8 shrink-0 items-center justify-center rounded-full border line-through">
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
    // 데스크톱 시안 card_calendar_X5: W 448 = px-3.5(14)×2 + 60px×7.
    // 모바일(바텀시트)은 달이 하나뿐이라 시트 폭을 그대로 쓴다.
    // 헤더↔요일 간격 28 = gap-3(12) + 헤더 mb-4(16)
    <div className="flex w-full shrink-0 flex-col gap-3 md:w-[308px] md:px-3.5 md:py-8 lg:w-[448px] lg:py-5">
      {/* 헤더↔요일줄 = 이 mb + 카드 gap-3(12). 모바일·데스크톱 28, 태블릿 12 */}
      <div className="mb-4 flex items-center justify-center gap-1 md:mb-0 lg:mb-4">
        <div className="flex h-8 w-8 items-center justify-center">
          <MonthNavArrow
            direction="prev"
            visible={showPrevArrow}
            onClick={onPrevMonth}
          />
        </div>
        {/* 시안 20px/700 #121212 (태블릿만 16px) */}
        <span className="text-text-primary text-xl font-bold md:text-base lg:text-xl">
          {monthDate.getFullYear()}.
          {String(monthDate.getMonth() + 1).padStart(2, "0")}
        </span>
        <div className="flex h-8 w-8 items-center justify-center">
          <MonthNavArrow
            direction="next"
            visible={showNextArrow}
            onClick={onNextMonth}
          />
          {/* md 미만(바텀시트)은 달 카드가 하나뿐이라 ›도 이 카드가 갖는다.
              md 이상에서는 오른쪽 달 카드가 자기 ›를 그리므로 여기 것은 숨긴다.
              (태블릿에서 다음 달로 못 넘어가는 게 아니라 › 주인이 바뀌는 것이다) */}
          <MonthNavArrow
            direction="next"
            visible={showNextArrowOnMobile}
            onClick={onNextMonth}
            className="md:hidden"
          />
        </div>
      </div>

      {/* 요일 줄 */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-text-secondary flex h-9 w-full items-center justify-center text-sm font-medium md:text-xs lg:text-sm"
          >
            {day}
          </span>
        ))}
      </div>

      {/* 날짜 칸 — 시안 60×46 (태블릿 40×36). null은 그 달에 없는 자리라 빈 칸으로 둔다.
          가로폭은 w-full + grid-cols-7이라 카드 폭에서 자동으로 나온다 —
          모바일 46.9 / 태블릿 40 / 데스크톱 60. 선택 원(칸 높이 = 46/36)보다
          좁아지는 구간은 없다 */}
      <div className="grid grid-cols-7">
        {cells.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`blank-${index}`}
                className="h-[46px] md:h-9 lg:h-[46px]"
                aria-hidden="true"
              />
            );
          }
          return (
            <button
              type="button"
              key={date.toISOString()}
              disabled={isDisabled(date)}
              aria-pressed={isAriaPressed(date)}
              aria-label={getAriaLabel(date)}
              onClick={() => onSelectDate(date)}
              // 범위 띠는 칸 배경으로 그린다(칸 높이만큼) — 별도 span 없이.
              // 시작일·종료일 칸은 원의 세로 중심까지만 채우는 gradient가 들어온다
              className={`text-text-primary focus-visible:ring-primary relative box-border flex h-[46px] w-full cursor-pointer items-center justify-center border-0 p-0 text-base font-bold focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed md:h-9 md:text-sm lg:h-[46px] lg:text-base ${getBandClassName(date)}`}
            >
              {renderDayNumber(date)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContractCalendarGrid;
