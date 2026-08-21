import { Lottie } from "lottie-react";
import starLoadingAnimation from "@/assets/animations/star-loading.json";

/**
 * 공간 목록을 더 불러오는 동안(무한스크롤) 보여주는 로딩 애니메이션.
 * 피그마 스펙(node 5299:32782, "새로운 공간을 불러오고 있습니다."): 별 5개가
 * 순서대로 반짝이며 지나가는 웨이브 형태다.
 *
 * 이전에는 실제 모션 데이터가 없어 CSS 키프레임(sparkle-shimmer)으로 타이밍을
 * 직접 설계해 대체 구현했었는데, 디자이너에게 실제 모션이 담긴 Lottie 파일
 * (star-loading.json)을 전달받아 이제 그 애니메이션을 그대로 재생한다.
 * lottie-react(Lottie)로 렌더링하며, 영역 크기는 피그마 스펙 그대로 200×32다.
 */
const ANIMATION_WIDTH_PX = 200;
const ANIMATION_HEIGHT_PX = 32;

interface LoadingSparklesProps {
  /** 별 애니메이션 아래에 표시할 문구. 기본값은 피그마 스펙 문구 그대로. */
  label?: string;
  className?: string;
}

const LoadingSparkles = ({
  label = "새로운 공간을 불러오고 있습니다.",
  className = "",
}: LoadingSparklesProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center gap-4 ${className}`}
    >
      <Lottie
        src={starLoadingAnimation}
        loop
        autoplay
        style={{ width: ANIMATION_WIDTH_PX, height: ANIMATION_HEIGHT_PX }}
        aria-hidden="true"
      />
      <p className="text-primary-hover text-[22px] leading-[1.4] font-medium">{label}</p>
    </div>
  );
};

export default LoadingSparkles;
