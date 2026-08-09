import { useState } from "react";
import AiRecommendSpace from "../components/AiRecommendSpace";
import ExploreSpace from "../components/ExploreSpace";
import RealTimeRecommendSpace from "../components/RealTimeRecommendSpace";
import Banner from "@/shared/layout/Banner";
import HeroSearchBar from "@/features/guest-explore/components/HeroSearchBar";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import {
  EMPTY_SEARCH_FILTERS,
  type ExploreSearchFilters,
} from "@/features/guest-explore/api/space_search_api";

export const ExplorePage = () => {
  // 히어로 검색바에서 확정(검색 버튼/Enter)한 조건. 검색이 한 번이라도 실행됐는지는
  // searchHistoryStore(localStorage)가 별도로 기록해 AI 맞춤형 공간 노출에 쓴다.
  const [searchFilters, setSearchFilters] = useState<ExploreSearchFilters>(EMPTY_SEARCH_FILTERS);
  // empty state의 [조건 초기화]를 누르면 검색바 자체의 입력값도 같이 비워야 해서,
  // HeroSearchBar를 강제로 새로 마운트시켜 내부 상태를 초기화한다.
  const [resetKey, setResetKey] = useState(0);
  const hasSearched = useSearchHistoryStore((state) => state.hasSearched);

  const handleResetFilters = () => {
    setSearchFilters(EMPTY_SEARCH_FILTERS);
    setResetKey((k) => k + 1);
  };

  return (
    <div>
      <Banner>
        <HeroSearchBar key={resetKey} onSearch={setSearchFilters} />
      </Banner>

      {/* 이 브라우저에서 검색을 한 번이라도 실행한 적이 있을 때만 AI 맞춤형 공간을
          보여준다(검색 기록이 없는 첫 방문에는 추천 근거가 없어 노출하지 않음). */}
      {hasSearched && <AiRecommendSpace />}
      <RealTimeRecommendSpace />
      <ExploreSpace filters={searchFilters} onResetFilters={handleResetFilters} />
    </div>
  );
};
