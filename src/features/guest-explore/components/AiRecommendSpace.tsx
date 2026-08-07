import { useEffect, useState } from "react";
import SpaceCard from "@/shared/components/SpaceCard";
import type { Space } from "@/types";
import type { RecommendedSpace } from "../api/spaces_api";
import { ScrollButton } from "./ScrollButton";
import { useNavigate } from "react-router-dom";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useAuthStore } from "@/store/authStore";
import { useCardCarousel } from "@/features/guest-explore/hooks/useCardCarousel";

import { getAiRecommend } from "../api/spaces_api";
import { normalizeKeywords } from "@/shared/utils/keyword";

// SpaceCard 4개 단위로 스크롤
const CARDS_PER_SCROLL = 4;

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
    keywords: normalizeKeywords(dto.keywords ?? []),
    description: "",
    createdAt: "",
  },
  categoryTag: dto.spaceCategory,
  matchReason: dto.tag,
  isWished: dto.isWishlisted,
});

const AiRecommendSpace = () => {
  const [cards, setCards] = useState<AiRecommendCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isTracking, setIsTracking] = useState(true); // AI 맞춤형 공간 트래킹 여부 - true: 아직 트래킹 안함, false: 이미 트래킹 완료

  const { handleWishToggle } = useWishGuard();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { scrollRef, canScrollPrev, canScrollNext, imageCenter, scrollByCard } =
    useCardCarousel(CARDS_PER_SCROLL, [cards.length, isLoading]);

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

  // AI 맞춤형 공간 정보 조회
  useEffect(() => {
    if (!user) { // 비로그인 상태에서는 AI 맞춤형 공간 섹션을 숨긴다.
      setIsTracking(true);
      setCards([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    getAiRecommend()
      .then((data) => {
        if (!isMounted) return;
        setIsTracking(!data.hasActivityHistory);
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
  }, [user]); // user가 바뀌면 AI 맞춤형 공간도 다시 조회

  // AI 맞춤형 공간 트래킹이 완료되지 않은 유저는 AI 맞춤형 공간 섹션을 숨긴다.
  if (isTracking) return null; 

  // 이미 트래킹 완료된 유저는 AI 맞춤형 공간 섹션을 보여준다.
  return (
    <section className="flex flex-col gap-4 mt-20">
      <h2 className="text-text-primary text-2xl font-bold">AI 맞춤형 공간</h2>

      <div className="relative">
        {canScrollPrev && imageCenter !== null && <ScrollButton direction="prev" topOffset={imageCenter} onClick={() => scrollByCard(-1)} />}

        {/* overflow-x-hidden은 휠/트랙패드/드래그 스크롤을 의도적으로 차단하기 위함 (화살표 버튼의 scrollBy만 허용) */}
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

        {canScrollNext && imageCenter !== null && <ScrollButton direction="next" topOffset={imageCenter} onClick={() => scrollByCard(1)} />}
      </div>
    </section>
  );
};

export default AiRecommendSpace;
