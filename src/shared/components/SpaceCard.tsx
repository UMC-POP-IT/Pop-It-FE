import type { Space } from "@/types";
import Badge from "@/shared/components/Badge";

interface SpaceCardProps {
  space: Space;
  isWished?: boolean;
  onClick?: () => void;
  onWishToggle?: (e: React.MouseEvent) => void;
  /** 이미지 위 카테고리 뱃지 (ex. 팝업스토어) */
  categoryTag?: string;
  /** AI 추천 이유 뱃지 (ex. 최근 본 공간보다 15% 저렴해요) */
  matchReason?: string;
}

const SpaceCard = ({
  space,
  isWished = false,
  onClick,
  onWishToggle,
  categoryTag,
  matchReason,
}: SpaceCardProps) => (
  <div
    onClick={onClick}
    className="border-border border-transparent cursor-pointer overflow-hidden border bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
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
          {isWished ? "♥" : "♡"}
        </span>
      </button>
      {categoryTag && (
        <div className="absolute right-2 bottom-2">
          <Badge variant="category" label={"팝업 스토어"} /> {/* categoryTag 유형을 정해놓은 게 없어서, 임시로 figma에 맞춘 값 */}
        </div>
      )}
    </div>

    {/* 텍스트 */}
    <div className="flex flex-col gap-1.5 py-3 mx-1">
      {matchReason && (
        <div className="flex items-center justify-between gap-2">
          <Badge variant="highlight" label={matchReason} />
          <span className="text-text-secondary flex shrink-0 items-center gap-0.5 text-xs">
            ♡ {space.heartCount}
          </span>
        </div>
      )}
      <span className="text-text-primary truncate text-sm font-semibold">
        {space.name}
      </span>
      <span className="text-text-secondary truncate text-xs">
        {space.address}
      </span>
      <span className="text-text-primary text-sm font-bold">
        {space.cost.day.toLocaleString()}원{" "}
        <span className="text-text-secondary text-xs font-normal">/일</span>
      </span>
      {space.keywords.length > 0 && (
        <div className="flex gap-1 pt-0.5">
          {space.keywords.slice(0, 2).map((keyword) => (
            <span
              key={keyword}
              className="bg-tag-bg text-tag rounded-full px-2 py-0.5 text-xs"
            >
              #{keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default SpaceCard;
