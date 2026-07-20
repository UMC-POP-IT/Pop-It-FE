import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SpaceCard from "@/shared/components/SpaceCard";
import ExploreSearchFilterBar from "./ExploreSearchFilterBar";
import ExplorePagination from "./ExplorePagination";
import ExploreSpaceMap from "./ExploreSpaceMap";
import { exploreSpaces } from "@/features/guest-explore/api/mock_spaces";
import { useWishStore } from "@/store/wishStore";
import { useSpaceStore } from "@/store/spaceStore";

const PAGE_SIZE = 8;

const ExploreSpace = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isMapView, setIsMapView] = useState(false);

  const wishedIds = useWishStore((state) => state.wishedIds);
  const toggleWish = useWishStore((state) => state.toggleWish);
  const spaces = useSpaceStore((state) => state.spaces);

  const totalPages = Math.ceil(exploreSpaces.length / PAGE_SIZE);
  const pagedSpaces = exploreSpaces.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <section className="mx-auto mt-14 w-[1240px]">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">공간 탐색</h2>

      <ExploreSearchFilterBar
        isMapView={isMapView}
        onToggleMapView={() => setIsMapView((prev) => !prev)}
      />

      {isMapView ? (
        <ExploreSpaceMap
          spaces={exploreSpaces}
          onSelectSpace={(spaceId) => navigate(`/spaces/${spaceId}`)}
          onClose={() => setIsMapView(false)}
        />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-4 gap-x-6 gap-y-10">
            {pagedSpaces.map((pagedSpace) => {
              const heartCount =
                spaces.find((s) => s.id === pagedSpace.id)?.heartCount ??
                pagedSpace.heartCount;
              const space = { ...pagedSpace, heartCount };
              return (
                <SpaceCard
                  key={space.id}
                  space={space}
                  categoryTag={space.category}
                  onClick={() => navigate(`/spaces/${space.id}`)}
                  isWished={wishedIds.includes(space.id)}
                  onWishToggle={() => toggleWish(space.id)}
                />
              );
            })}
          </div>

          <ExplorePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
};

export default ExploreSpace;
