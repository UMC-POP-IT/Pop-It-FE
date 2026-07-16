import type { Space } from "@/types";

interface RealTimeBannerProps {
  space: Space;
  onClick?: () => void;
  /** AI 추천 이유 뱃지 (ex. 최근 본 공간보다 15% 저렴해요) */
  matchReason?: string;
}

const RealTimeBanner = ({
  space,
  onClick,
  matchReason,
}: RealTimeBannerProps) => (
  <div
    onClick={onClick}
    className="border-border group border-transparent cursor-pointer overflow-hidden border bg-white transition-shadow hover:shadow-md"
  >
    {/* 이미지 */}
    <div className="bg-bg relative aspect-[4/5]">
      {space.imageUrls[0] ? (
        <img
          src={space.imageUrls[0]}
          alt={space.name}
          className="h-full w-full object-cover transition-[filter] duration-500 group-hover:brightness-75"
        />
      ) : (
        <div className="bg-bg h-full w-full" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 flex flex-col gap-1 p-4 mb-4">
        <span className="text-2xl leading-snug font-bold text-white ">
          이번 주, 놓치면 아쉬운 강남 팝업 특가
        </span>
        <span className="text-sm text-white/80">{matchReason}</span>
      </div>
    </div>
  </div>
);

export default RealTimeBanner;
