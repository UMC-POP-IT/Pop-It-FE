import { useNavigate, useParams } from "react-router-dom";
import { exploreSpaces } from "@/features/guest-explore/api/mock_spaces";
import ExploreDetailGallery from "@/features/guest-explore/components/ExploreDetailGallery";
import ExploreDetailInfo from "@/features/guest-explore/components/ExploreDetailInfo";
import ExploreReservationCard from "@/features/guest-explore/components/ExploreReservationCard";
import { useWishStore } from "@/store/wishStore";

export const SpaceDetailPage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const wishedSpaces = useWishStore((state) => state.wishedSpaces);
  const toggleWish = useWishStore((state) => state.toggleWish);

  const space = exploreSpaces.find((item) => item.id === Number(spaceId));
  const isWished = !!space && wishedSpaces.some((s) => s.id === space.id);

  if (!space) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-text-secondary text-sm">
          공간 정보를 찾을 수 없어요.
        </p>
        <button
          type="button"
          onClick={() => navigate("/explore")}
          className="text-primary text-sm font-medium"
        >
          공간 탐색으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-[1200px] flex-col gap-5">
      <ExploreDetailGallery space={space} />

      <div className="flex w-full items-start gap-[23px]">
        <ExploreDetailInfo
          space={space}
          isWished={isWished}
          onWishToggle={() => toggleWish(space)}
        />
        <ExploreReservationCard dayCost={space.cost.day} />
      </div>
    </div>
  );
};
