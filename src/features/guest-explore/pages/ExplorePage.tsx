import AiRecommendSpace from "../components/AiRecommendSpace";
import ExploreSpace from "../components/ExploreSpace.tsx";
import RealTimeRecommendSpace from "../components/RealTimeRecommendSpace";

export const ExplorePage = () => {
  return (
    <div>
      <AiRecommendSpace />
      <RealTimeRecommendSpace />
      <ExploreSpace />
    </div>
  );
};