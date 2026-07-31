import { useEffect, useLayoutEffect, useRef, useState } from "react";
import SpaceCard from "@/shared/components/SpaceCard";
import type { Space } from "@/types";
import type { Space as AiRecommendSpaceDto } from "../api/spaces_api";
import { ScrollButton } from "./ScrollButton";
import { useNavigate } from "react-router-dom";
import { useWishGuard } from "@/shared/hooks/useWishGuard";

import { getAiRecommend } from "../api/spaces_api";

interface AiRecommendCard {
  space: Space;
  categoryTag: string;
  matchReason: string;
  isWished: boolean;
}

// AI 맞춤형 공간 API 응답(spaceId/buildingName/... 백엔드 필드명)을
// 앱 전역에서 공용으로 쓰는 Space 모델(id/name/... )로 변환
const toCard = (dto: AiRecommendSpaceDto): AiRecommendCard => ({
  space: {
    id: dto.spaceId,
    hostId: 0,
    imageUrls: dto.thumbnailUrl ? [dto.thumbnailUrl] : [],
    heartCount: dto.wishCount,
    name: dto.buildingName,
    address: dto.roadAddress,
    cost: { day: dto.pricePerDay },
    keywords: dto.keywords,
    description: "",
    createdAt: "",
  },
  categoryTag: dto.spaceCategory,
  matchReason: dto.tag,
  isWished: dto.isWishlisted,
});

const AiRecommendSpace = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [cards, setCards] = useState<AiRecommendCard[]>([]);

  const { handleWishToggle } = useWishGuard();
  const navigate = useNavigate();

  // 좌/우 스크롤 버튼 활성화 여부 업데이트
  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (!container) return;
    setCanScrollPrev(container.scrollLeft > 1);
    setCanScrollNext(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1,
    );
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  // AI 맞춤형 공간 정보 조회
  useEffect(() => {
    getAiRecommend()
    .then((data) => {setCards((data?.spaces ?? []).map(toCard));})
    .catch((error) => console.error("AI 맞춤형 공간 조회 실패", error));
  }, []);

  // SpaceCard 단위로 스크롤
  const scrollByCard = (direction: 1 | -1) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.firstElementChild as HTMLElement | null;
    const step = (card?.clientWidth ?? container.clientWidth) + 16;
    container.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-4 mt-20">
      <h2 className="text-text-primary text-2xl font-bold">AI 맞춤형 공간</h2>

      <div className="relative">
        {canScrollPrev && <ScrollButton direction="prev" position={"1/4"} onClick={() => scrollByCard(-1)} />}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {cards.map(({ space, categoryTag, matchReason, isWished }) => (
            <div
              key={space.id}
              className="w-[calc(50%-0.5rem)] flex-none sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-3*1rem)/4)]"
            >
              <SpaceCard
                space={space}
                categoryTag={categoryTag}
                matchReason={matchReason}
                isWished={isWished}
                onWishToggle={() => handleWishToggle(space.id)}
                onClick={() => navigate(`/spaces/${space.id}`)}
              />
            </div>
          ))}
        </div>

        {canScrollNext && <ScrollButton direction="next" position={"1/4"} onClick={() => scrollByCard(1)} />}
      </div>
    </section>
  );
};

export default AiRecommendSpace;
