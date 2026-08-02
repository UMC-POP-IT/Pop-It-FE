import { useLayoutEffect, useRef, useState, useEffect } from "react";
import SpaceCard from "@/shared/components/SpaceCard";
import { ScrollButton } from "@/features/guest-explore/components/ScrollButton";
import WishedSpaceEmptyState from "@/features/guest-explore/components/WishedSpaceEmptyState";
import type { Space } from "@/types";
import { useNavigate } from "react-router-dom";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { getWishList, wishedSpace } from "@/features/guest-explore/api/spaces_api";

const HeartIcon = () => {
  return (
    <span className="text-2xl text-red-500">
      ♥
    </span>
  )
}

// 찜한 공간 API 응답(spaceId/buildingName/... 백엔드 필드명)을
// 앱 전역에서 공용으로 쓰는 Space 모델(id/name/... )로 변환
const toCard = (dto: wishedSpace): Space => ({
  id: dto.spaceId,
  hostId: 0,
  imageUrls: dto.thumbnailUrl ? [dto.thumbnailUrl] : [],
  heartCount: dto.wishCount,
  name: dto.buildingName,
  address: dto.roadAddress,
  cost: { day: dto.pricePerDay },
  keywords: [],
  description: dto.basicInfo,
  createdAt: "",
});

export const WishedSpace = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [wishedSpaces, setWishedSpaces] = useState<wishedSpace[]>([]);
  const { handleWishToggle } = useWishGuard();

  useEffect(() => {
    let isMounted = true;
    getWishList()
      .then((data) => {
        if (isMounted) setWishedSpaces(data.wishlist);
      })
      .catch((error) => {
        console.error("내가 찜한 공간 불러오기 실패", error);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const navigate = useNavigate();

  // 이 목록의 카드는 전부 "이미 찜한 공간"이므로, 하트를 누르면 항상 찜 해제이다.
  // 낙관적으로 목록에서 먼저 제거하고, API 실패 시 원래 목록으로 되돌린다.
  const handleUnwish = async (spaceId: number) => {
    const previous = wishedSpaces;
    setWishedSpaces((prev) => prev.filter((space) => space.spaceId !== spaceId));
    try {
      await handleWishToggle(spaceId);
    } catch (error) {
      console.error("찜 해제 실패", error);
      setWishedSpaces(previous);
    }
  };

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
            {canScrollPrev && <ScrollButton direction="prev" position={"1/4"} onClick={() => scrollByCard(-1)} />}
            <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
            {(wishedSpaces.length > 0) ? wishedSpaces.map((space) => (
                <div
                key={space.spaceId}
                className="w-[calc(50%-0.5rem)] flex-none sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-3*1rem)/4)]"
                >
                <SpaceCard
                    space={toCard(space)}
                    isWished={true}
                    onWishToggle={() => handleUnwish(space.spaceId)}
                    onClick={() => navigate(`/spaces/${space.spaceId}`)}
                />
                </div>
            )) : <WishedSpaceEmptyState />}
            </div>
            {canScrollNext && <ScrollButton direction="next" position={"1/4"} onClick={() => scrollByCard(1)} />}
        </div>
    </section>
  );
};