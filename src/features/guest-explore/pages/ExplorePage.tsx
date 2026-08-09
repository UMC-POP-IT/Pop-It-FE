import { useSearchParams } from "react-router-dom";
import AiRecommendSpace from "../components/AiRecommendSpace";
import ExploreSpace from "../components/ExploreSpace";
import RealTimeRecommendSpace from "../components/RealTimeRecommendSpace";
import Banner from "@/shared/layout/Banner";
import HeroSearchBar from "@/features/guest-explore/components/HeroSearchBar";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import type { ExploreSearchFilters, SpaceCategory } from "@/features/guest-explore/api/space_search_api";

// 검색 실행 여부/조건을 URL 쿼리스트링에 반영한다 - 새로고침해도 결과 화면이
// 유지되고, URL을 복사/공유하면 같은 검색 결과로 다시 진입할 수 있고, 브라우저
// 뒤로가기를 누르면 검색 전 화면으로 자연스럽게 돌아간다.
// 날짜(dateRange)는 백엔드가 날짜 필터를 지원하지 않아(검색 결과에 영향이 없는
// 화면 전용 값) URL에는 반영하지 않는다 - 새로고침/뒤로가기 시 항상 초기화된다.
const SEARCH_FLAG_PARAM = "search";

const filtersFromSearchParams = (
  params: URLSearchParams,
): Pick<ExploreSearchFilters, "keyword" | "spaceCategory" | "district"> => ({
  keyword: params.get("keyword") ?? "",
  spaceCategory: (params.get("spaceCategory") as SpaceCategory | null) ?? "",
  district: params.get("district") ?? "",
});

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 검색을 실제로 실행했는지는 "search=1" 쿼리 존재 여부로 판단한다(필터 값이
  // 전부 비어있어도 - 예: 조건 초기화 후에도 - 결과 화면 자체는 유지되어야 하므로
  // 개별 필터 값 유무만으로는 판단할 수 없다). true면 배너 이미지/AI 추천/실시간
  // 추천이 사라지고 검색 결과 전용 화면(무한스크롤)으로 바뀐다.
  const hasActiveSearch = searchParams.get(SEARCH_FLAG_PARAM) === "1";
  const { keyword, spaceCategory, district } = filtersFromSearchParams(searchParams);
  const searchFilters: ExploreSearchFilters = {
    keyword,
    spaceCategory,
    district,
    dateRange: { start: null, end: null },
  };

  const hasSearched = useSearchHistoryStore((state) => state.hasSearched);

  const handleSearch = (filters: ExploreSearchFilters) => {
    const next = new URLSearchParams();
    next.set(SEARCH_FLAG_PARAM, "1");
    if (filters.keyword) next.set("keyword", filters.keyword);
    if (filters.spaceCategory) next.set("spaceCategory", filters.spaceCategory);
    if (filters.district) next.set("district", filters.district);
    // 아직 결과 화면이 아니었다면(처음 검색) 새 히스토리 항목을 쌓아 뒤로가기로
    // 검색 전 화면에 돌아갈 수 있게 하고, 이미 결과 화면이면(조건만 바꿔 재검색)
    // 히스토리를 계속 쌓지 않도록 현재 항목을 교체한다.
    setSearchParams(next, { replace: hasActiveSearch });
  };

  const handleResetFilters = () => {
    const next = new URLSearchParams();
    next.set(SEARCH_FLAG_PARAM, "1"); // 결과 화면 자체는 유지하고 필터만 비운다
    setSearchParams(next, { replace: true });
  };

  return (
    <div>
      {/* showImage=false여도 Banner는 항상 렌더링해서 HeroSearchBar가 리마운트되지
          않게 한다(리마운트되면 방금 검색한 조건이 검색바 표시에서 날아간다).
          HeroSearchBar 자체는 searchParams.toString()이 바뀔 때만(검색 실행/
          초기화/뒤로가기 등으로 URL이 실제로 바뀔 때만) key가 바뀌어 새로
          마운트되고, 그때마다 URL이 담고 있는 값으로 표시가 다시 맞춰진다. */}
      <Banner showImage={!hasActiveSearch}>
        <HeroSearchBar
          key={searchParams.toString()}
          onSearch={handleSearch}
          variant={hasActiveSearch ? "compact" : "hero"}
          initialKeyword={keyword}
          initialCategory={spaceCategory}
          initialDistrict={district}
        />
      </Banner>

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
