import { useEffect, useState } from "react";
import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_spaces";

interface ExploreDetailGalleryProps {
  space: ExploreSpaceDetail;
  onImageClick?: (index: number) => void;
}

// 대표 1장 + 서브 4칸(총 5칸)까지만 그리드에 노출한다. 그 이상은 마지막 서브 칸에
// "+n" 오버레이로 남은 장수를 안내하고, 클릭 시 확대 뷰어에서 이어서 볼 수 있게 한다.
const VISIBLE_SUB_IMAGE_COUNT = 4;

const ExploreDetailGallery = ({
  space,
  onImageClick,
}: ExploreDetailGalleryProps) => {
  const [mainImage, ...subImages] = space.imageUrls;
  const subImageSlots = Array.from(
    { length: VISIBLE_SUB_IMAGE_COUNT },
    (_, index) => subImages[index],
  );
  const totalImageCount = space.imageUrls.length;
  const hiddenImageCount = totalImageCount - (1 + VISIBLE_SUB_IMAGE_COUNT);

  // 로드에 실패한 이미지 URL을 기억해두고, 해당 칸은
  // 깨진 이미지 대신 기존 플레이스홀더(회색 배경)만 보여준다.
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    setFailedImageUrls(new Set());
  }, [space.imageUrls]);

  const markFailed = (url: string) =>
    setFailedImageUrls((prev) =>
      prev.has(url) ? prev : new Set(prev).add(url),
    );

  const mainImageFailed = mainImage ? failedImageUrls.has(mainImage) : false;

  return (
    <div className="flex w-full items-center gap-5">
      {onImageClick && mainImage ? (
        <button
          type="button"
          className="h-[372px] w-[692px] shrink-0 overflow-hidden bg-[#D8D8D8]"
          onClick={() => onImageClick(0)}
          aria-label={`${space.name} 사진 보기`}
        >
          {!mainImageFailed && (
            <img
              src={mainImage}
              alt={space.name}
              className="h-full w-full object-cover"
              onError={() => markFailed(mainImage)}
            />
          )}
        </button>
      ) : (
        <div className="h-[372px] w-[692px] shrink-0 overflow-hidden bg-[#D8D8D8]">
          {mainImage && !mainImageFailed && (
            <img
              src={mainImage}
              alt={space.name}
              className="h-full w-full object-cover"
              onError={() => markFailed(mainImage)}
            />
          )}
        </div>
      )}

      <div className="grid shrink-0 grid-cols-2 grid-rows-2 gap-x-2 gap-y-3">
        {subImageSlots.map((url, index) => {
          // subImageSlots는 space.imageUrls에서 대표 이미지를 뺀 배열이라, 실제 인덱스는 +1.
          const actualIndex = index + 1;
          const failed = url ? failedImageUrls.has(url) : false;
          const isLastSlot = index === VISIBLE_SUB_IMAGE_COUNT - 1;
          const showOverlay = isLastSlot && hiddenImageCount > 0;

          const content = (
            <>
              {url && !failed && (
                <img
                  src={url}
                  alt={`${space.name} ${index + 2}`}
                  className="h-full w-full object-cover"
                  onError={() => markFailed(url)}
                />
              )}
              {showOverlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(18,18,18,0.5)]">
                  <span className="text-lg font-bold text-white">
                    +{hiddenImageCount}
                  </span>
                </div>
              )}
            </>
          );

          return onImageClick && url ? (
            <button
              key={index}
              type="button"
              className="relative h-[180px] w-[240px] overflow-hidden bg-[#D8D8D8]"
              onClick={() => onImageClick(actualIndex)}
              aria-label={
                showOverlay
                  ? `${space.name} 사진 더보기 (${hiddenImageCount}장 더)`
                  : `${space.name} ${index + 2}번째 사진 보기`
              }
            >
              {content}
            </button>
          ) : (
            <div
              key={index}
              className="relative h-[180px] w-[240px] overflow-hidden bg-[#D8D8D8]"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExploreDetailGallery;
