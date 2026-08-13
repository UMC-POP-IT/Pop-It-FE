import { useState, useRef, useEffect, useId } from "react";
import CalendarIcon from "@/features/host-register/components/CalendarIcon";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import ContractCalendarGrid from "@/features/host-register/components/ContractCalendarGrid";

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
  // 지금 열려 있는 팝업을 띄운 필드.
  // isOpen 하나로 테두리를 칠하면 두 칸이 동시에 파래진다 — 실제로 누른 칸만
  // 강조해야 하므로 어느 칸이 열었는지를 따로 기억한다 (이슈 #306).
  // 화면에 보이는 라벨("시작일")이 아니라 별도 키를 쓴다: 라벨을 식별자로 쓰면
  // 타입이 string이라 오타를 컴파일러가 못 잡고(테두리만 조용히 안 칠해진다),
  // 나중에 라벨 문구를 "대여 시작일"로 바꾸려는 사람이 이게 상태 키인 줄 모른다.
  // 닫을 때 굳이 비우지 않는다 — 아래 강조 조건이 isOpen과 AND로 묶여 있어
  // 닫혀 있으면 남은 값이 화면에 영향을 주지 않는다
  const [openedField, setOpenedField] = useState<"start" | "end" | null>(null);
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
  // 지금까지 끌어내린 거리. dragY와 같은 값이지만 리렌더를 기다리지 않는다.
  // pointerup에서 100px 판정에 쓰려면 이쪽이어야 한다 — 아래 handleDragEnd 참고
  const dragYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null); // 달력 전체를 가리키는 리모컨
  // 팝업을 연 필드 버튼 — 닫을 때 여기로 포커스를 되돌린다
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // 이슈 #306: 태블릿이 1개월만 보여줘 데스크톱과 레이아웃이 갈라진 것을 되돌린다.
  // #287이 칸을 56px로 통일하자 두 달이 840px(420×2)가 되어 태블릿 768px에 안 들어가서
  // 2개월 기준이 lg(1024)로 밀렸던 것이 원인이다. 이 화면은 공용 그리드를 쓰지 않고
  // 시안 크기(태블릿 칸 40×36 → 월 카드 308 → 두 달 616)로 돌아왔으므로 768에 들어간다.
  // 그래서 md(768)부터 2개월 — #287 이전과 같은 기준이다.
  const isTwoMonthView = useMediaQuery("(min-width: 768px)");

  // 오늘 자정. 날짜 비교는 '시각'이 아니라 '날짜' 단위여야 하므로 0시로 맞춘다
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 달력이 열려있을 때만: 바깥 클릭 / Esc 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        // 끄는 도중에 Esc를 누르면 pointerup이 오기 전에 시트가 닫혀 handleDragEnd가
        // 아예 실행되지 않는다. 거기서 하던 정리를 여기서도 해줘야 한다 —
        // 안 하면 내려간 위치(dragY)가 남아 다시 열 때 시트가 삐뚤게 뜨고,
        // isDragging이 true로 굳어 transition이 꺼진 채 툭 나타난다.
        dragStartRef.current = null;
        dragYRef.current = 0;
        setIsDragging(false);
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

  // 바텀시트가 떠 있는 동안 뒤 페이지 스크롤을 잠근다.
  // 딤이 화면 전체를 덮어 사용자에게는 모달인데, 딤 위를 위아래로 쓸면 뒤의 등록 폼이
  // 그대로 스크롤된다. 시트를 닫으면 화면이 엉뚱한 위치에 가 있게 된다.
  // md 이상에서는 잠그면 안 된다 — 거기서는 딤 없이 필드 아래 붙는 팝업이라
  // 페이지를 굴리지 못하게 만들면 달력을 연 채로 아래 필드를 볼 수 없다.
  // 48rem(768px)은 Tailwind md와 같은 값이다 (프로젝트에서 breakpoint를 덮어쓰지 않았다).
  useEffect(() => {
    if (!isOpen) return;
    const desktopQuery = window.matchMedia("(min-width: 48rem)");
    const previousOverflow = document.body.style.overflow;
    // 연 채로 화면을 회전하거나 창을 늘이면 시트가 팝업으로 바뀌므로 잠금도 따라 풀린다
    const applyLock = () => {
      document.body.style.overflow = desktopQuery.matches
        ? previousOverflow
        : "hidden";
    };
    applyLock();
    desktopQuery.addEventListener("change", applyLock);
    return () => {
      desktopQuery.removeEventListener("change", applyLock);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // 시작일 기준 '최대 3개월'을 넘는 날짜인지 (계약 한도)
  const isOverLimit = (date: Date) =>
    !!startDate && date > addMonthsClamped(startDate, MAX_CONTRACT_MONTHS);

  const handleSelectDate = (date: Date) => {
    // 오늘·과거는 계약 시작일이 될 수 없다.
    // 과거 칸은 disabled라 클릭이 아예 안 오므로 실제로 여기 걸리는 건 오늘뿐이다.
    if (date <= todayStart) {
      // 아래 안내 칸이 한 줄(20px)만 예약하므로 한 줄에 들어가는 길이로 둔다.
      // 실측 252.4px — 360px 기기의 시트 가용 폭 328px 안에 들어간다
      setDateError("오늘은 선택할 수 없어요. 내일부터 골라주세요");
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

  // 밴드(선택 범위를 잇는 하늘색 배경). 칸 전체 높이가 아니라 원과 같은 고정
  // 높이(h-8)의 별도 absolute span에 적용해서, 밴드 세로 길이가 항상 원의
  // 지름과 같아지도록 한다. 숫자 모양(원)은 renderDayNumber가 따로 그린다
  // (게스트 예약 달력과 동일 구조).
  const getBandClassName = (date: Date) => {
    if (isDateDisabled(date)) return "";
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      // 시작일/종료일 칸은 원의 가로 중심까지만 배경을 채운다.
      // 그 바깥쪽(반대쪽 절반)은 배경 없이 비워둬 띠가 원 뒤로 삐져나오지 않게 한다.
      if (isSameDay(date, startDate)) {
        return "bg-[linear-gradient(to_right,transparent_50%,var(--color-primary-100)_50%)]";
      }
      if (isSameDay(date, endDate)) {
        return "bg-[linear-gradient(to_right,var(--color-primary-100)_50%,transparent_50%)]";
      }
      if (date > startDate && date < endDate) {
        return "bg-primary-100";
      }
    }
    return "";
  };

  // 시작·종료·범위 안(양 끝 포함) 날짜인지 → 스크린리더용 aria-pressed.
  // 강조 원(isSelectedEndpoint)과 달리 사이 날짜까지 전부 "선택됨"으로 알린다.
  const isDateSelected = (date: Date) =>
    (!!startDate && isSameDay(date, startDate)) ||
    (!!endDate && isSameDay(date, endDate)) ||
    (!!startDate && !!endDate && date > startDate && date < endDate);

  // 스크린 리더용 날짜 라벨. 오늘은 disabled 속성을 안 쓰는 대신(클릭은 받아야
  // 해서) 라벨에 "선택할 수 없다"는 사실을 직접 알려준다 - 예전엔 aria-disabled로
  // 전달했는데, 공용 CalendarMonthGrid는 그 prop을 따로 받지 않아 라벨 쪽으로 옮겼다.
  // (dev에 별도로 병합된 "오늘 = 회색 테두리 원 + 취소선" 스타일은 CalendarMonthGrid의
  // isToday 분기가 동일하게 그리고, "선택됨 = h-full로 칸을 꽉 채우는 원"이던 부분은
  // 이 리팩터로 다른 두 달력과 동일하게 고정 44px 원으로 통일된다 - 아래 renderMonth 참고.)
  const getDayAriaLabel = (date: Date) => {
    const base = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    return isSameDay(date, todayStart)
      ? `${base}, 오늘은 선택할 수 없어요`
      : base;
  };

  // 딤을 누르거나 시트를 끌어내려 닫을 때 — 고른 범위가 완성돼 있으면 저장하고 닫는다.
  // (바깥 클릭으로 닫는 기존 동작과 같게 맞춘다)
  //
  // 포커스 복원: 팝업이 언마운트되면 그 안에 있던 포커스가 <body>로 떨어져서,
  // 키보드·스크린리더 사용자가 다음 Tab에 문서 맨 처음으로 튄다. 그래서 닫는 경로마다
  // 팝업을 연 버튼으로 되돌린다. 지금 이 함수(딤 탭 / 손잡이 끌어내리기)와
  // Esc(useEffect 안), 확인 버튼(handleConfirm) 세 곳이 전부다.
  // 바깥 클릭(handleClickOutside)만 예외로 둔다 — 그 핸들러는 mousedown에서 돌아
  // 브라우저가 방금 누른 요소로 포커스를 옮기기 '전'이다. 여기서 focus()를 부르면
  // 사용자가 실제로 클릭한 대상에서 포커스를 빼앗고, 곧 브라우저가 다시 덮어써
  // 결과가 브라우저마다 달라진다. 그 경로는 애초에 포인터 조작이라 잃을 포커스가 없다.
  const closeWithSave = () => {
    if (startDate && endDate) onConfirm(toYmd(startDate), toYmd(endDate));
    setIsOpen(false);
    setDragY(0);
    triggerRef.current?.focus();
  };

  // 손잡이 끌기 — 포인터 이벤트라 터치·마우스·펜을 한 번에 받는다.
  // setPointerCapture: 손가락이 손잡이를 벗어나도 이 요소가 계속 move/up을 받게 한다.
  // 이게 없으면 빠르게 내릴 때 시트가 중간에 멈춘다
  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = e.clientY;
    dragYRef.current = 0; // 지난 제스처의 거리가 남아 첫 판정을 흐리지 않게 한다
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    // 아래로 끄는 것만 따라간다 — 위로 올리면 시트가 화면 위로 떠버린다
    const distance = Math.max(0, e.clientY - dragStartRef.current);
    dragYRef.current = distance; // 즉시 반영 (판정용)
    setDragY(distance); // 리렌더를 거쳐 시트를 그린다 (표시용)
  };

  const handleDragEnd = () => {
    if (dragStartRef.current === null) return;
    dragStartRef.current = null;
    setIsDragging(false);
    // 판정은 state가 아니라 ref로 한다. pointermove의 setDragY는 리렌더를 한 번 거치는데,
    // React가 연속 이벤트의 갱신을 뒤로 미룰 수 있어 시트를 빠르게 튕겨 내리면
    // pointerup 시점의 dragY가 마지막 move보다 작다. 그러면 충분히 내렸는데도
    // 닫히지 않고 제자리로 돌아간다. ref는 리렌더를 기다리지 않아 항상 최신이다
    const distance = dragYRef.current;
    dragYRef.current = 0;
    // 100px 넘게 내렸으면 닫고, 아니면 제자리로 되돌린다 (transition이 되돌아가는 걸 그려준다)
    if (distance > 100) closeWithSave();
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

  // 한 달치 달력 카드. arrow로 이 카드에 붙일 화살표를 정한다 (시안: 왼쪽 달 ‹, 오른쪽 달 ›).
  // 그리드는 이 폴더의 ContractCalendarGrid가 그린다 — 공용
  // shared/components/calendar/CalendarMonthGrid를 쓰지 않는 이유는 그 파일 주석 참고
  // (요약: 공용 쪽은 칸 56px·원 44px가 리터럴로 고정돼 이 화면 시안과 다르고,
  //  고치면 검색바 날짜 필터·공간상세 예약 달력까지 같이 흔들린다).
  const renderMonth = (base: Date, arrow: "prev" | "next") => (
    <ContractCalendarGrid
      monthDate={base}
      cells={getCalendarDays(base)}
      showPrevArrow={arrow === "prev" && !isPrevMonthDisabled}
      // md 이상은 두 달을 나란히 보여주므로 오른쪽(arrow="next") 카드가 › 를 전담한다.
      showNextArrow={arrow === "next"}
      // md 미만(바텀시트)은 달 카드가 하나뿐이라 그 카드가 › 도 함께 갖는다.
      // CSS(md:hidden)로 숨기므로 화면을 넓혀도 › 가 두 개로 겹치지 않는다
      showNextArrowOnMobile={arrow === "prev"}
      onPrevMonth={goPrev}
      onNextMonth={goNext}
      isSelectedEndpoint={isSelectedEndpoint}
      isToday={(date) => isSameDay(date, todayStart)}
      isDisabled={isDateDisabled}
      getBandClassName={getBandClassName}
      onSelectDate={handleSelectDate}
      getAriaLabel={getDayAriaLabel}
      isAriaPressed={isDateSelected}
    />
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
        {(
          [
            // key는 상태 식별자, label은 화면 문구 — 둘을 분리해 둔다 (위 openedField 주석)
            { key: "start", date: startDate, label: "시작일" },
            { key: "end", date: endDate, label: "종료일" },
          ] as const
        ).map((field) => {
          // 이 칸이 지금 열려 있는 팝업의 주인인가 → 테두리를 파랗게 칠할지 판단
          const isThisFieldOpen = isOpen && openedField === field.key;
          return (
            <div
              key={field.key}
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
                // isOpen이 아니라 이 칸 기준이다 — 테두리를 칸별로 칠하게 바꾼 순간
                // isOpen을 쓰면 시작일을 눌러 열었는데 종료일 버튼도 "확장됨"으로
                // 읽혀, 화면 상태(회색 테두리)와 스크린리더 상태가 갈라진다
                // (WCAG 4.1.2 Name, Role, Value)
                aria-expanded={isThisFieldOpen}
                aria-controls={popupId}
                // 라벨이 버튼 밖으로 나가면서 두 버튼의 읽히는 이름이 "날짜 선택"으로 같아진다.
                // 어느 필드인지 구분되도록 라벨을 이름에 직접 넣어준다.
                aria-label={`${field.label} ${field.date ? toDisplay(field.date) : "날짜 선택"}`}
                onClick={(e) => {
                  triggerRef.current = e.currentTarget; // 방금 누른 버튼을 기억
                  setDateError(null); // 지난번 안내 문구가 남아있지 않게 지움
                  // 같은 칸을 다시 누르면 닫고, 열려 있는 상태에서 다른 칸을 누르면
                  // 닫지 않고 강조만 그 칸으로 옮긴다 (팝업은 두 칸이 공유한다)
                  setIsOpen(!isThisFieldOpen);
                  setOpenedField(isThisFieldOpen ? null : field.key);
                }}
                // 이슈 #306: 누른 칸만 테두리를 primary로 (default는 divider).
                // 글자색은 여기 한 번만 정하고 아래 아이콘·날짜 글자가 물려받는다 —
                // 아이콘 색과 글자 색이 갈라질 여지를 없앤다.
                // 피그마: 미선택 #808080(text-secondary), 선택 후 #121212(text-primary)
                className={`flex h-14 items-center gap-2 rounded-lg border bg-white px-5 transition-colors ${
                  isThisFieldOpen ? "border-primary" : "border-divider"
                } ${field.date ? "text-text-primary" : "text-text-secondary"}`}
              >
                {/* 아이콘 색을 글자색과 맞춰야 하는데(이슈 #306) icon_calendar.svg 안에
                    fill="#363636"이 하드코딩돼 있어 <img>로는 CSS가 닿지 않는다.
                    그래서 path를 인라인으로 들고 fill="currentColor"로 위 button의
                    글자색을 물려받는 CalendarIcon을 쓴다. mask-image 방식을 왜 버렸는지는
                    CalendarIcon.tsx 주석 참고 (로딩 전 회색 사각형 번쩍임 등).
                    모바일은 아이콘을 빼고 날짜 글자만 둔다 (시안) */}
                <CalendarIcon className="hidden size-8 shrink-0 md:block" />

                {/* 피그마: 미선택 18px/500, 선택 후 18px/700 (둘 다 line-height 140%).
                    색은 위 button이 정한다 */}
                <span
                  className={`text-lg leading-[1.4] ${
                    field.date ? "font-bold" : "font-medium"
                  }`}
                >
                  {field.date ? toDisplay(field.date) : "날짜 선택"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {isOpen && (
        <>
          {/* 딤 — 바텀시트일 때만. md 이상 팝업은 화면을 덮지 않는다.
              닫는 동작은 손잡이로 끌어내릴 때와 같아야 하므로 closeWithSave를 그대로 쓴다.
              같은 코드를 여기 한 번 더 쓰면 나중에 닫기 동작을 바꿀 때 한쪽만 고쳐
              "딤으로 닫을 때와 끌어내려 닫을 때 결과가 다른" 상태가 된다 */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={closeWithSave}
          />

          {/* md 미만: 화면 아래에 붙는 바텀시트 (위 모서리만 radius 20, 안쪽 16, 높이는 내용만큼)
              md 이상: 필드 아래에 뜨는 팝업. 이슈 #306에서 태블릿도 2개월이 되면서 폭을
              다시 정했다.
              폭은 달 카드 폭 × 2다 (ContractCalendarGrid의 시안 규격).
                태블릿 616 = 308 × 2  (768 화면에 들어간다)
                데스크톱 896 = 448 × 2
              max-w-[calc(100vw-2rem)]는 보험이다. md는 폭이 768 이상이므로 616이
              들어가고(768-32=736 > 616), lg는 1024 이상이므로 896이 들어간다
              (1024-32=992 > 896) — 즉 정상 구간에서는 절대 걸리지 않는다. 다만 고정
              px 두 개만 두면 브라우저 확대/축소나 예상 못한 뷰포트에서 가로로 삐져나갈
              수 있고, 이 팝업은 left-1/2 + -translate-x-1/2로 가운데 정렬이라 넘침이
              양쪽으로 생긴다. 상한을 걸어두면 그 경우 폭이 줄어들 뿐 화면을 넘지 않는다
              팝업이 본문(md 535 / lg 644)보다 넓어 좌우로 넘치므로 left-1/2 +
              -translate-x-1/2로 가운데 정렬해 넘침을 대칭으로 만든다.
              MainLayout의 overflow-x-clip이 가로 스크롤바 생성을 막는다 */}
          <div
            id={popupId}
            role="dialog"
            aria-label="계약 가능 기간 선택"
            // 끌어내린 만큼 시트를 내린다. dragY가 0이면 transform을 아예 안 줘야
            // md의 -translate-x-1/2(가로 가운데 정렬)를 덮어쓰지 않는다
            style={{
              transform: dragY ? `translateY(${dragY}px)` : undefined,
              transition: isDragging ? "none" : "transform 200ms ease-out",
            }}
            // 6주짜리 달(예: 2026년 8월)을 펼치면 시트 내용이 키 작은 화면(360×640 등)의
            // 세로 공간을 넘길 수 있다 - max-h-[85vh]로 시트 자체 높이를 뷰포트 안으로 묶고, 아래
            // 스크롤 영역(달력+에러+하단 버튼)만 그 안에서 스크롤되게 한다(월 헤더의
            // ‹/› 화살표나 확인 버튼이 화면 밖으로 밀려 안 보이는 문제 방지 -
            // BottomSheet.tsx와 동일한 max-h-[Nvh] + 내부 overflow-y-auto 패턴).
            // md 이상(딤 없는 팝업)은 원래도 이 문제가 없어 md:max-h-none으로 그대로 둔다.
            className="border-border fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-[20px] border bg-white px-4 pt-1 pb-4 shadow-lg md:absolute md:inset-x-auto md:bottom-auto md:left-1/2 md:z-10 md:mt-2 md:max-h-none md:w-[616px] md:max-w-[calc(100vw-2rem)] md:-translate-x-1/2 md:overflow-hidden md:rounded-lg md:p-0 lg:w-[896px]"
          >
            {/* 손잡이 바 40×4 — 끌어내려 닫는다. 데스크톱 팝업엔 없다.
                py-2로 손가락이 닿는 범위를 바보다 위아래 8씩 넓히고, 시트 pt-1(4)과 합쳐
                바가 시안대로 위에서 12에 놓인다. 아래 mb-1(4)+패딩 8 = 12.
                touch-none: 이게 없으면 브라우저가 끌기를 '페이지 스크롤'로 가로챈다.
                shrink-0: 스크롤 영역이 줄어들어도 손잡이 자체는 항상 맨 위에 고정된
                크기로 남아야 한다(끌어서 닫는 조작 지점이 스크롤에 밀려 사라지면 안 됨). */}
            <div
              role="presentation"
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              className="mb-1 flex shrink-0 cursor-grab touch-none justify-center py-2 active:cursor-grabbing md:hidden"
            >
              <div className="bg-divider h-1 w-10 rounded-full" />
            </div>

            {/* 달력·에러 문구·하단 버튼을 묶는 스크롤 영역 - 모바일에서 시트 높이가
                max-h-[85vh]를 넘으면 이 안에서만 스크롤된다(손잡이는 위에서 고정).
                md 이상은 display:contents로 이 wrapper 자체를 레이아웃에서 지워
                기존처럼 스크롤 없이 그대로 이어 붙는다. */}
            <div className="min-h-0 flex-1 overflow-y-auto md:contents">
              {/* 달 카드 — 모바일(바텀시트)은 1개월, md 이상은 2개월 나란히.
                  ContractCalendarGrid는 모바일에서 자기 좌우 패딩을 두지 않으므로
                  시트의 px-4를 상쇄할 필요가 없다(360 화면에서 칸 너비 328/7 ≈ 46.9px,
                  선택 원 지름 46px보다 넓다). md 이상은 부모가 p-0이다. */}
              <div className="flex">
                {renderMonth(viewDate, "prev")}
                {isTwoMonthView && renderMonth(nextMonth, "next")}
              </div>

              {/* 고를 수 없는 날짜를 눌렀을 때 나타남.
                  role="alert"이면 스크린리더가 포커스를 옮기지 않고도 즉시 읽어준다.
                  Input.tsx는 같은 role을 버리고 aria-live로 갔는데 여기 남긴 이유 둘:
                  (1) 여기는 role을 켰다 끄지 않는다 — 팝업이 열릴 때 빈 상태로 마운트돼
                      라이브 영역 등록이 끝난 뒤 내용만 바뀐다. Input이 문제였던 건
                      텍스트와 role이 같은 커밋에 동시에 생기는 '토글'이었다.
                  (2) 이 문구는 타이핑이 아니라 날짜 탭으로 뜬다. assertive가 끊을
                      낭독이 애초에 없어서 즉시 읽어주는 편이 낫다.
                  이슈 #306: 바텀시트는 아래(bottom-0)에 고정돼 있어 내용이 늘면 위로
                  자라는데, 그러면 손가락 밑에 있던 달력 숫자가 20px 올라가 오탭이 난다.
                  min-h-5(20px = text-sm 한 줄)로 자리를 미리 잡고, 예약한 20을 아래
                  버튼줄 mt-10(40)에서 빼서(mt-5) 시트 전체 높이는 그대로 유지한다.
                  md 이상에서도 예약을 유지한다 — 처음엔 md:min-h-0으로 되돌렸는데,
                  팝오버가 절대배치라 '페이지'는 안 밀려도 팝오버 안의 초기화·확인
                  버튼이 손가락/커서 밑에서 20px 내려가 모바일에서 막으려던 오클릭이
                  그대로 재현됐다. 대신 md 이상 팝오버에 빈 20px가 상시로 남는다 */}
              <p
                role="alert"
                className="text-danger min-h-5 text-sm font-medium md:px-4 lg:px-5"
              >
                {dateError}
              </p>

              {/* 하단 — lg 미만: [초기화] [확인] 우측 정렬, 그리드에서 40 아래
                  (위 안내문 슬롯 20 + mt-5 20 = 40).
                  데스크톱: 왼쪽에 선택 범위 텍스트 + 오른쪽 [확인], padding 20 (기존 그대로) */}
              <div className="mt-5 flex items-center justify-end gap-5 md:mt-0 md:justify-between md:p-4 lg:p-5">
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
                  className="bg-primary-hover flex h-[52px] w-[94px] shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white disabled:opacity-40"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangePicker;
