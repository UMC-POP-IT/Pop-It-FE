import { useNavigate } from "react-router-dom";
import SpaceCard from "@/shared/components/SpaceCard";
import ExploreSearchFilterBar from "./ExploreSearchFilterBar.tsx";
import ExplorePagination from "./ExplorePagination.tsx";
import { exploreSpaces } from "@/features/guest-explore/api/mock_spaces";

const ExploreSpace = () => {
  const navigate = useNavigate();

  return (
    <section className="mx-auto mt-14 w-[1240px]">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">공간 탐색</h2>

      <ExploreSearchFilterBar />

      <div className="mt-6 grid grid-cols-4 gap-x-6 gap-y-10">
        {exploreSpaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            categoryTag={space.category}
            onClick={() => navigate(`/spaces/${space.id}`)}
          />
        ))}
      </div>

      <ExplorePagination />
    </section>
  );
};

export default ExploreSpace;