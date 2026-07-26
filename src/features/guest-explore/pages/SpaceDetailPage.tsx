import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { exploreSpaces, recommendSpaces } from "@/features/guest-explore/api/mock_spaces";
import ExploreDetailGallery from "@/features/guest-explore/components/ExploreDetailGallery";
import ExploreDetailInfo from "@/features/guest-explore/components/ExploreDetailInfo";
import ExploreReservationCard from "@/features/guest-explore/components/ExploreReservationCard";
import { useWishStore } from "@/store/wishStore";
import { useAuthStore } from "@/store/authStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";

export const SpaceDetailPage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const wishedIds = useWishStore((state) => state.wishedIds);
  const user = useAuthStore((s) => s.user);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const { handleWishToggle } = useWishGuard();

  // "AI 맞춤형 공간" / "실시간 추천 공간" 카드는 exploreSpaces가 아닌 recommendSpaces에서 오므로
  // 두 목록을 함께 조회해야 상세페이지 진입이 가능하다. (#126)
  const space = [...recommendSpaces, ...exploreSpaces].find(
    (item) => item.id === Number(spaceId),
  );
  const isWished = !!space && wishedIds.includes(space.id);

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
          onWishToggle={() => handleWishToggle(space.id)}
        />
        <ExploreReservationCard
          dayCost={space.cost.day}
          onLoginRequired={!user ? () => openLoginModal() : undefined}
        />
      </div>
    </div>
  );
};
