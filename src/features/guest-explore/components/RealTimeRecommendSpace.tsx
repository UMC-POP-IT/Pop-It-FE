import { useEffect, useLayoutEffect, useRef, useState } from "react";
import RealTimeBanner from "@/features/guest-explore/components/RealTimeBanner";
import type { RtSpace } from "../api/spaces_api";
import { ScrollButton } from "./ScrollButton";
import { useNavigate } from "react-router-dom";
import { getRealTimeRecommend } from "../api/spaces_api";

const RealTimeRecommendSpace = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [spaces, setSpaces] = useState<RtSpace[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    getRealTimeRecommend()
      .then((data) => {setSpaces(data?.spaces ?? [])})
      .catch((error) => console.error("실시간 추천 공간 조회 실패", error));
  }, []);

  // const avgDayCost =
  //   spaces.reduce((sum, space) => sum + Number(space.pricePerDay) , 0) /
  //   spaces.length;

  // const getRecommendReason = (space: RtSpace) => {
  //   const cheaperPercent = Math.round((1 - Number(space.pricePerDay) / avgDayCost) * 100);
  //   return `성수동 대비 ${cheaperPercent}% 저렴한 ${space.buildingName}`; // ex. 성수동 대비 15% 저렴한 팝업스토어
  // };

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
      <h2 className="text-text-primary text-2xl font-bold">실시간 추천 공간</h2>

      <div className="relative">
        {canScrollPrev && <ScrollButton direction="prev" position={"1/2"} onClick={() => scrollByCard(-1)} />}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {spaces.map((space) => (
            <div
              key={space.spaceId}
              className="w-[calc((100%-2*1rem)/3)] flex-none"
            >
              <RealTimeBanner
                space={space}
                onClick={() => navigate(`/spaces/${space.spaceId}`)}
              />
            </div>
          ))}
        </div>

        {canScrollNext && <ScrollButton direction="next" position={"1/2"} onClick={() => scrollByCard(1)} />}
      </div>
    </section>
  );
};

export default RealTimeRecommendSpace;
