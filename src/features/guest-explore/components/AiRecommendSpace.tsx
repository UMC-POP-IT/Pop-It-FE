import { useLayoutEffect, useRef, useState } from "react";
import SpaceCard from "@/shared/components/SpaceCard";
import { recommendSpaces } from "@/features/guest-explore/api/mock_spaces";
import type { Space } from "@/types";
import { ScrollButton } from "./ScrollButton";
import { useWishStore } from "@/store/wishStore";
import { useNavigate } from "react-router-dom";
import { useSpaceStore } from "@/store/spaceStore";

const avgDayCost =
  recommendSpaces.reduce((sum, space) => sum + space.cost.day, 0) /
  recommendSpaces.length;

// AI 추천 이유 뱃지
const getMatchReason = (space: Space) => {
  const cheaperPercent = Math.round((1 - space.cost.day / avgDayCost) * 100);

  // [case 1] 최근 본 공간보다 5% 이상 저렴하면 "최근 본 공간보다 XX% 저렴해요" 뱃지 표시
  if (cheaperPercent >= 5) return `최근 본 공간보다 ${cheaperPercent}% 저렴해요`;

  // [case 2] case 1이 아닌 경우, 좋아요 개수가 150개 이상이면 "지금 인기 급상승 중이에요" 뱃지 표시
  if (space.heartCount >= 150) return "지금 인기 급상승 중이에요";

    // [case 3] case 1, 2 모두 아닌 경우, "AI가 취향에 맞춰 골랐어요" 뱃지 표시
  return "AI가 취향에 맞춰 골랐어요";
};

const AiRecommendSpace = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const spaces = useSpaceStore((state) => state.spaces);
  const wishedIds = useWishStore((state) => state.wishedIds);
  const toggleWish = useWishStore((state) => state.toggleWish);

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
          {recommendSpaces.map((recSpace) => {
            const space = spaces.find((s) => s.id === recSpace.id) ?? recSpace;
            return (
              <div
                key={space.id}
                className="w-[calc(50%-0.5rem)] flex-none sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-3*1rem)/4)]"
              >
                <SpaceCard
                  space={space}
                  categoryTag={space.keywords[0]}
                  matchReason={getMatchReason(space)}
                  isWished={wishedIds.includes(space.id)}
                  onWishToggle={() => toggleWish(space.id)}
                  onClick={() => navigate(`/spaces/${space.id}`)}
                />
              </div>
            );
          })}
        </div>

        {canScrollNext && <ScrollButton direction="next" position={"1/4"} onClick={() => scrollByCard(1)} />}
      </div>
    </section>
  );
};

export default AiRecommendSpace;
