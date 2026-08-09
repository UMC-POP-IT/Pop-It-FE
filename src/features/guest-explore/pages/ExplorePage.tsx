import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AiRecommendSpace from "@/features/guest-explore/components/AiRecommendSpace";
import ExploreSpace from "@/features/guest-explore/components/ExploreSpace";
import RealTimeRecommendSpace from "@/features/guest-explore/components/RealTimeRecommendSpace";
import Banner from "@/shared/layout/Banner";
import HeroSearchBar from "@/features/guest-explore/components/HeroSearchBar";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { useScrollSearchBarStore, type ScrollSearchBarSummary } from "@/store/scrollSearchBarStore";
import {
  SPACE_CATEGORY_OPTIONS,
  type ExploreSearchFilters,
  type SpaceCategory,
} from "@/features/guest-explore/api/space_search_api";

// 검색 실행 여부/조건을 URL 쿼리스트링에 반영한다 - 새로고침해도 결과 화면이
// 유지되고, URL을 복사/공유하면 같은 검색 결과로 다시 진입할 수 있고, 브라우저
// 뒤로가기를 누르면 검색 전 화면으로 자연스럽게 돌아간다.
// 날짜(dateRange)도 여기 포함해서 URL에 반영한다 - 백엔드 /api/v1/spaces가
// 날짜 필터를 지원하지 않아 getSpaces 요청에는 여전히 실어 보내지 않지만
// (ExploreSpace는 filters.dateRange를 아예 읽지 않는다), URL에 안 담으면
// 검색 실행 직후·새로고침·뒤로가기마다 사용자가 고른 날짜가 화면에서 조용히
// 사라져버리는 문제가 있었다.
const SEARCH_FLAG_PARAM = "search";
const DATE_START_PARAM = "dateStart";
const DATE_END_PARAM = "dateEnd";

// Header.tsx의 sticky 헤더 높이(h-[74px])와 반드시 맞춰야 한다.
const HEADER_HEIGHT_PX = 74;

const VALID_SPACE_CATEGORIES = new Set<string>(
  SPACE_CATEGORY_OPTIONS.map((option) => option.value),
);

const pad2 = (n: number) => String(n).padStart(2, "0");
/** Date → "YYYY-MM-DD"(로컬 날짜, 타임존 변환 없이 그대로). */
const formatDateParam = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
/** "YYYY-MM-DD" → Date. 형식이 안 맞거나 없으면 null(잘못된 URL을 조용히 무시). */
const parseDateParam = (value: string | null): Date | null => {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

const filtersFromSearchParams = (params: URLSearchParams): ExploreSearchFilters => {
  // URL은 사용자가 직접 편집하거나 오래된 링크를 통해 들어올 수 있어, 실제
  // 존재하는 카테고리 값인지 검증한다. 검증 없이 그냥 캐스팅만 하면 잘못된
  // 값이 그대로 FilterDropdown(라벨을 못 찾아 빈 칸)과 getSpaces 요청(백엔드가
  // 모르는 카테고리)까지 흘러들어간다.
  const rawCategory = params.get("spaceCategory");
  const spaceCategory: SpaceCategory | "" =
    rawCategory && VALID_SPACE_CATEGORIES.has(rawCategory) ? (rawCategory as SpaceCategory) : "";

  return {
    keyword: params.get("keyword") ?? "",
    spaceCategory,
    district: params.get("district") ?? "",
    dateRange: {
      start: parseDateParam(params.get(DATE_START_PARAM)),
      end: parseDateParam(params.get(DATE_END_PARAM)),
    },
  };
};

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 검색을 실제로 실행했는지는 "search=1" 쿼리 존재 여부로 판단한다(필터 값이
  // 전부 비어있어도 - 예: 조건 초기화 후에도 - 결과 화면 자체는 유지되어야 하므로
  // 개별 필터 값 유무만으로는 판단할 수 없다). true면 배너 이미지/AI 추천/실시간
  // 추천이 사라지고 검색 결과 전용 화면(무한스크롤)으로 바뀐다.
  const hasActiveSearch = searchParams.get(SEARCH_FLAG_PARAM) === "1";
  const searchFilters = filtersFromSearchParams(searchParams);
  const { keyword, spaceCategory, district, dateRange } = searchFilters;

  const hasSearched = useSearchHistoryStore((state) => state.hasSearched);

  // 검색 결과 화면에서 스크롤을 내리면 검색바가 헤더의 축소된 pill로 바뀌고,
  // pill을 클릭하면 헤더 바로 아래에 원래 검색바가 오버레이로 다시 펼쳐진다
  // (에어비앤비 참고). hasActiveSearch가 아닐 때(검색 전 브라우징 화면)는
  // 이 로직 전체가 관여하지 않는다.
  const [isScrolledPastBar, setIsScrolledPastBar] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [summary, setSummary] = useState<ScrollSearchBarSummary | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const setScrollSearchBarState = useScrollSearchBarStore((s) => s.setState);
  const resetScrollSearchBar = useScrollSearchBarStore((s) => s.reset);

  const handleSearch = (filters: ExploreSearchFilters) => {
    const next = new URLSearchParams();
    next.set(SEARCH_FLAG_PARAM, "1");
    if (filters.keyword) next.set("keyword", filters.keyword);
    if (filters.spaceCategory) next.set("spaceCategory", filters.spaceCategory);
    if (filters.district) next.set("district", filters.district);
    if (filters.dateRange.start) next.set(DATE_START_PARAM, formatDateParam(filters.dateRange.start));
    if (filters.dateRange.end) next.set(DATE_END_PARAM, formatDateParam(filters.dateRange.end));
    // 아직 결과 화면이 아니었다면(처음 검색) 새 히스토리 항목을 쌓아 뒤로가기로
    // 검색 전 화면에 돌아갈 수 있게 하고, 이미 결과 화면이면(조건만 바꿔 재검색)
    // 히스토리를 계속 쌓지 않도록 현재 항목을 교체한다.
    setSearchParams(next, { replace: hasActiveSearch });
    setIsOverlayOpen(false); // 재검색하면 펼쳐져 있던 오버레이는 접어서 결과에 집중시킨다
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams();
    next.set(SEARCH_FLAG_PARAM, "1"); // 결과 화면 자체는 유지하고 필터만 비운다
    setSearchParams(next, { replace: true });
  };

  // 검색바가 원래 있던 자리(페이지 맨 위, sentinel)가 헤더 뒤로 넘어가면
  // "스크롤됨"으로 표시한다. rootMargin으로 헤더 높이만큼 보정해서, 실제로
  // 헤더 뒤에 가려지는 시점과 최대한 맞춘다.
  useEffect(() => {
    if (!hasActiveSearch) {
      setIsScrolledPastBar(false);
      return;
    }
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolledPastBar(!entry.isIntersecting),
      { rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px` },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasActiveSearch]);

  // 스크롤을 다시 올려 원래 검색바가 보이게 되면, 열려있던 오버레이도 접는다.
  useEffect(() => {
    if (!isScrolledPastBar) setIsOverlayOpen(false);
  }, [isScrolledPastBar]);

  // 위 상태들을 종합해서 헤더(전역 컴포넌트)가 구독하는 스토어에 반영한다.
  // 이 화면을 벗어나거나 스크롤이 위로 돌아가면 pill을 숨긴다.
  useEffect(() => {
    if (!hasActiveSearch || !isScrolledPastBar) {
      resetScrollSearchBar();
      return;
    }
    setScrollSearchBarState({
      isVisible: !isOverlayOpen,
      summary,
      onExpand: () => setIsOverlayOpen(true),
    });
  }, [hasActiveSearch, isScrolledPastBar, isOverlayOpen, summary, setScrollSearchBarState, resetScrollSearchBar]);

  // 페이지를 떠날 때(라우트 이동)도 헤더에 남아있는 pill 상태를 정리한다.
  useEffect(() => resetScrollSearchBar, [resetScrollSearchBar]);

  const searchBarPosition =
    hasActiveSearch && isScrolledPastBar ? (isOverlayOpen ? "pinned-open" : "pinned-hidden") : "inline";

  // 검색 직후 최상단(아직 스크롤 안 함)에서는 결과화면 전용 스타일(굵은 파란
  // 테두리, 피그마 node 5019:73539)을 쓰고, 스크롤해서 헤더 pill로 축소됐다가
  // 다시 펼친 오버레이에서는 첫 메인페이지(hero)와 같은 회색 테두리 디자인을
  // 쓴다 - 헤더가 그대로 이어지는 느낌을 주려면 배너의 기본 검색바와 같은
  // 스타일이어야 한다(피그마 Frame 2147225751).
  const heroSearchBarVariant = !hasActiveSearch ? "hero" : isScrolledPastBar ? "hero" : "compact";

  return (
    <div>
      {/* 스크롤 감지용 - 검색바가 원래 있던 지점을 표시하는 빈 sentinel */}
      {hasActiveSearch && <div ref={sentinelRef} aria-hidden="true" />}

      {/* showImage=false여도 Banner는 항상 렌더링해서 HeroSearchBar가 리마운트되지
          않게 한다(리마운트되면 방금 검색한 조건이 검색바 표시에서 날아간다).
          HeroSearchBar 자체는 searchParams.toString()이 바뀔 때만(검색 실행/
          초기화/뒤로가기 등으로 URL이 실제로 바뀔 때만) key가 바뀌어 새로
          마운트되고, 그때마다 URL이 담고 있는 값으로 표시가 다시 맞춰진다. */}
      <Banner showImage={!hasActiveSearch} searchBarPosition={searchBarPosition}>
        <HeroSearchBar
          key={searchParams.toString()}
          onSearch={handleSearch}
          variant={heroSearchBarVariant}
          initialKeyword={keyword}
          initialCategory={spaceCategory}
          initialDistrict={district}
          initialDateRange={dateRange}
          onSummaryChange={hasActiveSearch ? setSummary : undefined}
        />
      </Banner>

      {/* 오버레이가 펼쳐져 있을 때, 바깥(콘텐츠) 클릭하면 접는다 */}
      {searchBarPosition === "pinned-open" && (
        <div
          aria-hidden="true"
          onClick={() => setIsOverlayOpen(false)}
          className="fixed inset-0 z-20 bg-black/10"
          style={{ top: HEADER_HEIGHT_PX }}
        />
      )}

      {/* 검색을 실행하기 전(브라우징 모드)에만 AI 맞춤형/실시간 추천을 보여준다.
          AI 맞춤형 공간은 그중에서도 검색 기록이 있을 때만(hasSearched). */}
      {!hasActiveSearch && hasSearched && <AiRecommendSpace />}
      {!hasActiveSearch && <RealTimeRecommendSpace />}
      <ExploreSpace
        filters={searchFilters}
        onResetFilters={handleResetFilters}
        resultsMode={hasActiveSearch}
      />
    </div>
  );
};
