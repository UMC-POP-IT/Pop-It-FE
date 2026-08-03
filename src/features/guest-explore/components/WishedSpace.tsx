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
  const [imageCenter, setImageCenter] = useState(0);
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

  // 화살표 버튼을 카드 전체가 아닌 사진 영역 세로 중앙에 맞추기 위한 오프셋 계산
  const updateImageCenter = () => {
    const container = scrollRef.current;
    if (!container) return;
    const image = container.querySelector<HTMLElement>("[data-card-image]");
    if (image) setImageCenter(image.clientHeight / 2);
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    updateScrollButtons();
    updateImageCenter();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    window.addEventListener("resize", updateImageCenter);
    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
      window.removeEventListener("resize", updateImageCenter);
    };
  }, [wishedSpaces.length]);

  // SpaceCard 4개 단위로 스크롤
  const CARDS_PER_SCROLL = 4;
  const scrollByCard = (direction: 1 | -1) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.firstElementChild as HTMLElement | null;
    const cardWidth = card?.clientWidth ?? container.clientWidth;
    const step = (cardWidth + 16) * CARDS_PER_SCROLL;
    container.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-4 mt-20">
        <h2 className="text-text-primary text-2xl font-bold">내가 찜한 공간 <HeartIcon /></h2>
        <span className="text-text-secondary text-sm">관심 있는 공간을 한 눈에 확인해 보세요!</span>

        <div className="relative">
            {canScrollPrev && <ScrollButton direction="prev" topOffset={imageCenter} onClick={() => scrollByCard(-1)} />}
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
            {canScrollNext && <ScrollButton direction="next" topOffset={imageCenter} onClick={() => scrollByCard(1)} />}
        </div>
    </section>
  );
};