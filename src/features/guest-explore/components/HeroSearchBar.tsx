import { useEffect, useRef, useState } from "react";
import FilterDropdown from "@/features/guest-explore/components/FilterDropdown";
import DateRangeCalendar, {
  type DateRange,
} from "@/shared/components/DateRangeCalendar";
import BottomSheet from "@/shared/components/BottomSheet";
import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import type { ScrollSearchBarSummary } from "@/store/scrollSearchBarStore";
import {
  SEARCH_BAR_VIEW_TRANSITION_NAME,
  type MorphTransitionStyle,
} from "@/shared/utils/viewTransition";
import {
  SPACE_CATEGORY_OPTIONS,
  SEOUL_DISTRICTS,
  MAX_KEYWORD_LENGTH,
  type SpaceCategory,
  type ExploreSearchFilters,
} from "@/features/guest-explore/api/space_search_api";

const byKoreanLabel = <T extends { label: string }>(a: T, b: T) =>
  a.label.localeCompare(b.label, "ko");

const CATEGORY_OPTIONS: { value: SpaceCategory | ""; label: string }[] = [
  { value: "", label: "전체" },
  ...[...SPACE_CATEGORY_OPTIONS].sort(byKoreanLabel),
];

const DISTRICT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "서울 전체" },
  ...SEOUL_DISTRICTS.map((d) => ({ value: d, label: d })).sort(byKoreanLabel),
];

const DISTRICT_MAX_VISIBLE_OPTIONS = 6;

const pad2 = (n: number) => String(n).padStart(2, "0");
const formatShort = (d: Date) =>
  `${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatDateRangeLabel = (range: DateRange) => {
  if (!range.start) return "전체";
  if (!range.end || isSameDay(range.start, range.end))
    return formatShort(range.start);
  return `${formatShort(range.start)} ~ ${formatShort(range.end)}`;
};

// 세그먼트 트리거 공통 스타일: 라벨(작게) + 값(굵게) 2줄. 열려있는 세그먼트는
// 옅은 파란 배경(bg-primary-light)으로 강조한다. 바깥 pill의 border/구분선은
// HeroSearchBar 래퍼가 담당한다.
// 모바일(360~767): 피그마 스펙상 세그먼트 안쪽 여백이 훨씬 좁다(px-[10px] 안팎) -
// 데스크톱/태블릿 px-8 py-4를 그대로 쓰면 3등분된 328px 폭 안에서 라벨+값이
// 줄바꿈되거나 넘친다. md(768) 미만에서만 좁은 여백을 쓰고 그 이상은 기존 그대로.
const segmentTriggerClassName = (isOpen: boolean) =>
  `flex h-full w-full min-w-0 cursor-pointer flex-col items-start justify-center gap-1 overflow-hidden px-5 py-2.5 text-left transition-colors md:gap-1.5 md:px-8 md:py-4 ${
    isOpen ? "bg-primary-light" : ""
  }`;

// 세그먼트 사이 구분선: pill 높이 전체를 가르지 않고 위아래 여백을 살짝 두고
// 세로선만 짧게 긋는다(피그마 디자인 반영).
const SegmentDivider = () => (
  <span
    aria-hidden="true"
    className="h-12 w-px shrink-0 self-center bg-[#c5c5c5]"
  />
);

// 피그마 데스크톱 고정폭(공간유형 227 / 날짜 215 / 지역 215 / 검색어+버튼 543)을
// lg(1024) 이상에서의 "기준 비율"로 쓴다. 브레이크포인트는 총 2개(md 768, lg
// 1024)뿐이고 lg 이상은 항상 이 한 줄 레이아웃이어야 한다 - lg에서 xl로 전환
// 시점을 늦추는 방식으로 잘림 문제를 피했던 이전 버전은 1024~1279px 구간에서
// 검색바가 다시 2줄로 보이는 회귀를 만들어서 되돌렸다.
// 4세그먼트는 뷰포트가 커지거나 작아질 때 검색어 세그먼트 혼자만 늘고 주는 게
// 아니라 넷 다 같이 비례해서 늘고 줄어야 한다 - 그래서 각 세그먼트의
// lg:grow-[N]을 그 세그먼트의 lg:basis-[Npx]와 같은 숫자로 맞췄다(227/215/215/543).
// flex-grow/flex-shrink는 basis 대비 비율로 여유/부족 폭을 나누기 때문에, grow
// 값을 basis와 동일하게 맞추면 늘어날 때도 줄어들 때도 항상 227:215:215:543
// 비율을 유지한 채로 함께 커지고 작아진다(전에는 세 필터가 lg:grow-0이라 남는
// 폭을 검색어 혼자 grow-1로 다 흡수했었다). 각 세그먼트에는 min-width도 같이
// 둬서 아무리 좁아져도 라벨/값 텍스트가 겹치지 않게 하고, 특히 검색어 세그먼트는
// "공간 · 지역 세부 검색" placeholder 전체가 항상 보이도록 min-width를 넉넉히
// 잡았다(아래 keywordContent의 min-w-[180px], 그리고 검색어+버튼 wrapper의
// min-w-[300px]). 날짜 드롭다운 패널 위치(아래 CALENDAR_LEFT_OFFSET_PX)는
// 공간유형 세그먼트가 축소 없이 227px 그대로일 때 기준으로 계산되므로, 아주
// 좁은 lg 구간(예: 1024px 근처)에서 세그먼트가 실제로 조금 줄어들면 패널이
// 몇 px 정도 어긋날 수 있다 - 텍스트가 잘리는 것보다는 훨씬 가벼운 문제라
// 감수한다.
const CATEGORY_SEGMENT_WIDTH_PX = 227;
// 날짜 세그먼트 자신의 왼쪽 기준으로 -공간유형폭만큼 당겨서, 패널의 왼쪽 끝이
// 검색바 전체의 왼쪽 끝(공간 유형 라벨 시작 지점)과 정확히 맞도록 한다.
// lg 고정폭 레이아웃에서만 유효한 값이라 lg 미만에서는 쓰지 않는다(아래 참고).
const CALENDAR_LEFT_OFFSET_PX = -CATEGORY_SEGMENT_WIDTH_PX;

interface SegmentTriggerContentProps {
  label: string;
  value: string;
  /** compact(검색 결과 화면)에서는 라벨도 값과 같은 진한 색을 쓴다(피그마 node 5019:73539). */
  labelClassName: string;
}

// 피그마 모바일 스펙: 라벨 12px / 값 14px (태블릿 이상은 기존 18px/20px 유지).
const SegmentTriggerContent = ({
  label,
  value,
  labelClassName,
}: SegmentTriggerContentProps) => (
  <>
    <span
      className={`block max-w-full truncate text-[12px] leading-[1.4] md:text-[18px] ${labelClassName}`}
    >
      {label}
    </span>
    <span className="text-text-primary block max-w-full truncate text-[14px] leading-[1.4] font-bold md:text-[20px]">
      {value}
    </span>
  </>
);

interface HeroSearchBarProps {
  onSearch: (filters: ExploreSearchFilters) => void;
  /**
   * "hero"(기본값) - 히어로 배너 안(검색 전) 스타일: 얇은 회색 테두리, 라벨은
   * 옅은 회색(text-text-secondary).
   * "compact" - 검색 실행 후 결과 화면 상단 스타일(피그마 node 5019:73539):
   * 굵은 파란 테두리(border-primary-hover), 라벨도 값과 같은 진한 색.
   * 세그먼트 폭/구조는 두 변형이 동일해서(고정폭이라 날짜 패널 위치 계산도 그대로
   * 재사용 가능) 컴포넌트를 나누지 않고 테두리·라벨 색만 갈아끼운다.
   */
  variant?: "hero" | "compact";
  /**
   * URL 쿼리스트링에서 복원한 초기값(딥링크/뒤로가기/조건 초기화 대응).
   * 상위(ExplorePage)가 URL이 바뀔 때마다 이 컴포넌트를 key로 새로 마운트시켜서
   * 넘겨주므로, 여기서는 useState의 초기값으로만 쓰면 된다.
   */
  initialKeyword?: string;
  initialCategory?: SpaceCategory | "";
  initialDistrict?: string;
  /**
   * 날짜도 URL에 반영된다(getSpaces 요청에는 여전히 실어 보내지 않지만, 검색
   * 실행 직후·새로고침·뒤로가기 때 화면에서 조용히 사라지지 않도록 화면 표시용
   * 상태만 복원한다).
   */
  initialDateRange?: DateRange;
  /**
   * 지금 화면에 표시 중인 라벨(공간유형/날짜/지역/검색어)이 바뀔 때마다 호출된다.
   * 검색 결과 화면(compact)에서 스크롤을 내렸을 때 헤더에 뜨는 축소된 pill이
   * 이 라벨을 그대로 재사용한다(ExplorePage가 받아서 scrollSearchBarStore에
   * 채워 넣으면 Header가 구독해서 그린다) - 라벨 계산 로직을 여기 한 곳에만
   * 두기 위함이다.
   */
  onSummaryChange?: (summary: ScrollSearchBarSummary) => void;
  /**
   * 지금 화면에 실제로 보이는 "큰 검색바"가 이 인스턴스일 때만 true로 넘긴다.
   * true일 때만 View Transition 공유 이름(search-bar)을 부여해서, 스크롤로
   * 헤더의 축소 pill로 접히거나 pill을 눌러 다시 펼칠 때 한 엘리먼트가 다른
   * 엘리먼트로 모핑되는 것처럼 보이게 한다(ExplorePage가 searchBarPosition으로
   * 계산해서 내려준다. 자세한 설명은 src/shared/utils/viewTransition.ts 참고).
   * 헤더의 축소 pill도 같은 이름을 쓰므로, 항상 둘 중 하나만 true여야 한다.
   */
  isMorphTarget?: boolean;
}

/**
 * 통합 검색바. 히어로 배너(검색 전)와 검색 결과 화면 상단(검색 후) 두 곳에서
 * variant만 다르게 재사용된다.
 * 공간유형/날짜/지역은 선택 즉시 반영되지 않고, 검색 버튼(또는 검색어 입력에서
 * Enter)을 눌러야 한 번에 확정되어 onSearch로 전달된다 - AI 맞춤형 공간 노출
 * 조건("검색을 실행한 적 있음")과 의미를 맞추기 위함이다.
 */
const HeroSearchBar = ({
  onSearch,
  variant = "hero",
  initialKeyword = "",
  initialCategory = "",
  initialDistrict = "",
  initialDateRange = { start: null, end: null },
  onSummaryChange,
  isMorphTarget = false,
}: HeroSearchBarProps) => {
  const [keywordInput, setKeywordInput] = useState(initialKeyword);
  const [category, setCategory] = useState<SpaceCategory | "">(initialCategory);
  const [district, setDistrict] = useState(initialDistrict);
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const dateContainerRef = useRef<HTMLDivElement>(null);

  // 모바일(360~767)에서는 캘린더가 BottomSheet(portal, document.body 자식)로
  // 뜨기 때문에 dateContainerRef 바깥으로 취급돼 useOutsideClick이 시트 안
  // 클릭까지 "바깥 클릭"으로 오인해 mousedown 시점에 먼저 닫아버린다(그러면
  // 그 뒤에 오는 click 이벤트가 이미 사라진 옵션 버튼을 못 찾아 선택 자체가
  // 씹힌다) - 모바일에서는 이 훅을 끄고 BottomSheet 자체의 백드롭/Escape 닫기만 쓴다.
  const isMobile = useMediaQuery("(max-width: 767px)");
  useOutsideClick(
    dateContainerRef,
    () => setIsDateOpen(false),
    isDateOpen && !isMobile,
  );

  // lg(1024) 이상에서 데스크톱 고정폭 한 줄 레이아웃을 쓴다 - 브레이크포인트는
  // 총 2개(md 768, lg 1024)뿐이고 1024 이상은 항상 한 줄이어야 한다. 1024~1180px
  // 구간에서 검색어 세그먼트가 잘리던 문제는 브레이크포인트를 옮기는 대신
  // 세그먼트 폭 자체를 그 구간에서 줄어들 수 있게(basis+min-width) 고쳤다 -
  // 아래 세그먼트 wrapper의 lg:basis-*/lg:min-w-* 참고.
  const isWideDesktop = useMediaQuery("(min-width: 1024px)");

  const markSearched = useSearchHistoryStore((s) => s.markSearched);

  useEffect(() => {
    // 축소된 pill은 "공간유형 라벨 / 값" 처럼 2줄로 구분되지 않고 한 줄에
    // 이어 붙기 때문에, 기본값일 때 그냥 "전체"만 쓰면 뭐가 전체인지 구분이
    // 안 된다. 그래서 pill 요약에서만 "공간 전체"/"날짜 전체"로 접두어를
    // 붙인다 - 메인 검색바 세그먼트 자체(라벨이 위에 따로 있어 구분이 되는
    // 곳)에 쓰이는 CATEGORY_OPTIONS 기본 라벨/formatDateRangeLabel은 그대로 둔다.
    const isDefaultCategory = category === "";
    const isDefaultDate = !dateRange.start;
    onSummaryChange?.({
      categoryLabel: isDefaultCategory
        ? "공간 전체"
        : (CATEGORY_OPTIONS.find((option) => option.value === category)
            ?.label ?? "전체"),
      dateLabel: isDefaultDate ? "날짜 전체" : formatDateRangeLabel(dateRange),
      districtLabel:
        DISTRICT_OPTIONS.find((option) => option.value === district)?.label ??
        "서울 전체",
      keywordLabel: keywordInput.trim() || "검색어 추가",
    });
    // onSummaryChange는 상위에서 매 렌더 새로 만들어질 수 있어 deps에 넣지 않는다
    // (넣으면 상위 리렌더마다 불필요하게 재계산된다 - 값 자체는 아래 4개에만 의존한다).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, dateRange, district, keywordInput]);

  const isCompact = variant === "compact";
  const labelClassName = isCompact
    ? "text-text-primary"
    : "text-text-secondary";
  const outerBorderClassName = isCompact
    ? "border-[3px] border-primary-hover"
    : "border border-text-secondary";
  const morphStyle: MorphTransitionStyle | undefined = isMorphTarget
    ? { viewTransitionName: SEARCH_BAR_VIEW_TRANSITION_NAME }
    : undefined;

  const handleSubmit = () => {
    setIsDateOpen(false);
    markSearched();
    onSearch({
      // input에 maxLength를 걸어뒀지만, 붙여넣기 등으로 넘는 값이 들어올 수
      // 있으니 실제로 검색을 확정하는 여기서도 한 번 더 자른다(ExplorePage의
      // URL 복원 경로와 같은 상한을 쓴다 - space_search_api.ts 참고).
      keyword: keywordInput.trim().slice(0, MAX_KEYWORD_LENGTH),
      spaceCategory: category,
      district,
      dateRange,
    });
  };

  // 검색어 입력 + 검색 버튼. 데스크톱(lg)에서는 아래 pill 안에 그대로 이어붙는
  // 4번째 세그먼트라 자체 배경/테두리가 없고, 태블릿에서는 독자적인 pill(Box B)
  // 안에 들어가므로 두 군데에서 그대로 재사용한다(중복 작성 방지).
  const keywordContent = (
    <>
      <div className="flex min-w-[180px] flex-1 flex-col justify-center gap-1.5 px-5 py-2 md:px-8 md:py-4 lg:px-5">
        {/* 피그마 모바일 스펙(node 5299:35318)에는 이 "검색어" 라벨이 화면에
            보이지 않고 placeholder만 한 줄로 보인다 - 다만 접근성상 label 자체를
            없애면 스크린 리더 사용자가 인풋의 용도를 알 수 없으므로, DOM에서
            지우는 대신 시각적으로만 숨긴다(sr-only). md(768) 이상은 기존처럼 노출. */}
        <label
          htmlFor="hero-search-keyword"
          className={`text-[18px] leading-[1.4] max-md:sr-only ${labelClassName}`}
        >
          검색어
        </label>
        <input
          id="hero-search-keyword"
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          maxLength={MAX_KEYWORD_LENGTH}
          placeholder="공간 · 지역 세부 검색"
          // caret-primary: 이슈 #287 - 검색어 입력 커서(caret) 색을 브라우저
          // 기본 검정 대신 브랜드 블루(--color-primary)로 맞춘다.
          className="text-text-primary caret-primary placeholder:text-text-placeholder w-full text-[16px] leading-[1.4] font-medium outline-none md:text-[20px]"
        />
      </div>
      {/* 피그마 스펙(node 5299:39440, 5299:39441) 확정값: 버튼 프레임 68×68px,
          패딩 10px 고정, 그 안의 아이콘 컨테이너 48×48px → 아이콘:버튼 비율 =
          48/68 ≈ 70.59%. 버튼 자체 크기(모바일 36px / 데스크톱 68px)는 그대로
          유지하고, 아이콘만 이 비율로 확대한다. 고정 px 대신 h-[70.59%]/
          w-[70.59%]로 버튼 크기에 상대적으로 지정해서, breakpoint 사이는 물론
          이후 버튼 크기가 바뀌더라도 피그마와 동일한 아이콘:버튼 비율이 항상
          유지된다(px 값을 breakpoint마다 따로 맞추면 비율이 어긋나기 쉽다).
          버튼 모양(rounded-full)은 이미 border-radius: 9999px로, 정사각형
          버튼을 완전한 원으로 만들어 피그마의 rounded-[999px]와 시각적으로
          동일하다. 선 굵기는 피그마 원본 벡터 에셋의 실제 두께를 그대로 가져올
          수 없어(네트워크 제약으로 svg 원본 확보 불가) 스크린샷과 비교해 얇게
          보이도록 strokeWidth를 2 → 1.5로 낮췄다(디자인 QA 피드백: "아이콘이
          두꺼워 보인다"). */}
      <button
        type="button"
        aria-label="검색"
        onClick={handleSubmit}
        className="bg-primary-hover flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white md:size-[68px]"
      >
        <svg
          className="h-[70.59%] w-[70.59%]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M21 21L16.65 16.65"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </>
  );

  return (
    // overflow-x-auto를 이 바깥에 씌우는 버전은 되돌렸다 - overflow-x를
    // visible이 아닌 값으로 두면 브라우저가 overflow-y도 자동으로 clip 처리해
    // 버려서(overflow-x/y는 둘 다 visible이거나 둘 다 아니어야 하는 CSS 규칙),
    // 드롭다운/캘린더처럼 이 바 밖으로(아래로) 튀어나가야 하는 absolute 패널이
    // 다 잘리거나 이상한 위치에 렌더링되는 심각한 회귀가 생겼다. 좁은 화면에서
    // 고정폭 세그먼트가 넘칠 수 있는 문제는 이 방식으로는 해결하지 않는다(별도
    // 모바일 레이아웃 설계가 필요) - 지금은 기존처럼 데스크톱 고정폭을 그대로
    // 쓰고, overflow-hidden도 주지 않는다(같은 이유로 패널이 잘려 보인다).
    // relative + z-10: view-transition-name을 가진 엘리먼트는 그 자체로 새
    // 스태킹 컨텍스트가 된다(View Transitions API의 명세된 부작용). 이 div가
    // isMorphTarget일 때 스태킹 컨텍스트가 되면, 안에 있는 지역/공간유형
    // 드롭다운 패널(z-20)의 z-index가 이 컨텍스트 밖으로 못 나가서, 아래
    // ExploreSpace 카드 그리드(z-index 없음, 문서 순서상 나중 엘리먼트)가 오히려
    // 드롭다운 위로 그려지는 버그가 생겼다. 명시적으로 z-index를 줘서 이 박스
    // 전체(드롭다운 포함)가 항상 카드 그리드보다 위에 그려지도록 고정한다.
    // isWideDesktop(lg, 1024↑): 4세그먼트(공간유형/날짜/지역/검색어)가 전부 "같은
    // border-primary-hover/border-text-secondary 테두리를 공유하는 하나의 pill"
    // 안에 나란히 들어간다 - 예전엔 이걸 "Box A(3세그먼트) + Box B(검색어)를 각각
    // rounded-full로 만든 뒤 맞닿는 쪽 테두리/모서리만 lg:border-*-0·lg:rounded-*-none로
    // 지워서 시각적으로 이어붙이는" 방식으로 구현했었는데, 서로 다른 두 엘리먼트의
    // 테두리를 각자 그린 뒤 픽셀 단위로 맞춰 붙이는 방식이라 데스크톱 폭(예: 1440px)에
    // 따라 Box B가 lg:flex-1로 갖는 폭이 정수 픽셀로 딱 떨어지지 않을 때 두 테두리가
    // 반 픽셀 정도 어긋나 이음매가 잘린 것처럼 보이는 렌더링 버그가 있었다
    // (지역↔검색어 사이 테두리가 끊겨 보인다는 리포트). 그래서 데스크톱에서는 아예
    // 테두리를 공유하는 하나의 div만 쓰도록 되돌리고(이음매 자체가 없음), 태블릿
    // (1024 미만)에서만 기존처럼 독립된 두 pill(Box A: 필터 3종 / Box B: 검색어)을
    // gap-3로 세로로 쌓는 구조를 쓴다.
    <div
      style={morphStyle}
      className="relative z-10 flex flex-col items-stretch gap-2 md:gap-3"
    >
      <div
        className={`flex items-stretch rounded-full bg-white ${outerBorderClassName}`}
      >
        <div className="flex min-w-[33%] flex-1 items-stretch lg:min-w-[100px] lg:shrink lg:grow-[227] lg:basis-[227px]">
          <FilterDropdown
            ariaLabel="공간 용도 필터"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={setCategory}
            // 이슈 #287: 모바일(360~767)에서는 날짜 필터와 동일하게 바텀시트로
            // 통일한다.
            mobileBottomSheet
            // 맨 왼쪽 세그먼트라 열렸을 때 배경(bg-primary-light)이 pill의 둥근
            // 왼쪽 모서리 밖으로 각지게 삐져나오지 않도록 그때만 왼쪽을 둥글린다.
            triggerClassName={(isOpen) =>
              `${segmentTriggerClassName(isOpen)} ${isOpen ? "rounded-l-full" : ""}`
            }
            renderTrigger={({ selected }) => (
              <SegmentTriggerContent
                label="공간 유형"
                value={selected?.label ?? "전체"}
                labelClassName={labelClassName}
              />
            )}
          />
        </div>

        <SegmentDivider />

        <div
          className="relative flex min-w-[33%] flex-1 items-stretch lg:min-w-[100px] lg:shrink lg:grow-[215] lg:basis-[215px]"
          ref={dateContainerRef}
        >
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isDateOpen}
            onClick={() => setIsDateOpen((prev) => !prev)}
            className={segmentTriggerClassName(isDateOpen)}
          >
            <SegmentTriggerContent
              label="날짜"
              value={formatDateRangeLabel(dateRange)}
              labelClassName={labelClassName}
            />
          </button>
          {/* 모바일(360~767): 피그마 스펙대로 날짜 세그먼트를 탭하면 캘린더가
              화면 하단에서 바텀시트로 올라온다(다른 두 필터와 동일 패턴).
              BottomSheet가 role="dialog"/포커스 트랩/Escape 닫기를 이미
              제공하므로 데스크톱처럼 별도 dialog 래퍼를 씌우지 않는다. */}
          {isDateOpen && isMobile && (
            <BottomSheet
              isOpen={isDateOpen}
              onClose={() => setIsDateOpen(false)}
              ariaLabel="날짜 범위 선택"
            >
              <DateRangeCalendar
                value={dateRange}
                onChange={setDateRange}
                onConfirm={() => setIsDateOpen(false)}
                onReset={() => setDateRange({ start: null, end: null })}
              />
            </BottomSheet>
          )}
          {isDateOpen && !isMobile && (
            <div
              role="dialog"
              aria-label="날짜 범위 선택"
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsDateOpen(false);
              }}
              className="absolute top-full z-20 mt-2"
              // lg 미만은 공간유형 세그먼트가 더 이상 고정폭이 아니라서
              // CALENDAR_LEFT_OFFSET_PX로 맞출 기준점이 없다 - 날짜 세그먼트
              // 자신의 왼쪽 끝(left: 0)에 그냥 맞춘다.
              style={{ left: isWideDesktop ? CALENDAR_LEFT_OFFSET_PX : 0 }}
            >
              <DateRangeCalendar
                value={dateRange}
                onChange={setDateRange}
                onConfirm={() => setIsDateOpen(false)}
                onReset={() => setDateRange({ start: null, end: null })}
              />
            </div>
          )}
        </div>

        <SegmentDivider />

        <div className="flex min-w-[33%] flex-1 items-stretch lg:min-w-[100px] lg:shrink lg:grow-[215] lg:basis-[215px]">
          <FilterDropdown
            ariaLabel="지역(구) 필터"
            options={DISTRICT_OPTIONS}
            value={district}
            onChange={setDistrict}
            maxVisibleOptions={DISTRICT_MAX_VISIBLE_OPTIONS}
            // 이슈 #287: 모바일(360~767)에서는 날짜 필터와 동일하게 바텀시트로
            // 통일한다.
            mobileBottomSheet
            // 태블릿 두 줄 레이아웃에서는 Box A(3세그먼트 pill)의 맨 오른쪽
            // 세그먼트가 지역이라, 열렸을 때 배경(bg-primary-light)이 pill의
            // 둥근 오른쪽 모서리 밖으로 각지게 삐져나온다 - 공간유형(맨 왼쪽)에
            // 이미 적용된 것과 같은 방식으로 그때만 오른쪽을 둥글린다. 데스크톱
            // (isWideDesktop)에서는 지역이 더 이상 pill의 맨 오른쪽 세그먼트가
            // 아니라(뒤에 검색어가 이어짐) 항상 각진 상태를 유지해야 한다.
            triggerClassName={(isOpen) =>
              `${segmentTriggerClassName(isOpen)} ${isOpen && !isWideDesktop ? "rounded-r-full" : ""}`
            }
            renderTrigger={({ selected }) => (
              <SegmentTriggerContent
                label="지역"
                value={selected?.label ?? "서울 전체"}
                labelClassName={labelClassName}
              />
            )}
          />
        </div>

        {isWideDesktop && (
          <>
            <SegmentDivider />
            <div className="flex min-w-[300px] shrink grow-[543] basis-[543px] items-center gap-2.5 pr-3">
              {keywordContent}
            </div>
          </>
        )}
      </div>

      {!isWideDesktop && (
        <>
          <div
            className={`flex items-center gap-2.5 rounded-full bg-white py-2.5 pr-3 md:py-0 ${outerBorderClassName}`}
          >
            {keywordContent}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSearchBar;
