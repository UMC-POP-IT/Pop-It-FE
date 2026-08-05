import { useEffect, useState } from "react";
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

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = slides.length;
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const slide = slides[current];

  return (
    <div
      className="group relative left-1/2 right-1/2 -mx-[50vw] -mt-8 h-[300px] w-screen bg-cover bg-center transition-[background-image] duration-500"
      style={{ backgroundImage: `url(${slide.image})` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={resetTouchState}
    >
      <div
        className={`relative mx-auto flex h-full w-full max-w-screen-xl flex-col justify-center gap-4 px-10 md:px-16 ${slide.textClassName}`}
      >
        <h2 className="text-2xl leading-snug font-bold whitespace-pre-line md:text-3xl">
          {slide.title}
        </h2>
        <p className="text-sm opacity-80 md:text-base">{slide.subtitle}</p>
        <div aria-atomic="true" aria-live="polite" className="absolute right-10 bottom-6 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white md:right-16">
          {current + 1} / {total}
        </div>
      </div>
    </div>
  );
};

export default Banner;
