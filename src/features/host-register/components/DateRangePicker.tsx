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

// 계약 가능 기간 상한 (개월). 화면 문구 "최대 3개월 신청 가능"과 같은 값
const MAX_CONTRACT_MONTHS = 3;

// date에서 months개월 뒤. 대상 월에 같은 '일'이 없으면 그 달의 마지막 날로 자른다.
// (new Date(y, m+3, 30)처럼 없는 날짜를 넣으면 JS가 조용히 다음 달로 넘긴다.
//  11/30 시작이 "2/30" → 3/2 가 되면서 이틀이 더 허용되던 버그)
const addMonthsClamped = (date: Date, months: number) => {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const lastDay = new Date(year, month + 1, 0).getDate(); // 다음 달 0일 = 대상 월 마지막 날
  return new Date(year, month, Math.min(date.getDate(), lastDay));
};

// 어떤 '달(base)'의 달력 칸 배열. 그 달에 필요한 주 수만 만든다 (5주 또는 6주).
// 앞뒤로 남는 자리는 null — 피그마처럼 다른 달 날짜를 채우지 않고 빈 칸으로 둔다.
const getCalendarDays = (base: Date): (Date | null)[] => {
  const year = base.getFullYear();
  const month = base.getMonth();
  const startOffset = new Date(year, month, 1).getDay(); // 그 달 1일의 요일 (0=일)
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 다음 달 0일 = 이번 달 마지막 날
  const cellCount = Math.ceil((startOffset + daysInMonth) / 7) * 7; // 7의 배수로 올림 = 주 수 × 7
  return Array.from({ length: cellCount }, (_, i) => {
    const day = i - startOffset + 1;
    return day >= 1 && day <= daysInMonth ? new Date(year, month, day) : null;
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
  // 선택 불가 날짜를 눌렀을 때 달력 아래에 띄울 안내 (없으면 null)
  const [dateError, setDateError] = useState<string | null>(null);
  // 바텀시트를 손잡이로 끌어내린 거리(px). 0이면 제자리
  const [dragY, setDragY] = useState(0);
  // 끄는 중에는 transition을 끈다 — 안 그러면 손가락보다 시트가 늦게 따라온다
  const [isDragging, setIsDragging] = useState(false);
  // 끌기 시작한 지점의 세로 좌표. null이면 끄는 중이 아니다
  const dragStartRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null); // 달력 전체를 가리키는 리모컨
  // 팝업을 연 필드 버튼 — 닫을 때 여기로 포커스를 되돌린다
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // 오늘 자정. 날짜 비교는 '시각'이 아니라 '날짜' 단위여야 하므로 0시로 맞춘다
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 달력이 열려있을 때만: 바깥 클릭 / Esc 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        // 끌던 중에 Esc를 누르면 내려간 위치가 남아, 다시 열 때 시트가 삐뚤게 뜬다
        setDragY(0);
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
    !!startDate && date > addMonthsClamped(startDate, MAX_CONTRACT_MONTHS);

  const handleSelectDate = (date: Date) => {
    // 오늘·과거는 계약 시작일이 될 수 없다.
    // 과거 칸은 disabled라 클릭이 아예 안 오므로 실제로 여기 걸리는 건 오늘뿐이다.
    if (date <= todayStart) {
      setDateError("오늘 날짜는 선택할 수 없어요. 내일부터 선택해 주세요.");
      return;
    }
    setDateError(null);
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

  // 클릭 자체가 막히는 날짜: 과거 / (종료일 고르는 중) 3개월 초과.
  // 오늘은 여기 넣지 않는다 — 눌렀을 때 안내 문구를 띄워야 해서 aria-disabled로 따로 처리한다.
  const isDateDisabled = (date: Date) =>
    date < todayStart || (!!startDate && !endDate && isOverLimit(date));

  // 시작일 또는 종료일(하루만 선택한 경우 포함)인 날짜 → 숫자에 꽉 찬 원 강조
  const isSelectedEndpoint = (date: Date) => {
    if (startDate && !endDate) return isSameDay(date, startDate);
    if (startDate && endDate)
      return isSameDay(date, startDate) || isSameDay(date, endDate);
    return false;
  };

  // 칸 '배경' = 선택 범위 띠. 숫자 모양(원)은 renderDayNumber가 따로 그린다 (게스트 예약 달력과 동일 구조)
  const getDayClassName = (date: Date) => {
    if (isDateDisabled(date)) {
      return "cursor-not-allowed";
    }
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      // 시작일/종료일 칸은 원의 세로 지름(칸 정중앙)까지만 배경을 채운다.
      // 그 바깥쪽(반대쪽 절반)은 배경 없이 비워둬 띠가 원 뒤로 삐져나오지 않게 한다.
      if (isSameDay(date, startDate)) {
        return "text-text-primary bg-[linear-gradient(to_right,transparent_50%,var(--color-primary-100)_50%)]";
      }
      if (isSameDay(date, endDate)) {
        return "text-text-primary bg-[linear-gradient(to_right,var(--color-primary-100)_50%,transparent_50%)]";
      }
      if (date > startDate && date < endDate) {
        return "bg-primary-100 text-text-primary";
      }
    }
    return "text-text-primary";
  };

  // 칸 안의 '숫자'를 어떤 모양으로 그릴지.
  // 우선순위: 선택됨(꽉 찬 진파랑 원) > 오늘(연파랑 테두리 원) > 선택 불가(회색 취소선) > 기본
  const renderDayNumber = (date: Date) => {
    const day = date.getDate();

    if (isSelectedEndpoint(date)) {
      return (
        <span className="bg-primary relative z-10 flex aspect-square h-full shrink-0 items-center justify-center rounded-full text-white">
          {day}
        </span>
      );
    }
    if (isSameDay(date, todayStart)) {
      // 오늘 — 연파랑 테두리 원. 선택은 못 하지만 위치는 보여준다
      return (
        <span className="border-primary-100 text-text-primary relative z-10 flex aspect-square h-8 shrink-0 items-center justify-center rounded-full border">
          {day}
        </span>
      );
    }
    if (isDateDisabled(date)) {
      // 과거·3개월 초과: 원 없이 회색 취소선 텍스트만
      return <span className="text-text-disabled line-through">{day}</span>;
    }
    return day;
  };

  // 딤을 누르거나 시트를 끌어내려 닫을 때 — 고른 범위가 완성돼 있으면 저장하고 닫는다.
  // (바깥 클릭으로 닫는 기존 동작과 같게 맞춘다)
  const closeWithSave = () => {
    if (startDate && endDate) onConfirm(toYmd(startDate), toYmd(endDate));
    setIsOpen(false);
    setDragY(0);
  };

  // 손잡이 끌기 — 포인터 이벤트라 터치·마우스·펜을 한 번에 받는다.
  // setPointerCapture: 손가락이 손잡이를 벗어나도 이 요소가 계속 move/up을 받게 한다.
  // 이게 없으면 빠르게 내릴 때 시트가 중간에 멈춘다
  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = e.clientY;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    // 아래로 끄는 것만 따라간다 — 위로 올리면 시트가 화면 위로 떠버린다
    setDragY(Math.max(0, e.clientY - dragStartRef.current));
  };

  const handleDragEnd = () => {
    if (dragStartRef.current === null) return;
    dragStartRef.current = null;
    setIsDragging(false);
    // 100px 넘게 내렸으면 닫고, 아니면 제자리로 되돌린다 (transition이 되돌아가는 걸 그려준다)
    if (dragY > 100) closeWithSave();
    else setDragY(0);
  };

  // 초기화 → 고른 범위를 비운다. store까지 같이 비우지 않으면 시트를 닫았을 때
  // 필드에는 예전 날짜가 그대로 남아 "초기화했는데 왜 남아있지"가 된다
  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setDateError(null);
    onConfirm("", "");
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
  // 이번 달보다 과거로는 이동할 수 없다 (어차피 고를 수 없는 달).
  // 두 날짜를 각자의 '월 1일'로 정규화해 비교한다 — 자정을 넘겨 페이지가 계속 열려 있어
  // viewDate가 이번 달보다 과거가 되어버린 경우까지 안전하게 막기 위해.
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

  const goPrev = () => {
    if (isPrevMonthDisabled) return; // 화살표를 안 그리지만 키보드/프로그램 호출까지 이중으로 막는다
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const goNext = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  // 한 달치 달력 카드. arrow로 이 카드에 붙일 화살표를 정한다 (피그마: 왼쪽 달 ‹, 오른쪽 달 ›)
  const renderMonth = (base: Date, arrow: "prev" | "next") => (
    // 데스크톱 피그마 card_calendar_X5: W 448 = px-3.5(14)×2 + 60px×7.
    // lg 미만(바텀시트)은 달이 하나뿐이라 시트 폭을 그대로 쓴다 (모바일 328 × 그리드 230).
    // 헤더↔요일 간격 28 = gap-3(12) + 헤더 mb-4(16)
    <div className="flex w-full shrink-0 flex-col gap-3 md:w-[308px] md:px-3.5 md:py-8 lg:w-[448px] lg:py-5">
      {/* 월 헤더 — 라벨은 카드 정중앙.
          갈 수 없는 방향의 화살표는 아예 렌더링하지 않되(게스트 예약 달력과 동일),
          w-8 자리는 그대로 비워둬 월 라벨이 한쪽으로 밀리지 않게 한다 */}
      {/* 헤더↔요일줄 = 이 mb + 카드 gap-3(12). 모바일·데스크톱 28, 태블릿 12 */}
      <div className="mb-4 flex items-center justify-center gap-1 md:mb-0 lg:mb-4">
        <div className="flex h-8 w-8 items-center justify-center">
          {arrow === "prev" && !isPrevMonthDisabled && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="이전 달"
              className="text-text-primary flex h-8 w-8 items-center justify-center text-xl"
            >
              ‹
            </button>
          )}
        </div>
        {/* 피그마 20px/700 #121212 */}
        <span className="text-text-primary text-xl font-bold md:text-base lg:text-xl">
          {base.getFullYear()}.{String(base.getMonth() + 1).padStart(2, "0")}
        </span>
        <div className="flex h-8 w-8 items-center justify-center">
          {arrow === "next" && (
            <button
              type="button"
              onClick={goNext}
              aria-label="다음 달"
              className="text-text-primary flex h-8 w-8 items-center justify-center text-xl"
            >
              ›
            </button>
          )}
          {/* lg 미만은 달 카드가 하나뿐이라 ›도 이 카드가 갖는다.
              데스크톱에서는 오른쪽 카드에 › 가 따로 있으므로 숨긴다 */}
          {arrow === "prev" && (
            <button
              type="button"
              onClick={goNext}
              aria-label="다음 달"
              className="text-text-primary flex h-8 w-8 items-center justify-center text-xl md:hidden"
            >
              ›
            </button>
          )}
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
      {/* 날짜 칸 — 피그마 60×46. null은 그 달에 없는 자리라 빈 칸으로 둔다 */}
      <div className="grid grid-cols-7">
        {getCalendarDays(base).map((date, i) => {
          if (!date)
            return (
              <div
                key={`empty-${i}`}
                className="h-[46px] md:h-9 lg:h-[46px]"
              />
            );
          const isToday = isSameDay(date, todayStart);
          // 선택된 날(시작·종료·범위 안)인지 → 스크린리더용 aria-pressed
          const isSelected =
            (!!startDate && isSameDay(date, startDate)) ||
            (!!endDate && isSameDay(date, endDate)) ||
            (!!startDate && !!endDate && date > startDate && date < endDate);
          return (
            <button
              type="button"
              key={date.toISOString()}
              disabled={isDateDisabled(date)}
              // 오늘은 disabled를 쓰지 않는다 — 눌렀을 때 안내 문구를 띄워야 하므로
              // 클릭은 받고 handleSelectDate에서 막는다. aria-disabled로 보조기술에만 알림
              aria-disabled={isToday || undefined}
              aria-label={`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}
              aria-pressed={isSelected}
              onClick={() => handleSelectDate(date)}
              className={`relative box-border flex h-[46px] w-full items-center justify-center border-0 p-0 text-base font-bold disabled:cursor-not-allowed md:h-9 md:text-sm lg:h-[46px] lg:text-base ${getDayClassName(date)}`}
            >
              {renderDayNumber(date)}
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
      {/* 시작일 / 종료일 — 라벨은 필드 '위'에, 필드 안에는 고른 날짜 또는 "날짜 선택" */}
      {/* 피그마: 필드 387 + gap 20 + 필드 387 = 본문 794 */}
      <div className="grid grid-cols-2 gap-5">
        {[
          { date: startDate, label: "시작일" },
          { date: endDate, label: "종료일" },
        ].map((field) => (
          <div
            key={field.label}
            // 모바일 필드 묶음 96 = 라벨 28 + gap 12 + 입력칸 56
            className="flex flex-col gap-3 md:gap-2"
          >
            {/* 같은 페이지의 다른 하위 필드 라벨(전용면적 등)과 동일한 계층 */}
            <span className="text-text-tertiary text-xl font-bold">
              {field.label}
            </span>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              aria-controls={popupId}
              // 라벨이 버튼 밖으로 나가면서 두 버튼의 읽히는 이름이 "날짜 선택"으로 같아진다.
              // 어느 필드인지 구분되도록 라벨을 이름에 직접 넣어준다.
              aria-label={`${field.label} ${field.date ? toDisplay(field.date) : "날짜 선택"}`}
              onClick={(e) => {
                triggerRef.current = e.currentTarget; // 방금 누른 버튼을 기억
                setDateError(null); // 지난번 안내 문구가 남아있지 않게 지움
                setIsOpen((v) => !v);
              }}
              className="border-divider flex h-14 items-center gap-2 rounded-lg border bg-white px-5"
            >
              {/* 모바일은 아이콘을 빼고 날짜 글자만 둔다 (시안) */}
              <img
                src={calendarIcon}
                alt=""
                className="hidden h-8 w-8 md:block"
              />

              {/* 피그마: 미선택 #808080 18px/500, 선택 후 #121212 18px/700 (둘 다 line-height 140%) */}
              <span
                className={`text-lg leading-[1.4] ${
                  field.date
                    ? "text-text-primary font-bold"
                    : "text-text-secondary font-medium"
                }`}
              >
                {field.date ? toDisplay(field.date) : "날짜 선택"}
              </span>
            </button>
          </div>
        ))}
      </div>

      {isOpen && (
        <>
          {/* 딤 — 바텀시트일 때만. 데스크톱 팝업은 화면을 덮지 않는다 */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => {
              if (startDate && endDate)
                onConfirm(toYmd(startDate), toYmd(endDate));
              setIsOpen(false);
              setDragY(0);
            }}
          />

          {/* lg 미만: 화면 아래에 붙는 바텀시트 (위 모서리만 radius 20, 안쪽 16, 높이는 내용만큼)
              lg 이상: 필드 아래에 뜨는 896px 팝업 — 448 카드 2개.
                       본문(644)보다 넓어 좌우로 126씩 넘치므로 left-1/2 + -translate-x-1/2로
                       가운데 정렬해 넘침을 대칭으로 만든다.
                       MainLayout의 overflow-x-clip이 가로 스크롤바 생성을 막는다 */}
          <div
            id={popupId}
            role="dialog"
            aria-label="계약 가능 기간 선택"
            // 끌어내린 만큼 시트를 내린다. dragY가 0이면 transform을 아예 안 줘야
            // lg의 -translate-x-1/2(가로 가운데 정렬)를 덮어쓰지 않는다
            style={{
              transform: dragY ? `translateY(${dragY}px)` : undefined,
              transition: isDragging ? "none" : "transform 200ms ease-out",
            }}
            className="border-border fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] border bg-white px-4 pt-1 pb-4 shadow-lg md:absolute md:inset-x-auto md:bottom-auto md:left-1/2 md:z-10 md:mt-2 md:w-[616px] md:-translate-x-1/2 md:overflow-hidden md:rounded-lg md:p-0 lg:w-[896px]"
          >
            {/* 손잡이 바 40×4 — 끌어내려 닫는다. 데스크톱 팝업엔 없다.
                py-2로 손가락이 닿는 범위를 바보다 위아래 8씩 넓히고, 시트 pt-1(4)과 합쳐
                바가 시안대로 위에서 12에 놓인다. 아래 mb-1(4)+패딩 8 = 12.
                touch-none: 이게 없으면 브라우저가 끌기를 '페이지 스크롤'로 가로챈다 */}
            <div
              role="presentation"
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              className="mb-1 flex cursor-grab touch-none justify-center py-2 active:cursor-grabbing md:hidden"
            >
              <div className="bg-divider h-1 w-10 rounded-full" />
            </div>

            {/* 달 카드 — lg 미만은 1개월, 데스크톱은 2개월 나란히 */}
            <div className="flex">
              {renderMonth(viewDate, "prev")}
              <div className="hidden md:block">
                {renderMonth(nextMonth, "next")}
              </div>
            </div>

            {/* 고를 수 없는 날짜를 눌렀을 때만 나타남.
                role="alert"이면 스크린리더가 포커스를 옮기지 않고도 즉시 읽어준다 */}
            {dateError && (
              <p
                role="alert"
                className="text-danger text-sm font-medium md:px-4 lg:px-5"
              >
                {dateError}
              </p>
            )}

            {/* 하단 — lg 미만: [초기화] [확인] 우측 정렬, 그리드에서 40 아래.
                데스크톱: 왼쪽에 선택 범위 텍스트 + 오른쪽 [확인], padding 20 (기존 그대로) */}
            <div className="mt-10 flex items-center justify-end gap-5 md:mt-0 md:justify-between md:p-4 lg:p-5">
              {/* 보조 정보라 작고 회색으로 — 확인 버튼이 시선을 먼저 받게 한다 */}
              <span className="text-text-secondary hidden text-sm font-medium md:inline lg:text-base">
                {fieldText(startDate, "시작일")} ~{" "}
                {fieldText(endDate, "종료일")}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-text-secondary hover:text-text-primary shrink-0 text-lg font-bold md:hidden"
              >
                초기화
              </button>
              <button
                type="button"
                disabled={!(startDate && endDate)}
                onClick={handleConfirm}
                className="bg-primary-hover flex h-[52px] w-[94px] shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white disabled:opacity-40 md:h-12 md:w-20 md:text-base lg:h-[52px] lg:w-[94px] lg:text-lg"
              >
                확인
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangePicker;
