/**
 * 공간 목록을 더 불러오는 동안(무한스크롤) 보여주는 로딩 애니메이션.
 * 피그마 스펙(node 5299:32782, "새로운 공간을 불러오고 있습니다."): 별 5개가
 * blue-100→blue-400 사이를 오가며 순서대로 밝아지는 웨이브 형태다. 피그마에는
 * 정적 스냅샷만 있고 실제 프로토타입 모션(키프레임) 데이터는 없어서, 애니메이션
 * 타이밍 자체는 이 컴포넌트에서 직접 설계했다 - 별마다 sparkle-shimmer
 * 키프레임(global_style.css)에 서로 다른 animation-delay를 줘서 좌→우로
 * 훑고 지나가는 것처럼 보이게 반복시킨다.
 *
 * 아이콘: 피그마 원본 벡터를 그대로 내려받으려 했으나 이 개발 환경(샌드박스)의
 * 아웃바운드 네트워크가 figma.com 에셋 다운로드를 막고 있어(다른 Figma MCP 툴
 * 호출은 정상 동작 - 스크린샷으로 모양은 확인함) 원본 SVG를 가져오지 못했다.
 * 대신 스크린샷에서 확인한 것과 동일한 4방향 반짝임 모양의 잘 알려진 sparkle
 * 글리프(Lucide "sparkle" 아이콘, MIT 라이선스)로 대체했다 - 픽셀 단위로 정확한
 * 피그마 벡터가 필요하면 피그마에서 해당 별 레이어를 SVG로 내보내 아래
 * SPARKLE_PATH만 그 path d 값으로 교체하면 된다.
 */
const SPARKLE_PATH =
  "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z";

// 피그마 원본 좌표 그대로(node 5299:32784, 198.385×32 영역 안의 절대 위치) -
// justify-between으로 고르게 분산시키면 양 끝 별이 영역 가장자리에 딱 붙어버려
// 피그마의 좌우 3.2px 여백이 사라지고 간격도 살짝 달라진다. 큰 별(25.6px)과
// 작은 별(23.252px)이 번갈아 오도록 left/top/size를 픽셀 단위로 그대로 옮겼다.
const SPARKLE_ROW_WIDTH_PX = 198.385;
const SPARKLE_ROW_HEIGHT_PX = 32;
const SPARKLES: { left: number; top: number; size: number }[] = [
  { left: 3.2, top: 3.2, size: 25.6 },
  { left: 45.97, top: 4.43, size: 23.252 },
  { left: 86.39, top: 3.2, size: 25.6 },
  { left: 129.16, top: 4.43, size: 23.252 },
  { left: 169.58, top: 3.2, size: 25.6 },
];
const ANIMATION_DELAY_STEP_S = 0.15;

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
      <div
        className="relative"
        style={{ width: SPARKLE_ROW_WIDTH_PX, height: SPARKLE_ROW_HEIGHT_PX }}
        aria-hidden="true"
      >
        {SPARKLES.map(({ left, top, size }, index) => (
          <svg
            key={index}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute"
            style={{
              left,
              top,
              color: "var(--color-primary-100)",
              animation: "sparkle-shimmer 1.6s ease-in-out infinite",
              animationDelay: `${index * ANIMATION_DELAY_STEP_S}s`,
            }}
          >
            <path d={SPARKLE_PATH} />
          </svg>
        ))}
      </div>
      <p className="text-primary-hover text-[22px] leading-[1.4] font-medium">{label}</p>
    </div>
  );
};

export default LoadingSparkles;
