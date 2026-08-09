import { useEffect, useState, useRef, type ReactNode } from "react";
import background1 from "@/assets/banner/background_1.jpg";
import background2 from "@/assets/banner/background_2.jpg";
import background3 from "@/assets/banner/background_3.jpg";

interface BannerSlide {
  title: string;
  subtitle: string;
  image: string;
  textClassName: string;
}

const slides: BannerSlide[] = [
  {
    title: "비어있는 공간과 브랜드의\n상상력이 만나는 곳",
    subtitle: "비어 있던 공간을 브랜드의 빛나는 기회로 바꿔보세요",
    image: background1,
    textClassName: "text-white",
  },
  {
    title: "필요한 순간에,\n필요한 공간을",
    subtitle: "팝업스토어, 전시, 카페까지 필요한 순간에 맞는 공간을 만나보세요",
    image: background2,
    textClassName: "text-text-primary",
  },
  {
    title: "사용하지 않는 공간이\n있으신가요?",
    subtitle: "공간을 필요한 기간만 공유하고 새로운 수익 기회를 만들어보세요",
    image: background3,
    textClassName: "text-white",
  },
];

const AUTOPLAY_INTERVAL_MS = 40000;
const SWIPE_THRESHOLD_PX = 50;

interface BannerProps {
  /** 배너 하단에 얹을 콘텐츠 (예: 게스트 메인의 히어로 검색바). */
  children?: ReactNode;
  /**
   * false면 배경 이미지/캐러셀 텍스트/카운터를 감춘 얇은 흰 바만 남기고 children만
   * 보여준다(검색 실행 후 결과 화면). 이 소속 형제 엘리먼트 배열 구조 자체는
   * showImage 값과 무관하게 항상 동일하게 유지해야 한다 - 조건부로 엘리먼트를
   * 아예 안 그리면(트리에서 제거) children(검색바) 자리의 인덱스가 밀려서 React가
   * 다른 타입으로 오인해 리마운트시키고, 그 안의 HeroSearchBar 입력 상태가
   * 날아간다. 그래서 안 보일 땐 렌더링을 생략하는 대신 hidden 클래스로만 감춘다.
   */
  showImage?: boolean;
  /**
   * children(검색바)을 화면 어디에 어떻게 배치할지.
   * "inline"(기본) - 평소처럼 배너 안 제자리에 표시.
   * "pinned-hidden" - 계속 마운트는 하되 화면에서 안 보이게 한다(검색 결과
   * 화면에서 스크롤을 내려 헤더의 축소된 pill만 보일 때 - fixed로 미리 옮겨두고
   * opacity만 0으로 둬서, pill을 눌렀을 때 부드럽게 나타날 수 있게 한다).
   * "pinned-open" - 헤더(74px) 바로 아래 화면 상단에 고정해서 오버레이로
   * 띄운다(축소된 pill을 클릭해 다시 펼쳤을 때).
   * 세 경우 모두 children을 다른 곳으로 옮기지 않고 같은 DOM 자리에서
   * className만 바꿔서 처리한다 - 그래야 HeroSearchBar가 리마운트되지 않고
   * 내부 입력 상태가 보존된다(showImage와 같은 원리).
   */
  searchBarPosition?: "inline" | "pinned-hidden" | "pinned-open";
}

const Banner = ({ children, showImage = true, searchBarPosition = "inline" }: BannerProps) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = slides.length;
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = (index: number) => setCurrent((index + total) % total);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  // 터치 종료/취소 시 스와이프 상태를 초기화하고 자동 재생을 재개한다
  const resetTouchState = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    setIsPaused(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null && touchStartY.current !== null) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(deltaY) < Math.abs(deltaX)) { // 수평 스와이프 감지
        if (deltaX > SWIPE_THRESHOLD_PX) {
          goTo(current - 1);
        } else if (deltaX < -SWIPE_THRESHOLD_PX) {
          goTo(current + 1);
        }
      }
    }
    resetTouchState();
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const slide = slides[current];

  const hasHero = Boolean(children); // 히어로 검색바가 있는 화면(게스트 메인)인지

  // Header.tsx의 sticky 헤더 높이(h-[74px])와 반드시 맞춰야 한다 - 오버레이가
  // 헤더 바로 아래에 딱 붙게 하려면.
  // pinned 상태에서는 항상 children을 두 겹(바깥 - 화면 전체 폭의 흰 배경,
  // 안쪽 - max-w-[1200px]로 가운데 정렬된 실제 내용)으로 감싼다. inline일 때도
  // 같은 2단 구조를 유지하고 바깥쪽만 아무 효과 없는 래퍼로 둔다 - children의
  // DOM 위치(중첩 깊이)가 상태에 따라 바뀌면 리마운트가 발생하기 때문이다.
  // 바깥을 화면 폭 전체 흰 배경으로 채우는 이유: 헤더 바로 아래에 "헤더의 흰
  // 배경이 그대로 이어지는" 느낌을 줘야 한다(둥근 모서리나 카드처럼 붕 떠
  // 보이면 안 됨) - 그래서 rounded 없이 꽉 채우고, 그림자도 아래쪽에만 옅게.
  const outerWrapperClassName =
    searchBarPosition === "inline"
      ? ""
      : `fixed top-[74px] left-0 z-30 w-full bg-white shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out ${
          searchBarPosition === "pinned-open"
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`;
  const innerWrapperClassName =
    searchBarPosition === "inline"
      ? `w-full max-w-[1200px] ${showImage ? "mt-10 xl:mt-20" : ""}`
      : "mx-auto w-full max-w-[1200px] px-4 py-4 md:px-10 xl:px-[76px]";

  return (
    <div
      className={`group relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-cover bg-center transition-[background-image] duration-500 ${
        showImage ? `-mt-8 ${hasHero ? "h-[483px]" : "h-[300px]"}` : "pt-8"
      }`}
      style={showImage ? { backgroundImage: `url(${slide.image})` } : undefined}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetTouchState}
    >
      <div
        className={`relative mx-auto flex w-full max-w-screen-xl flex-col justify-center px-4 md:px-10 xl:px-[76px] ${showImage ? `h-full ${slide.textClassName}` : ""}`}
      >
        <div className={`flex flex-col gap-4 ${showImage ? "" : "hidden"}`}>
          <h2 className={`leading-snug font-bold whitespace-pre-line ${hasHero ? "text-3xl md:text-4xl xl:text-[40px] xl:font-extrabold" : "text-2xl md:text-3xl"}`}>
            {slide.title}
          </h2>
          <p className={`opacity-80 ${hasHero ? "text-sm md:text-base xl:text-[20px]" : "text-sm md:text-base"}`}>
            {slide.subtitle}
          </p>
        </div>
        {children && (
          <div className={outerWrapperClassName}>
            <div className={innerWrapperClassName}>{children}</div>
          </div>
        )}
        <div
          aria-atomic="true"
          aria-live="polite"
          className={`absolute right-10 bottom-6 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white md:right-16 ${showImage ? "" : "hidden"}`}
        >
          {current + 1} / {total}
        </div>
      </div>
    </div>
  );
};

export default Banner;
