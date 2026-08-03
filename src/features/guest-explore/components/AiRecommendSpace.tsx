import { useEffect, useLayoutEffect, useRef, useState } from "react";
import SpaceCard from "@/shared/components/SpaceCard";
import type { Space } from "@/types";
import type { RecommendedSpace } from "../api/spaces_api";
import { ScrollButton } from "./ScrollButton";
import { useNavigate } from "react-router-dom";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useAuthStore } from "@/store/authStore";

import { getAiRecommend } from "../api/spaces_api";

interface AiRecommendCard {
  space: Space;
  categoryTag: string;
  matchReason: string;
  isWished: boolean;
}

// AI 맞춤형 공간 API 응답(spaceId/buildingName/... 백엔드 필드명)을
// 앱 전역에서 공용으로 쓰는 Space 모델(id/name/... )로 변환
const toCard = (dto: RecommendedSpace): AiRecommendCard => ({
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
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [imageCenter, setImageCenter] = useState(0);

  const { handleWishToggle } = useWishGuard();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // 찜 토글: 로그인 상태에서만 카드의 isWished를 낙관적으로 갱신하고,
  // 실패 시 롤백한다. 비로그인 흐름은 로그인 모달만 띄우고 카드 상태는 건드리지 않는다.
  const handleCardWishToggle = async (spaceId: number) => {
    if (!user) {
      handleWishToggle(spaceId);
      return;
    }

    setCards((prev) =>
      prev.map((card) =>
        card.space.id === spaceId ? { ...card, isWished: !card.isWished } : card,
      ),
    );

    try {
      await handleWishToggle(spaceId);
    } catch (error) {
      console.error("찜 상태 변경 실패", error);
      setCards((prev) =>
        prev.map((card) =>
          card.space.id === spaceId ? { ...card, isWished: !card.isWished } : card,
        ),
      );
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
  }, [cards.length, isLoading]);

  // AI 맞춤형 공간 정보 조회
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    getAiRecommend()
      .then((data) => {
        if (!isMounted) return;
        setCards((data?.spaces ?? []).map(toCard));
      })
      .catch((error) => {
        console.error("AI 맞춤형 공간 조회 실패", error);
        if (!isMounted) return;
        setIsError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      <h2 className="text-text-primary text-2xl font-bold">AI 맞춤형 공간</h2>

      <div className="relative">
        {canScrollPrev && <ScrollButton direction="prev" topOffset={imageCenter} onClick={() => scrollByCard(-1)} />}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth"
        >
          {isLoading ? (
            <p role="status" aria-live="polite" className="text-text-secondary text-sm">
              추천 공간 로딩 UI 추가 예정
            </p>
          ) : isError ? (
            <p role="alert" aria-live="assertive" className="text-text-secondary text-sm">
              추천 공간 조회 실패 UI 추가 예정
            </p>
          ) : (
            cards.map(({ space, categoryTag, matchReason, isWished }) => (
              <div
                key={space.id}
                className="w-[calc(50%-0.5rem)] flex-none sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-3*1rem)/4)]"
              >
                <SpaceCard
                  space={space}
                  categoryTag={categoryTag}
                  matchReason={matchReason}
                  isWished={isWished}
                  onWishToggle={() => handleCardWishToggle(space.id)}
                  onClick={() => navigate(`/spaces/${space.id}`)}
                />
              </div>
            ))
          )}
        </div>

        {canScrollNext && <ScrollButton direction="next" topOffset={imageCenter} onClick={() => scrollByCard(1)} />}
      </div>
    </section>
  );
};

export default AiRecommendSpace;
