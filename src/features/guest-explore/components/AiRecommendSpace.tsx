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
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

interface AiRecommendCard {
  space: Space;
  categoryTag: string;
  matchReason: string;
  isWished: boolean;
}

// SpaceCard와 동일한 구조(4:3 이미지 + 뱃지/이름/주소/가격/키워드)로 만든 로딩 스켈레톤
const SkeletonCard = () => (
  <div className="w-full animate-pulse overflow-hidden bg-white">
    <div data-card-image className="bg-tag-bg aspect-[4/3]" />
    <div className="mx-1 flex flex-col gap-1.5 py-3">
      <div className="bg-tag-bg h-5 w-2/3 rounded-full" />
      <div className="bg-tag-bg h-4 w-1/2 rounded" />
      <div className="bg-tag-bg h-3 w-1/3 rounded" />
      <div className="bg-tag-bg h-4 w-2/5 rounded" />
    </div>
  </div>
);

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
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasActivityHistory, setHasActivityHistory] = useState(false); // AI 맞춤형 공간 트래킹 여부

  const { handleWishToggle } = useWishGuard();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // 모바일(360~767px)은 2개, 태블릿(768~1023px)은 3개, 데스크톱(1024px~)은 4개씩 보여준다.
  // 768px에서 2→3개로 바뀌는 지점이 있으므로, 아래 CARDS_PER_SCROLL과 cardWidthClass가 항상 같은
  // 기준(isTablet/isDesktop)으로 계산되게 해서 화면에 보이는 카드 개수와 화살표 스크롤 단위가 어긋나지 않게 한다.
  const isTablet = useMediaQuery("(min-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const CARDS_PER_SCROLL = isDesktop ? 4 : isTablet ? 3 : 2;

  const cardWidthClass = isDesktop
    ? "w-[calc((100%-3*1rem)/4)]"
    : isTablet
      ? "w-[calc((100%-2*1rem)/3)]"
      : "w-[calc(50%-0.5rem)]";

  const { scrollRef, canScrollPrev, canScrollNext, imageCenter, scrollByCard } =
    useCardCarousel(CARDS_PER_SCROLL, [cards.length, isLoading]);

  // isWished와 heartCount(찜 수)를 함께 뒤집는다 - 두 번 적용하면(낙관적 갱신 → 실패 시 롤백)
  // 정확히 원래 값으로 되돌아오므로 아래에서 동일한 함수를 그대로 재사용한다.
  const toggleCardWish = (card: AiRecommendCard): AiRecommendCard => {
    const nextIsWished = !card.isWished;
    return {
      ...card,
      isWished: nextIsWished,
      space: { ...card.space, heartCount: card.space.heartCount + (nextIsWished ? 1 : -1) },
    };
  };

  // 찜 토글: 로그인 상태에서만 카드의 isWished/heartCount를 낙관적으로 갱신하고,
  // 실패 시 롤백한다. 비로그인 흐름은 로그인 모달만 띄우고 카드 상태는 건드리지 않는다.
  const handleCardWishToggle = async (spaceId: number) => {
    if (!user) {
      handleWishToggle(spaceId);
      return;
    }

    setCards((prev) =>
      prev.map((card) => (card.space.id === spaceId ? toggleCardWish(card) : card)),
    );

    try {
      await handleWishToggle(spaceId);
    } catch (error) {
      console.error("찜 상태 변경 실패", error);
      setCards((prev) =>
        prev.map((card) => (card.space.id === spaceId ? toggleCardWish(card) : card)),
      );
    }
  };

  // AI 맞춤형 공간 정보 조회
  useEffect(() => {
    if (!user) { // 비로그인 상태에서는 AI 맞춤형 공간 섹션을 숨긴다.
      setHasActivityHistory(false);
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
        setHasActivityHistory(data.hasActivityHistory);
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

  // 조회에 실패한 경우, 혹은 로딩이 끝났는데 트래킹이 완료되지 않았거나 추천 결과가 0개인 경우 섹션 자체를 숨긴다(default-safe).
  // 로딩 중에는 hasActivityHistory를 아직 알 수 없으므로 숨기지 않고 스켈레톤을 보여준다.
  if (isError || (!isLoading && (!hasActivityHistory || cards.length === 0))) return null;

  // 이미 트래킹 완료된 유저는 AI 맞춤형 공간 섹션을 보여준다.
  return (
    <section className="flex flex-col gap-4 mt-20">
      <h2 className="text-text-primary text-[clamp(19px,_14.59px_+_1.225vw,_24px)] font-bold">AI 맞춤형 공간</h2>

      <div className="relative">
        {!isLoading && canScrollPrev && imageCenter !== null && <ScrollButton direction="prev" topOffset={imageCenter} onClick={() => scrollByCard(-1)} className="max-[1024px]:hidden" />}

        {/* overflow-x-hidden은 휠/트랙패드/드래그 스크롤을 의도적으로 차단하기 위함 (화살표 버튼의 scrollBy만 허용).
            단, 1024px 이하(태블릿/모바일, 화살표 버튼이 숨는 구간과 동일)는 버튼 대신 터치 스크롤을 허용하고,
            snap으로 스와이프를 멈췄을 때 카드가 어중간하게 걸치지 않고 한 장 단위로 딱 맞게 정렬되게 한다. */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth max-[1024px]:overflow-x-auto max-[1024px]:snap-x max-[1024px]:snap-mandatory max-[1024px]:[scrollbar-width:none] max-[1024px]:[-ms-overflow-style:none] max-[1024px]:[&::-webkit-scrollbar]:hidden"
        >
          {isLoading
            ? Array.from({ length: CARDS_PER_SCROLL }).map((_, i) => (
                <div key={i} className={`${cardWidthClass} flex-none`}>
                  <SkeletonCard />
                </div>
              ))
            : cards.map(({ space, categoryTag, matchReason, isWished }) => (
                <div
                  key={space.id}
                  className={`${cardWidthClass} flex-none max-[1024px]:snap-start`}
                >
                  <SpaceCard
                    space={space}
                    categoryTag={categoryTag}
                    matchReason={matchReason}
                    isWished={isWished}
                    onWishToggle={() => handleCardWishToggle(space.id)}
                    onClick={() => navigate(`/spaces/${space.id}`)}
                    hoverEffect="dim"
                  />
                </div>
              ))}
        </div>

        {!isLoading && canScrollNext && imageCenter !== null && <ScrollButton direction="next" topOffset={imageCenter} onClick={() => scrollByCard(1)} className="max-[1024px]:hidden" />}
      </div>
    </section>
  );
};

export default AiRecommendSpace;
