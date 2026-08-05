import { useEffect, useState } from "react";
import RealTimeBanner from "@/features/guest-explore/components/RealTimeBanner";
import type { recommendSpace } from "../api/spaces_api";
import { ScrollButton } from "./ScrollButton";
import { useNavigate } from "react-router-dom";
import { getRealTimeRecommend } from "../api/spaces_api";
import { useCardCarousel } from "@/features/guest-explore/hooks/useCardCarousel";

// SpaceCard 3개 단위로 스크롤
const CARDS_PER_SCROLL = 3;

const RealTimeRecommendSpace = () => {
  const [spaces, setSpaces] = useState<recommendSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const { scrollRef, canScrollPrev, canScrollNext, imageCenter, scrollByCard } =
    useCardCarousel(CARDS_PER_SCROLL, [spaces.length, isLoading]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    getRealTimeRecommend()
      .then((data) => {
        if (!isMounted) return;
        setSpaces(data?.spaces ?? []);
      })
      .catch((error) => {
        console.error("실시간 추천 공간 조회 실패", error);
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

  return (
    <section className="flex flex-col gap-4 mt-20">
      <h2 className="text-text-primary text-2xl font-bold">실시간 추천 공간</h2>

      <div className="relative">
        {canScrollPrev && imageCenter !== null && <ScrollButton direction="prev" topOffset={imageCenter} onClick={() => scrollByCard(-1)} />}

        {/* overflow-x-hidden은 휠/트랙패드/드래그 스크롤을 의도적으로 차단하기 위함 (화살표 버튼의 scrollBy만 허용) */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth"
        >
          {isLoading ? (
            <p role="status" aria-live="polite" className="text-text-secondary text-sm">
              실시간 추천 공간 로딩 UI 추가 예정
            </p>
          ) : isError ? (
            <p role="alert" aria-live="assertive" className="text-text-secondary text-sm">
              실시간 추천 공간 조회 실패 UI 추가 예정
            </p>
          ) : (
            spaces.map((space) => (
              <div
                key={space.spaceId}
                className="w-[calc((100%-2*1rem)/3)] flex-none"
              >
                <RealTimeBanner
                  space={space}
                  onClick={() => navigate(`/spaces/${space.spaceId}`)}
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

export default RealTimeRecommendSpace;
