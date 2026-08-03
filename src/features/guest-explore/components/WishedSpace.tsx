import { useLayoutEffect, useRef, useState } from "react";
import SpaceCard from "@/shared/components/SpaceCard";
import { ScrollButton } from "@/features/guest-explore/components/ScrollButton";
import WishedSpaceEmptyState from "@/features/guest-explore/components/WishedSpaceEmptyState";
import { useWishStore } from "@/store/wishStore";
import { useSpaceStore } from "@/store/spaceStore";
import type { Space } from "@/types";
import { useNavigate } from "react-router-dom";
import { useWishGuard } from "@/shared/hooks/useWishGuard";

const HeartIcon = () => {
  return (
    <span className="text-2xl text-red-500">
      ♥
    </span>
  )
}

export const WishedSpace = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const spaces = useSpaceStore((state) => state.spaces);
  const wishedIds = useWishStore((state) => state.wishedIds);
  const { handleWishToggle } = useWishGuard();

  // wishedIds에 해당하는 최신 Space 데이터를 spaceStore에서 조회
  const wishedSpaces = wishedIds
    .map((id) => spaces.find((space) => space.id === id))
    .filter((space): space is Space => space !== undefined);

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
        <h2 className="text-text-primary text-2xl font-bold">내가 찜한 공간 <HeartIcon /></h2>
        <span className="text-text-secondary text-sm">관심 있는 공간을 한 눈에 확인해 보세요!</span>

        <div className="relative">
            {canScrollPrev && <ScrollButton direction="prev" position={"1/2"} onClick={() => scrollByCard(-1)} />}
            <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
            {canScrollNext && <ScrollButton direction="next" position={"1/2"} onClick={() => scrollByCard(1)} />}
        </div>
    </section>
  );
};