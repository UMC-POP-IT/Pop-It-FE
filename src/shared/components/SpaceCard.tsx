import type { Space } from "@/types";
import Badge from "@/shared/components/Badge";
import { mapSpaceCategoryTag } from "@/shared/utils/spaceCategory";
interface SpaceCardProps {
  space: Space;
  isWished?: boolean;
  onClick?: () => void;
  onWishToggle?: (e: React.MouseEvent) => void;
  /** 이미지 위 카테고리 뱃지. 원본 enum 문자열(ex. "POPUP_STORE")을 받는다 */
  categoryTag?: string;
  /** AI 추천 이유 뱃지 (ex. 최근 본 공간보다 15% 저렴해요) */
  matchReason?: string;
  /**
   * 카드 hover 효과. 기본값 "lift"는 기존 카드 살짝 떠오름+그림자(입체감) 효과이고,
   * "dim"은 실시간 추천 공간 카드와 동일하게 이미지만 어둡게 흐려지는 효과다.
   * 현재 모든 SpaceCard가 "dim"을 쓴다.
   */
  hoverEffect?: "lift" | "dim";
}

const SpaceCard = ({
  space,
  isWished = false,
  onClick,
  onWishToggle,
  categoryTag,
  matchReason,
  hoverEffect = "lift",
}: SpaceCardProps) => (
  <div
    onClick={onClick}
    className={`border-border group w-full cursor-pointer overflow-hidden border border-transparent bg-white transition-all duration-300 ease-out ${
      hoverEffect === "dim" ? "" : "hover:-translate-y-1 hover:shadow-xl"
    }`}
    role="button"
    tabIndex={0}
    onKeyDown={(event) => {if (event.key === "Enter") onClick?.()}}
  >
    {/* 이미지 */}
    <div data-card-image className="bg-bg relative aspect-[4/3]">
      {space.imageUrls[0] ? (
        <img
          src={space.imageUrls[0]}
          alt={space.name}
          className={`h-full w-full object-cover ${
            hoverEffect === "dim"
              ? "transition-[filter] duration-500 group-hover:brightness-75"
              : ""
          }`}
        />
      ) : (
        <div
          className={`bg-bg h-full w-full ${
            hoverEffect === "dim"
              ? "transition-[filter] duration-500 group-hover:brightness-75"
              : ""
          }`}
        />
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
        <div className="absolute right-2 bottom-2 left-2 flex justify-end">
          <Badge variant="category" label={mapSpaceCategoryTag(categoryTag)} />
        </div>
      )}
    </div>

    {/* 텍스트 */}
    <div className="mx-1 flex flex-col gap-1.5 py-3">
      {matchReason ? ( // AI 추천 이유가 있으면(AI 맞춤형 공간) Badge+하트, 없으면(찜한 공간) 이름+하트 나란히
        // 모바일에서도 Badge는 텍스트 길이만큼만 차지(hug)하고 좌측 정렬되며, 하트는 이름과 같은 줄 우측으로 이동한다 (768px 이상은 기존 배치 그대로)
        <>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="highlight" label={matchReason} className="w-auto" />
            <span className="text-text-secondary hidden shrink-0 items-center gap-0.5 text-xs md:flex">
              ♡ {space.heartCount}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-primary truncate text-sm font-semibold">
              {space.name}
            </span>
            <span className="text-text-secondary flex shrink-0 items-center gap-0.5 text-xs md:hidden">
              ♡ {space.heartCount}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-primary truncate text-sm font-semibold">
            {space.name}
          </span>
          <span className="text-text-secondary flex shrink-0 items-center gap-0.5 text-xs">
            ♡ {space.heartCount}
          </span>
        </div>
      )}
      <span className="text-text-secondary truncate text-xs">
        {space.address}
      </span>
      <span className="text-text-primary text-sm font-bold">
        {space.cost.day.toLocaleString()}원{" "}
        <span className="text-text-secondary text-xs font-normal">/일</span>
      </span>
      {space.keywords.length > 0 && (
        <div className="flex gap-1 pt-0.5">
          {space.keywords.slice(0, 2).map((keyword, i) => (
            <span
              key={`${keyword}-${i}`}
              className="bg-tag-bg text-text-tag rounded-full px-2 py-0.5 text-xs"
            >
              {keyword.startsWith("#") ? keyword : `#${keyword}`}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default SpaceCard;
