import { useEffect, useState } from "react";
import RealTimeBanner from "@/features/guest-explore/components/RealTimeBanner";
import type { recommendSpace } from "../api/spaces_api";
import { ScrollButton } from "./ScrollButton";
import { useNavigate } from "react-router-dom";
import { getRealTimeRecommend } from "../api/spaces_api";
import { useCardCarousel } from "@/features/guest-explore/hooks/useCardCarousel";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

// RealTimeBanner와 동일한 비율(4:5)의 로딩 스켈레톤
const SkeletonBanner = () => (
  <div data-card-image className="bg-tag-bg aspect-[4/5] w-full animate-pulse" />
);

const RealTimeRecommendSpace = () => {
  const [spaces, setSpaces] = useState<recommendSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  // 768~1023px(태블릿)과 360~767px(모바일)은 둘 다 2개씩, 1024px 이상(데스크톱)만 3개씩 보여준다.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const CARDS_PER_SCROLL = isDesktop ? 3 : 2;

  const { scrollRef, canScrollPrev, canScrollNext, imageCenter, scrollByCard } =
    useCardCarousel(CARDS_PER_SCROLL, [spaces.length, isLoading]);

  // 카드 실제 표시 너비를 CARDS_PER_SCROLL과 동일한 기준(useMediaQuery)으로 계산해,
  // 화면에 보이는 카드 개수와 화살표 스크롤 단위가 항상 일치하도록 한다.
  const cardWidthClass =
    CARDS_PER_SCROLL === 2 ? "w-[calc(50%-0.5rem)]" : "w-[calc((100%-2*1rem)/3)]";

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
      <h2 className="text-text-primary text-[clamp(19px,_14.59px_+_1.225vw,_24px)] font-bold">실시간 추천 공간</h2>

      <div className="relative">
        {!isLoading && !isError && canScrollPrev && imageCenter !== null && <ScrollButton direction="prev" topOffset={imageCenter} onClick={() => scrollByCard(-1)} className="max-[1024px]:hidden" />}

        {/* overflow-x-hidden은 휠/트랙패드/드래그 스크롤을 의도적으로 차단하기 위함 (화살표 버튼의 scrollBy만 허용).
            단, 1024px 이하(태블릿/모바일, 화살표 버튼이 숨는 구간과 동일)는 버튼 대신 터치 스크롤을 허용하고,
            snap으로 스와이프를 멈췄을 때 카드가 어중간하게 걸치지 않고 한 장 단위로 딱 맞게 정렬되게 한다. */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth max-[1024px]:overflow-x-auto max-[1024px]:snap-x max-[1024px]:snap-mandatory max-[1024px]:[scrollbar-width:none] max-[1024px]:[-ms-overflow-style:none] max-[1024px]:[&::-webkit-scrollbar]:hidden"
        >
          {isLoading ? (
            Array.from({ length: CARDS_PER_SCROLL }).map((_, i) => (
              <div key={i} role="status" aria-label="로딩 중" className={`${cardWidthClass} flex-none`}>
                <SkeletonBanner />
              </div>
            ))
          ) : isError || spaces.length === 0 ? (
            <div
              role={isError ? "alert" : "status"}
              aria-live={isError ? "assertive" : "polite"}
              className="bg-tag-bg flex h-64 w-full items-center justify-center"
            >
              <p className="text-text-secondary text-sm">
                {isError
                  ? "실시간 추천 공간 조회에 실패했습니다"
                  : "실시간 추천 가능한 공간이 없습니다"}
              </p>
            </div>
          ) : (
            spaces.map((space) => (
              <div
                key={space.spaceId}
                className={`${cardWidthClass} flex-none max-[1024px]:snap-start`}
              >
                <RealTimeBanner
                  space={space}
                  onClick={() => navigate(`/spaces/${space.spaceId}`)}
                />
              </div>
            ))
          )}
        </div>
        {!isLoading && !isError && canScrollNext && imageCenter !== null && <ScrollButton direction="next" topOffset={imageCenter} onClick={() => scrollByCard(1)} className="max-[1024px]:hidden" />}
      </div>
    </section>
  );
};

export default RealTimeRecommendSpace;
