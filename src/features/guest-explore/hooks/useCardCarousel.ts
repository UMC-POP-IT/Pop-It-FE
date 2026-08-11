import { useLayoutEffect, useRef, useState, type DependencyList } from "react";

interface UseCardCarouselResult {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  /** 카드 이미지 영역 세로 중앙까지의 픽셀 거리. 측정 전(또는 카드가 없을 때)에는 null */
  imageCenter: number | null;
  scrollByCard: (direction: 1 | -1) => void;
}

// AiRecommendSpace / RealTimeRecommendSpace / WishedSpace가 공유하는 카드 캐러셀 로직.
// overflow-x-hidden으로 휠/트랙패드/드래그 스크롤을 막고, 화살표 버튼의 scrollBy만으로 이동시키는 것을 전제로 한다.
export const useCardCarousel = (
  cardsPerScroll: number,
  deps: DependencyList,
): UseCardCarouselResult => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [imageCenter, setImageCenter] = useState<number | null>(null);

  // 좌/우 스크롤 버튼 활성화 여부 업데이트
  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (!container) return;
    setCanScrollPrev(container.scrollLeft > 1);
    setCanScrollNext(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1,
    );
  };

  // 화살표 버튼을 카드 전체가 아닌 사진 영역 세로 중앙에 맞추기 위한 오프셋 계산.
  // 카드 이미지를 찾지 못하면(빈 상태 등) null로 두어 버튼이 컨테이너 맨 위에 붙는 것을 방지한다.
  const updateImageCenter = () => {
    const container = scrollRef.current;
    if (!container) return;
    const image = container.querySelector<HTMLElement>("[data-card-image]");
    setImageCenter(image ? image.clientHeight / 2 : null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // cardsPerScroll이 바뀐다는 건 화면 폭 구간(예: 모바일 2개 ↔ 데스크톱 4개)이 바뀌어 카드 너비 자체가
  // 달라졌다는 뜻이다. 모바일/태블릿에서 터치로 스크롤해 둔 scrollLeft(px)는 이전 카드 너비 기준이라
  // 새 레이아웃에서는 아무 의미가 없어져 카드가 어중간하게 걸쳐 보이므로, 매번 처음(0)으로 되돌린다.
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollLeft = 0;
    updateScrollButtons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsPerScroll]);

  const scrollByCard = (direction: 1 | -1) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.firstElementChild as HTMLElement | null;
    const cardWidth = card?.clientWidth ?? container.clientWidth;
    const step = (cardWidth + 16) * cardsPerScroll;
    // 마지막 구간에서 카드가 반쯤 걸친 위치에 서지 않도록, 남은 스크롤 거리와 step 중 작은 값만큼만 이동
    const remaining =
      direction === 1
        ? container.scrollWidth - container.clientWidth - container.scrollLeft
        : container.scrollLeft;
    const distance = Math.min(step, Math.max(remaining, 0));
    container.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return { scrollRef, canScrollPrev, canScrollNext, imageCenter, scrollByCard };
};
