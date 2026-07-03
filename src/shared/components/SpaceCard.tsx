import type { Space } from "@/types";

interface SpaceCardProps {
  space: Space;
  isWished?: boolean;
  onClick?: () => void;
  onWishToggle?: (e: React.MouseEvent) => void;
}

const SpaceCard = ({
  space,
  isWished = false,
  onClick,
  onWishToggle,
}: SpaceCardProps) => (
  <div
    onClick={onClick}
    className="border-border cursor-pointer overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
  >
    {/* 이미지 */}
    <div className="bg-bg relative aspect-[4/3]">
      {space.imageUrls[0] ? (
        <img
          src={space.imageUrls[0]}
          alt={space.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="bg-bg h-full w-full" />
      )}
      <button
        className="absolute top-2 right-2"
        onClick={(e) => {
          e.stopPropagation();
          onWishToggle?.(e);
        }}
      >
        <span
          className={`text-lg ${isWished ? "text-red-500" : "text-white drop-shadow"}`}
        >
          ♥
        </span>
      </button>
    </div>

    {/* 텍스트 */}
    <div className="flex flex-col gap-1 p-3">
      <span className="text-text-primary truncate text-sm font-semibold">
        {space.name}
      </span>
      <span className="text-text-secondary truncate text-xs">
        {space.address}
      </span>
      <span className="text-text-primary text-sm font-bold">
        {space.pricePerDay.toLocaleString()}원{" "}
        <span className="text-text-secondary text-xs font-normal">/일</span>
      </span>
    </div>
  </div>
);

export default SpaceCard;
