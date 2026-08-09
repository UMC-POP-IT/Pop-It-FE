import { useEffect, useRef, useState } from "react";
import FilterDropdown from "@/features/guest-explore/components/FilterDropdown";
import DateRangeCalendar, { type DateRange } from "@/shared/components/DateRangeCalendar";
import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import type { ScrollSearchBarSummary } from "@/store/scrollSearchBarStore";
import {
  SPACE_CATEGORY_OPTIONS,
  SEOUL_DISTRICTS,
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
const formatShort = (d: Date) => `${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const formatDateRangeLabel = (range: DateRange) => {
  if (!range.start) return "전체";
  if (!range.end || isSameDay(range.start, range.end)) return formatShort(range.start);
  return `${formatShort(range.start)} ~ ${formatShort(range.end)}`;
};

// 세그먼트 트리거 공통 스타일: 라벨(작게) + 값(굵게) 2줄. 열려있는 세그먼트는
// 옅은 파란 배경(bg-primary-light)으로 강조한다. 바깥 pill의 border/구분선은
// HeroSearchBar 래퍼가 담당한다.
const segmentTriggerClassName = (isOpen: boolean) =>
  `flex h-full w-full cursor-pointer flex-col items-start justify-center gap-1.5 px-8 py-4 text-left transition-colors ${
    isOpen ? "bg-primary-light" : ""
  }`;

// 세그먼트 사이 구분선: pill 높이 전체를 가르지 않고 위아래 여백을 살짝 두고
// 세로선만 짧게 긋는다(피그마 디자인 반영).
const SegmentDivider = () => (
  <span aria-hidden="true" className="h-12 w-px shrink-0 self-center bg-[#c5c5c5]" />
);

// 피그마 고정폭(공간유형 227 / 날짜 215 / 지역 215)과 동일하게 맞춘다.
// 날짜 드롭다운 패널을 검색바 왼쪽 라인에 맞추려면(아래 CALENDAR_LEFT_OFFSET_PX)
// 이 폭이 실제 렌더 폭과 항상 같아야 하므로 min-w가 아니라 고정 w로 둔다.
const CATEGORY_SEGMENT_WIDTH_PX = 227;
const DATE_SEGMENT_WIDTH_PX = 215;
const DISTRICT_SEGMENT_WIDTH_PX = 215;
// 날짜 세그먼트 자신의 왼쪽 기준으로 -공간유형폭만큼 당겨서, 패널의 왼쪽 끝이
// 검색바 전체의 왼쪽 끝(공간 유형 라벨 시작 지점)과 정확히 맞도록 한다.
const CALENDAR_LEFT_OFFSET_PX = -CATEGORY_SEGMENT_WIDTH_PX;

interface SegmentTriggerContentProps {
  label: string;
  value: string;
  /** compact(검색 결과 화면)에서는 라벨도 값과 같은 진한 색을 쓴다(피그마 node 5019:73539). */
  labelClassName: string;
}

const SegmentTriggerContent = ({ label, value, labelClassName }: SegmentTriggerContentProps) => (
  <>
    <span className={`text-[18px] leading-[1.4] ${labelClassName}`}>{label}</span>
    <span className="text-text-primary text-[20px] leading-[1.4] font-bold">{value}</span>
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
}: HeroSearchBarProps) => {
  const [keywordInput, setKeywordInput] = useState(initialKeyword);
  const [category, setCategory] = useState<SpaceCategory | "">(initialCategory);
  const [district, setDistrict] = useState(initialDistrict);
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const dateContainerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dateContainerRef, () => setIsDateOpen(false), isDateOpen);

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
        : (CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? "전체"),
      dateLabel: isDefaultDate ? "날짜 전체" : formatDateRangeLabel(dateRange),
      districtLabel: DISTRICT_OPTIONS.find((option) => option.value === district)?.label ?? "서울 전체",
      keywordLabel: keywordInput.trim() || "검색어 추가",
    });
    // onSummaryChange는 상위에서 매 렌더 새로 만들어질 수 있어 deps에 넣지 않는다
    // (넣으면 상위 리렌더마다 불필요하게 재계산된다 - 값 자체는 아래 4개에만 의존한다).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, dateRange, district, keywordInput]);

  const isCompact = variant === "compact";
  const labelClassName = isCompact ? "text-text-primary" : "text-text-secondary";
  const outerBorderClassName = isCompact
    ? "border-[3px] border-primary-hover"
    : "border border-text-secondary";

  const handleSubmit = () => {
    setIsDateOpen(false);
    markSearched();
    onSearch({
      keyword: keywordInput.trim(),
      spaceCategory: category,
      district,
      dateRange,
    });
  };

  return (
    // overflow-x-auto를 이 바깥에 씌우는 버전은 되돌렸다 - overflow-x를
    // visible이 아닌 값으로 두면 브라우저가 overflow-y도 자동으로 clip 처리해
    // 버려서(overflow-x/y는 둘 다 visible이거나 둘 다 아니어야 하는 CSS 규칙),
    // 드롭다운/캘린더처럼 이 바 밖으로(아래로) 튀어나가야 하는 absolute 패널이
    // 다 잘리거나 이상한 위치에 렌더링되는 심각한 회귀가 생겼다. 좁은 화면에서
    // 고정폭 세그먼트가 넘칠 수 있는 문제는 이 방식으로는 해결하지 않는다(별도
    // 모바일 레이아웃 설계가 필요) - 지금은 기존처럼 데스크톱 고정폭을 그대로
    // 쓰고, overflow-hidden도 주지 않는다(같은 이유로 패널이 잘려 보인다).
    <div className={`flex items-stretch rounded-full bg-white ${outerBorderClassName}`}>
      <div className="flex shrink-0 items-stretch" style={{ width: CATEGORY_SEGMENT_WIDTH_PX }}>
        <FilterDropdown
          ariaLabel="공간 용도 필터"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
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
        className="relative flex shrink-0 items-stretch"
        style={{ width: DATE_SEGMENT_WIDTH_PX }}
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
        {isDateOpen && (
          <div
            className="absolute top-full z-20 mt-2"
            style={{ left: CALENDAR_LEFT_OFFSET_PX }}
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

      <div className="flex shrink-0 items-stretch" style={{ width: DISTRICT_SEGMENT_WIDTH_PX }}>
        <FilterDropdown
          ariaLabel="지역(구) 필터"
          options={DISTRICT_OPTIONS}
          value={district}
          onChange={setDistrict}
          maxVisibleOptions={DISTRICT_MAX_VISIBLE_OPTIONS}
          triggerClassName={segmentTriggerClassName}
          renderTrigger={({ selected }) => (
            <SegmentTriggerContent
              label="지역"
              value={selected?.label ?? "서울 전체"}
              labelClassName={labelClassName}
            />
          )}
        />
      </div>

      <SegmentDivider />

      <div className="flex flex-1 items-center gap-2.5 pr-3">
        <div className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-4">
          <label htmlFor="hero-search-keyword" className={`text-[18px] leading-[1.4] ${labelClassName}`}>
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
            placeholder="공간 · 지역 세부 검색"
            className="text-text-primary placeholder:text-text-placeholder w-full text-[20px] leading-[1.4] font-medium outline-none"
          />
        </div>
        <button
          type="button"
          aria-label="검색"
          onClick={handleSubmit}
          className="bg-primary-hover flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HeroSearchBar;
