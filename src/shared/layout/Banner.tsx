import { useEffect, useState } from "react";
import iconChevronRight from "@/assets/icons/icon_chevron_right.svg";
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

const AUTOPLAY_INTERVAL_MS = 5000;

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, total]);

  const goTo = (index: number) => setCurrent((index + total) % total);

  const slide = slides[current];

  return (
    <div
      className="group relative left-1/2 right-1/2 -mx-[50vw] -mt-8 h-[300px] w-screen bg-cover bg-center transition-[background-image] duration-500"
      style={{ backgroundImage: `url(${slide.image})` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`relative mx-auto flex h-full w-full max-w-screen-xl flex-col justify-center gap-4 px-10 md:px-16 ${slide.textClassName}`}
      >
        <h2 className="text-2xl leading-snug font-bold whitespace-pre-line md:text-3xl">
          {slide.title}
        </h2>
        <p className="text-sm opacity-80 md:text-base">{slide.subtitle}</p>
        <div aria-atomic="true" className="absolute right-10 bottom-6 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white md:right-16 aria-live">
          {current + 1} / {total}
        </div>
      </div>

      <button
        type="button"
        aria-label="이전 배너"
        onClick={() => goTo(current - 1)}
        className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/20 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/30"
      >
        <img src={iconChevronRight} alt="" className="h-4 w-4 rotate-180 invert"/>
      </button>
      <button
        type="button"
        aria-label="다음 배너"
        onClick={() => goTo(current + 1)}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/20 p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/30"
      >
        <img src={iconChevronRight} alt="" className="h-4 w-4 invert" />
      </button>
    </div>
  );
};

export default Banner;
