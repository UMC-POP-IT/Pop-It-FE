import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SpaceCard from "@/shared/components/SpaceCard";
import ExploreSearchFilterBar from "./ExploreSearchFilterBar";
import ExplorePagination from "./ExplorePagination";
import { exploreSpaces } from "@/features/guest-explore/api/mock_spaces";

const PAGE_SIZE = 8;

const ExploreSpace = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(exploreSpaces.length / PAGE_SIZE);
  const pagedSpaces = exploreSpaces.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <section className="mx-auto mt-14 w-[1240px]">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">공간 탐색</h2>

      <ExploreSearchFilterBar />

      <div className="mt-6 grid grid-cols-4 gap-x-6 gap-y-10">
        {pagedSpaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            categoryTag={space.category}
            onClick={() => navigate(`/spaces/${space.id}`)}
          />
        ))}
      </div>

      <ExplorePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
};

export default ExploreSpace;
