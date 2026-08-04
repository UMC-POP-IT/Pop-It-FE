import SpaceCard from "@/shared/components/SpaceCard";
import { ScrollButton } from "@/features/guest-explore/components/ScrollButton";
import WishedSpaceEmptyState from "@/features/guest-explore/components/WishedSpaceEmptyState";
import { useWishStore } from "@/store/wishStore";
import { useSpaceStore } from "@/store/spaceStore";
import type { Space } from "@/types";
import { useNavigate } from "react-router-dom";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useCardCarousel } from "@/features/guest-explore/hooks/useCardCarousel";

// SpaceCard 4개 단위로 스크롤
const CARDS_PER_SCROLL = 4;

const HeartIcon = () => {
  return (
    <span className="text-2xl text-red-500">
      ♥
    </span>
  )
}

export const WishedSpace = () => {
  const spaces = useSpaceStore((state) => state.spaces);
  const wishedIds = useWishStore((state) => state.wishedIds);
  const { handleWishToggle } = useWishGuard();

  // wishedIds에 해당하는 최신 Space 데이터를 spaceStore에서 조회
  const wishedSpaces = wishedIds
    .map((id) => spaces.find((space) => space.id === id))
    .filter((space): space is Space => space !== undefined);

  const navigate = useNavigate();

  const { scrollRef, canScrollPrev, canScrollNext, imageCenter, scrollByCard } =
    useCardCarousel(CARDS_PER_SCROLL, [wishedSpaces.length]);

  return (
    <section className="flex flex-col gap-4 mt-20">
        <h2 className="text-text-primary text-2xl font-bold">내가 찜한 공간 <HeartIcon /></h2>
        <span className="text-text-secondary text-sm">관심 있는 공간을 한 눈에 확인해 보세요!</span>

        <div className="relative">
            {canScrollPrev && imageCenter !== null && <ScrollButton direction="prev" topOffset={imageCenter} onClick={() => scrollByCard(-1)} />}
            {/* overflow-x-hidden은 휠/트랙패드/드래그 스크롤을 의도적으로 차단하기 위함 (화살표 버튼의 scrollBy만 허용) */}
            <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-hidden scroll-smooth"
            >
            {(wishedSpaces.length > 0) ? wishedSpaces.map((space) => (
                <div
                key={space.id}
                className="w-[calc(50%-0.5rem)] flex-none sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-3*1rem)/4)]"
                >
                <SpaceCard
                    space={space}
                    categoryTag={space.keywords[0]}
                    isWished={true}
                    onWishToggle={() => handleWishToggle(space.id)}
                    onClick={() => navigate(`/spaces/${space.id}`)}
                />
                </div>
            )) : <WishedSpaceEmptyState />}
            </div>
            {canScrollNext && imageCenter !== null && <ScrollButton direction="next" topOffset={imageCenter} onClick={() => scrollByCard(1)} />}
        </div>
    </section>
  );
};
