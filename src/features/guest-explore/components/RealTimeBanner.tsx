import type { recommendSpace } from "../api/spaces_api";

interface RealTimeBannerProps {
  space: recommendSpace;
  onClick?: () => void;
}

const RealTimeBanner = ({
  space,
  onClick,
}: RealTimeBannerProps) => (
  <div className="border-border group border-transparent cursor-pointer overflow-hidden border bg-white transition-shadow hover:shadow-md">
    {/* 이미지 */}
    <button
      type="button"
      data-card-image
      onClick={onClick}
      className="bg-bg relative block w-full aspect-[4/5] group-hover:cursor-pointer"
    >
      {space.thumbnailUrl ? (
        <img
          src={space.thumbnailUrl}
          alt={String(space.spaceId)}
          className="h-full w-full object-cover transition-[filter] duration-500 group-hover:brightness-75"
        />
      ) : (
        <div className="bg-bg h-full w-full" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 flex w-full flex-col gap-1 p-4 mb-[clamp(0px,_-14.12px_+_3.922vw,_16px)] text-left">
        <span className="text-[clamp(11px,_-0.47px_+_3.186vw,_24px)] leading-snug font-bold text-white whitespace-pre-wrap">
          {space.title}
        </span>
        <span className="max-[768px]:max-w-full max-[768px]:truncate text-[clamp(8px,_2.70px_+_1.471vw,_14px)] text-white/80">{space.subtitle}</span>
      </div>
    </button>
  </div>
);

export default RealTimeBanner;
