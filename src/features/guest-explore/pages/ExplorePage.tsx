import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AiRecommendSpace from "@/features/guest-explore/components/AiRecommendSpace";
import ExploreSpace from "@/features/guest-explore/components/ExploreSpace";
import RealTimeRecommendSpace from "@/features/guest-explore/components/RealTimeRecommendSpace";
import Banner, { RESULTS_MODE_TOP_OFFSET_PX } from "@/shared/layout/Banner";
import HeroSearchBar from "@/features/guest-explore/components/HeroSearchBar";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { useScrollSearchBarStore, type ScrollSearchBarSummary } from "@/store/scrollSearchBarStore";
import { withSearchBarTransition } from "@/shared/utils/viewTransition";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import {
  SPACE_CATEGORY_OPTIONS,
  SEOUL_DISTRICTS,
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
const VALID_DISTRICTS = new Set<string>(SEOUL_DISTRICTS);

// 검색어는 그냥 화면에 표시되고 백엔드로 그대로 전달될 뿐이라 XSS/인젝션
// 위험은 없지만(React가 알아서 이스케이프하고, 요청도 쿼리스트링으로 안전하게
// 인코딩된다), URL을 직접 조작해서 비정상적으로 긴 문자열을 넣으면 화면
// 레이아웃이 깨지거나 불필요하게 큰 요청이 나갈 수 있다. 앞뒤 공백을 지우고
// 길이를 제한해서 방어한다.
const MAX_KEYWORD_LENGTH = 100;

const pad2 = (n: number) => String(n).padStart(2, "0");
/** Date → "YYYY-MM-DD"(로컬 날짜, 타임존 변환 없이 그대로). */
const formatDateParam = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
/** "YYYY-MM-DD" → Date. 형식이 안 맞거나 없으면 null(잘못된 URL을 조용히 무시). */
const parseDateParam = (value: string | null): Date | null => {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  // new Date(y, m, d)는 2026-02-30처럼 없는 날짜를 에러 없이 다음 달로 넘겨서
  // "만들어"버린다(getTime()이 NaN이 아니게 됨). 실제로 만들어진 날짜가 입력한
  // 연/월/일과 정확히 같은지 역으로 검증해서 이런 정규화된 날짜를 걸러낸다.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

const filtersFromSearchParams = (params: URLSearchParams): ExploreSearchFilters => {
  // URL은 사용자가 직접 편집하거나 오래된 링크를 통해 들어올 수 있어, 실제
  // 존재하는 카테고리/지역 값인지 검증한다. 검증 없이 그냥 캐스팅만 하면 잘못된
  // 값이 그대로 FilterDropdown(라벨을 못 찾아 빈 칸)과 getSpaces 요청(백엔드가
  // 모르는 값)까지 흘러들어간다.
  const rawCategory = params.get("spaceCategory");
  const spaceCategory: SpaceCategory | "" =
    rawCategory && VALID_SPACE_CATEGORIES.has(rawCategory) ? (rawCategory as SpaceCategory) : "";

  const rawDistrict = params.get("district");
  const district = rawDistrict && VALID_DISTRICTS.has(rawDistrict) ? rawDistrict : "";

  const rawKeyword = params.get("keyword")?.trim() ?? "";

  return {
    keyword: rawKeyword.slice(0, MAX_KEYWORD_LENGTH),
    spaceCategory,
    district,
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
  // 검색 결과가 실제로 있을 때만(카드가 있어야 스크롤할 내용도 있다) 축소 pill
  // 모핑 기능을 켠다 - "조건에 맞는 공간이 없어요" 빈 결과 화면에서는 이 기능
  // 자체가 필요 없다(ExploreSpace가 결과 유무를 알려준다).
  const [hasResults, setHasResults] = useState(false);
  // Header.tsx의 축소 pill은 좁은 화면에 넣을 공간이 없어 `hidden md:flex`로
  // md(768px) 미만에서 아예 숨긴다. 그런데 검색바를 md 미만에서도 접기만 하면
  // 큰 검색바도 사라지고(pill은 안 보이니) 되돌릴 방법이 없어져서 스크롤을
  // 맨 위로 올리기 전까진 검색 조건에 다시 접근할 수 없는 함정이 생긴다(코드래빗
  // 리뷰 지적). 그래서 이 축소 기능 자체를 Tailwind md 브레이크포인트와 맞춰
  // 데스크톱에서만 켠다 - 모바일에서는 검색바가 항상 원래 자리에 그대로 있다.
  const isDesktop = useMediaQuery("(min-width: 768px)");
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
    // 재검색하면 펼쳐져 있던 오버레이는 접어서 결과에 집중시킨다(모핑 애니메이션 포함).
    withSearchBarTransition(() => setIsOverlayOpen(false));
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
    if (!hasActiveSearch || !hasResults || !isDesktop) {
      setIsScrolledPastBar(false);
      return;
    }
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = !entry.isIntersecting;
        // 스크롤로 큰 검색바 ↔ 헤더 pill이 서로 자리를 넘겨받는 순간이라
        // View Transition으로 감싼다 - 모핑 애니메이션이 재생된다.
        withSearchBarTransition(() => setIsScrolledPastBar(next));
      },
      { rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px` },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasActiveSearch, hasResults, isDesktop]);

  // 스크롤을 다시 올려 원래 검색바가 보이게 되면, 열려있던 오버레이도 접는다.
  useEffect(() => {
    if (!isScrolledPastBar) setIsOverlayOpen(false);
  }, [isScrolledPastBar]);

  // 오버레이가 펼쳐져 있을 때 Escape로 닫는다(바깥 클릭 닫기와 동일한 동작).
  // 닫은 뒤에는 포커스가 사라지지 않도록 헤더의 pill 트리거로 되돌린다 -
  // Header.tsx가 스토어에 등록해둔 focusTrigger를 통해서만 접근 가능하다.
  useEffect(() => {
    if (!isOverlayOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        withSearchBarTransition(() => setIsOverlayOpen(false));
        useScrollSearchBarStore.getState().focusTrigger?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOverlayOpen]);

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
      // pill을 눌러 펼치는 순간도 모핑 애니메이션이 재생되도록 감싼다.
      onExpand: () => withSearchBarTransition(() => setIsOverlayOpen(true)),
    });
  }, [hasActiveSearch, isScrolledPastBar, isOverlayOpen, summary, setScrollSearchBarState, resetScrollSearchBar]);

  // 페이지를 떠날 때(라우트 이동)도 헤더에 남아있는 pill 상태를 정리한다.
  useEffect(() => resetScrollSearchBar, [resetScrollSearchBar]);

  const searchBarPosition =
    hasActiveSearch && hasResults && isDesktop && isScrolledPastBar
      ? isOverlayOpen
        ? "pinned-open"
        : "pinned-hidden"
      : "inline";

  // 검색 직후 최상단(아직 스크롤 안 함)에서는 결과화면 전용 스타일(굵은 파란
  // 테두리, 피그마 node 5019:73539)을 쓰고, 스크롤해서 헤더 pill로 축소됐다가
  // 다시 펼친 오버레이에서는 첫 메인페이지(hero)와 같은 회색 테두리 디자인을
  // 쓴다 - 헤더가 그대로 이어지는 느낌을 주려면 배너의 기본 검색바와 같은
  // 스타일이어야 한다(피그마 Frame 2147225751).
  const heroSearchBarVariant = !hasActiveSearch ? "hero" : isScrolledPastBar ? "hero" : "compact";

  return (
    <div>
      {/* 스크롤 감지용 - 검색바가 원래 있던 지점을 표시하는 빈 sentinel.
          Banner보다 앞(형제)에 있어서 그냥 두면 Banner 자신의 상단 여백
          (RESULTS_MODE_TOP_OFFSET_PX)만큼 실제 검색바 시작 위치보다 위에
          찍힌다 - marginTop으로 같은 값을 더해서 정확히 검색바 상단과
          맞춘다(값 자체는 Banner.tsx가 export하는 상수 하나만 참조하므로,
          그쪽 여백이 바뀌어도 여기 값이 조용히 어긋나지 않는다). */}
      {hasActiveSearch && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          style={{ marginTop: RESULTS_MODE_TOP_OFFSET_PX }}
        />
      )}

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
          isMorphTarget={searchBarPosition !== "pinned-hidden"}
        />
      </Banner>

      {/* 오버레이가 펼쳐져 있을 때, 바깥(콘텐츠) 클릭하면 접는다 */}
      {searchBarPosition === "pinned-open" && (
        <div
          aria-hidden="true"
          onClick={() => withSearchBarTransition(() => setIsOverlayOpen(false))}
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
        onHasResultsChange={(next) => withSearchBarTransition(() => setHasResults(next))}
      />
    </div>
  );
};
