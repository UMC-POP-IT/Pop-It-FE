import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AiRecommendSpace from "@/features/guest-explore/components/AiRecommendSpace";
import ExploreSpace from "@/features/guest-explore/components/ExploreSpace";
import RealTimeRecommendSpace from "@/features/guest-explore/components/RealTimeRecommendSpace";
import Banner from "@/shared/layout/Banner";
import { HEADER_HEIGHT_PX } from "@/shared/layout/Header";
import HeroSearchBar from "@/features/guest-explore/components/HeroSearchBar";
import {
  useScrollSearchBarStore,
  type ScrollSearchBarSummary,
  type SearchBarAutoOpenRequest,
} from "@/store/scrollSearchBarStore";
import { withSearchBarTransition } from "@/shared/utils/viewTransition";
import {
  SPACE_CATEGORY_OPTIONS,
  SEOUL_DISTRICTS,
  MAX_KEYWORD_LENGTH,
  type ExploreSearchFilters,
  type SpaceCategory,
} from "@/features/guest-explore/api/space_search_api";

// 검색 실행 여부/조건을 URL 쿼리스트링에 반영한다 - 새로고침해도 결과 화면이
// 유지되고, URL을 복사/공유하면 같은 검색 결과로 다시 진입할 수 있고, 브라우저
// 뒤로가기를 누르면 검색 전 화면으로 자연스럽게 돌아간다.
// 날짜(dateRange)도 여기 포함해서 URL에 반영한다 - /api/v1/spaces가
// startDate/endDate 쿼리 파라미터를 지원해(#305) ExploreSpace가 getSpaces
// 요청에 실어 보내며, URL에도 담아둬야 검색 실행 직후·새로고침·뒤로가기마다
// 사용자가 고른 날짜가 화면에서 조용히 사라지지 않는다.
const SEARCH_FLAG_PARAM = "search";
const DATE_START_PARAM = "dateStart";
const DATE_END_PARAM = "dateEnd";

const VALID_SPACE_CATEGORIES = new Set<string>(
  SPACE_CATEGORY_OPTIONS.map((option) => option.value),
);
const VALID_DISTRICTS = new Set<string>(SEOUL_DISTRICTS);

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

const filtersFromSearchParams = (
  params: URLSearchParams,
): ExploreSearchFilters => {
  // URL은 사용자가 직접 편집하거나 오래된 링크를 통해 들어올 수 있어, 실제
  // 존재하는 카테고리/지역 값인지 검증한다. 검증 없이 그냥 캐스팅만 하면 잘못된
  // 값이 그대로 FilterDropdown(라벨을 못 찾아 빈 칸)과 getSpaces 요청(백엔드가
  // 모르는 값)까지 흘러들어간다.
  const rawCategory = params.get("spaceCategory");
  const spaceCategory: SpaceCategory | "" =
    rawCategory && VALID_SPACE_CATEGORIES.has(rawCategory)
      ? (rawCategory as SpaceCategory)
      : "";

  const rawDistrict = params.get("district");
  const district =
    rawDistrict && VALID_DISTRICTS.has(rawDistrict) ? rawDistrict : "";

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

  // 스크롤을 내리면 검색바가 헤더의 축소된 pill로 바뀌고, pill을 클릭하면
  // 헤더 바로 아래에 원래 검색바가 오버레이로 다시 펼쳐진다(에어비앤비 참고).
  // 검색을 실행했는지(hasActiveSearch), 결과가 있는지와 무관하게 - 게스트
  // 홈(브라우징 화면)이든 검색 결과 화면이든, 검색 버튼을 눌렀든 안 눌렀든 -
  // 스크롤로 검색바가 헤더 뒤로 넘어가면 항상 pill로 바뀐다(#301).
  const [isScrolledPastBar, setIsScrolledPastBar] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [summary, setSummary] = useState<ScrollSearchBarSummary | null>(null);
  // pill의 특정 세그먼트를 클릭했을 때, 검색창이 펼쳐짐과 동시에 그 세그먼트의
  // 드롭다운/캘린더/검색어 입력도 자동으로 열기 위해 HeroSearchBar에 내려주는
  // 요청(#275). token은 같은 세그먼트를 다시 클릭해도 매번 새 값이어야 하므로
  // 클릭마다 증가시킨다(useRef 카운터 - 리렌더를 유발할 필요는 없다).
  const [autoOpenRequest, setAutoOpenRequest] =
    useState<SearchBarAutoOpenRequest | null>(null);
  const autoOpenTokenRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const setScrollSearchBarState = useScrollSearchBarStore((s) => s.setState);
  const resetScrollSearchBar = useScrollSearchBarStore((s) => s.reset);
  const [pendingFocusRestore, setPendingFocusRestore] = useState(false);

  const handleSearch = (filters: ExploreSearchFilters) => {
    setAutoOpenRequest(null);
    const next = new URLSearchParams();
    next.set(SEARCH_FLAG_PARAM, "1");
    if (filters.keyword) next.set("keyword", filters.keyword);
    if (filters.spaceCategory) next.set("spaceCategory", filters.spaceCategory);
    if (filters.district) next.set("district", filters.district);
    if (filters.dateRange.start)
      next.set(DATE_START_PARAM, formatDateParam(filters.dateRange.start));
    if (filters.dateRange.end)
      next.set(DATE_END_PARAM, formatDateParam(filters.dateRange.end));
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
    setAutoOpenRequest(null);
    setSearchParams(next, { replace: true });
  };

  const handleAutoOpenComplete = useCallback((completedToken: number) => {
    // 완료된 token이 현재 요청의 token과 일치할 때만 autoOpenRequest를 지운다.
    // 그 사이에 새 요청이 왔다면(token이 이미 더 큰 값) 보존한다.
    setAutoOpenRequest((prev) =>
      prev && prev.token === completedToken ? null : prev,
    );
  }, []);

  // 검색바가 원래 있던 자리(Banner 안, sentinel)가 헤더 뒤로 넘어가면
  // "스크롤됨"으로 표시한다. rootMargin으로 헤더 높이만큼 보정해서, 실제로
  // 헤더 뒤에 가려지는 시점과 최대한 맞춘다. hasActiveSearch/결과 유무와
  // 무관하게 항상 감지한다 - 게스트 홈(브라우징 화면)에서도 스크롤을 내리면
  // 무조건 검색바가 헤더의 작은 pill로 올라가야 한다(#301).
  useEffect(() => {
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
  }, []);

  // 스크롤을 다시 올려 원래 검색바가 보이게 되면, 열려있던 오버레이도 접는다.
  useEffect(() => {
    if (!isScrolledPastBar) setIsOverlayOpen(false);
  }, [isScrolledPastBar]);

  // Escape로 오버레이를 닫았을 때 저장한 포커스 복원 요청을 실행한다.
  // 오버레이가 닫히고 pill 세그먼트 버튼이 실제로 렌더된 뒤에야 포커스를
  // 옮겨야 한다 - 그 전에 focus()를 호출하면 버튼이 아직 없어서 실패한다.
  // pill은 isScrolledPastBar && !isOverlayOpen일 때만 마운트되므로, 이 두
  // 조건이 모두 참일 때 requestAnimationFrame으로 렌더 이후 시점을 보장하고
  // 포커스를 복원한다.
  useEffect(() => {
    if (!pendingFocusRestore || !isScrolledPastBar || isOverlayOpen) return;
    const handle = requestAnimationFrame(() => {
      useScrollSearchBarStore.getState().focusTrigger?.();
      setPendingFocusRestore(false);
    });
    return () => cancelAnimationFrame(handle);
  }, [pendingFocusRestore, isScrolledPastBar, isOverlayOpen]);

  // 오버레이가 펼쳐져 있을 때 Escape로 닫는다(바깥 클릭 닫기와 동일한 동작).
  // 닫은 뒤에는 포커스가 사라지지 않도록 헤더의 pill 트리거로 되돌린다 -
  // Header.tsx가 스토어에 등록해둔 focusTrigger를 통해서만 접근 가능하다.
  // Escape는 즉시 포커스를 옮기지 않고 요청만 저장한다 - 오버레이가 닫히고
  // isVisible이 pill 세그먼트 버튼을 다시 렌더한 뒤에 실제로 포커스를 옮긴다.
  useEffect(() => {
    if (!isOverlayOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        withSearchBarTransition(() => setIsOverlayOpen(false));
        setPendingFocusRestore(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOverlayOpen]);

  // 위 상태들을 종합해서 헤더(전역 컴포넌트)가 구독하는 스토어에 반영한다.
  // 이 화면을 벗어나거나 스크롤이 위로 돌아가면 pill을 숨긴다. hasActiveSearch와
  // 무관하게 isScrolledPastBar만으로 판단한다 - 게스트 홈에서도 스크롤로 pill이
  // 떠야 한다(#301).
  useEffect(() => {
    if (!isScrolledPastBar) {
      resetScrollSearchBar();
      return;
    }
    setScrollSearchBarState({
      isVisible: !isOverlayOpen,
      summary,
      // pill을 눌러 펼치는 순간도 모핑 애니메이션이 재생되도록 감싼다.
      // segment가 있으면(pill의 개별 세그먼트를 클릭한 경우) 검색창이 펼쳐짐과
      // 동시에 그 세그먼트의 드롭다운/캘린더/검색어 입력도 열도록 요청을
      // 남긴다(#275) - token은 같은 세그먼트를 다시 클릭해도 매번 새 값이어야
      // HeroSearchBar의 effect가 재반응한다.
      onExpand: (segment) =>
        withSearchBarTransition(() => {
          setIsOverlayOpen(true);
          autoOpenTokenRef.current += 1;
          setAutoOpenRequest({ segment, token: autoOpenTokenRef.current });
        }),
    });
  }, [
    isScrolledPastBar,
    isOverlayOpen,
    summary,
    setScrollSearchBarState,
    resetScrollSearchBar,
  ]);

  // 페이지를 떠날 때(라우트 이동)도 헤더에 남아있는 pill 상태를 정리한다.
  useEffect(() => resetScrollSearchBar, [resetScrollSearchBar]);

  const searchBarPosition = isScrolledPastBar
    ? isOverlayOpen
      ? "pinned-open"
      : "pinned-hidden"
    : "inline";

  // 검색 직후 최상단(아직 스크롤 안 함)에서는 결과화면 전용 스타일(굵은 파란
  // 테두리, 피그마 node 5019:73539)을 쓰고, 스크롤해서 헤더 pill로 축소됐다가
  // 다시 펼친 오버레이에서는 첫 메인페이지(hero)와 같은 회색 테두리 디자인을
  // 쓴다 - 헤더가 그대로 이어지는 느낌을 주려면 배너의 기본 검색바와 같은
  // 스타일이어야 한다(피그마 Frame 2147225751).
  const heroSearchBarVariant = !hasActiveSearch
    ? "hero"
    : isScrolledPastBar
      ? "hero"
      : "compact";

  return (
    <div>
      {/* showImage=false여도 Banner는 항상 렌더링해서 HeroSearchBar가 리마운트되지
          않게 한다(리마운트되면 방금 검색한 조건이 검색바 표시에서 날아간다).
          HeroSearchBar 자체는 searchParams.toString()이 바뀔 때만(검색 실행/
          초기화/뒤로가기 등으로 URL이 실제로 바뀔 때만) key가 바뀌어 새로
          마운트되고, 그때마다 URL이 담고 있는 값으로 표시가 다시 맞춰진다.
          스크롤 감지용 sentinel(검색바가 원래 있던 지점 마커)은 Banner 내부의
          실제 검색바 바로 앞에 심어서 searchBarTopRef로 넘긴다 - 브라우징
          화면(히어로, 세로 중앙 정렬)과 검색 결과 화면(상단 정렬)의 레이아웃이
          서로 달라 바깥에서 픽셀 오프셋을 하드코딩할 수 없다(#301). */}
      <Banner
        showImage={!hasActiveSearch}
        searchBarPosition={searchBarPosition}
        searchBarTopRef={sentinelRef}
      >
        <HeroSearchBar
          key={searchParams.toString()}
          onSearch={handleSearch}
          variant={heroSearchBarVariant}
          initialKeyword={keyword}
          initialCategory={spaceCategory}
          initialDistrict={district}
          initialDateRange={dateRange}
          onSummaryChange={setSummary}
          isMorphTarget={searchBarPosition !== "pinned-hidden"}
          autoOpenRequest={autoOpenRequest}
          onAutoOpenComplete={handleAutoOpenComplete}
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
          AiRecommendSpace는 신규 유저 여부(hasActivityHistory, 서버 응답)를
          이미 자체적으로 확인해서 트래킹 이력이 없으면 스스로 null을 렌더한다
          (컴포넌트 내부 참고). 이 로컬 hasSearched(브라우저별 localStorage)로
          한 번 더 감싸면 두 기준이 어긋날 때 - 예: 다른 기기/세션에서 이미
          검색한 이력이 있는 유저라 서버는 hasActivityHistory=true를 내려줘도
          이 브라우저에 저장된 hasSearched가 false면 - 정상적으로 노출돼야 할
          AI 맞춤형 섹션이 조용히 숨어버리는 문제가 있어 제거했다(코드리뷰
          지적). RealTimeRecommendSpace는 그런 자체 게이팅이 없어 여기 조건이
          유일한 노출 기준이므로 그대로 둔다. */}
      {!hasActiveSearch && <AiRecommendSpace />}
      {!hasActiveSearch && <RealTimeRecommendSpace />}
      {/* 게스트 메인페이지 첫화면(검색 실행 전)에서는 "공간 탐색" 섹션을 노출하지
          않는다 - 검색을 실제로 실행한 뒤(hasActiveSearch)의 결과 화면에서만
          같은 컴포넌트를 검색 결과 그리드로 사용한다(#248).
          마운트/언마운트를 반복하면서 페이지·목록 상태가 초기화되는 것 아니냐는
          리뷰가 있었는데, ExploreSpace 내부의 filterKey가 이미 resultsMode를
          포함하고 있어(컴포넌트 참고) 브라우징↔결과 모드 전환은 마운트 여부와
          무관하게 항상 페이지/목록을 리셋하도록 설계돼 있다 - 즉 언마운트가
          추가로 잃는 상태가 없고, 안 보이는 목록을 계속 백그라운드에서
          불러오지 않아도 되는 지금 방식이 더 낫다고 판단해 유지한다. */}
      {hasActiveSearch && (
        <ExploreSpace
          filters={searchFilters}
          onResetFilters={handleResetFilters}
          resultsMode={hasActiveSearch}
        />
      )}
    </div>
  );
};
