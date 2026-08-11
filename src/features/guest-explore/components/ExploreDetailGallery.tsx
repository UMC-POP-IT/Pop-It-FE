import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_spaces";

interface ExploreDetailGalleryProps {
  space: ExploreSpaceDetail;
  onImageClick?: (index: number) => void;
}

const ExploreDetailGallery = ({
  space,
  onImageClick,
}: ExploreDetailGalleryProps) => {
  const [mainImage, ...subImages] = space.imageUrls;
  const subImageSlots = Array.from(
    { length: 4 },
    (_, index) => subImages[index],
  );

  return (
    <div className="flex w-full items-center gap-5">
      {onImageClick && mainImage ? (
        <button
          type="button"
          className="aspect-[692/372] w-full shrink-0 overflow-hidden bg-[#D8D8D8] lg:h-[372px] lg:w-[692px]"
          onClick={() => onImageClick(0)}
          aria-label={`${space.name} 사진 보기`}
        >
          <img
            src={mainImage}
            alt={space.name}
            className="h-full w-full object-cover"
          />
        </button>
      ) : (
        <div className="aspect-[692/372] w-full shrink-0 overflow-hidden bg-[#D8D8D8] lg:h-[372px] lg:w-[692px]">
          {mainImage && (
            <img
              src={mainImage}
              alt={space.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      )}

      {/* Desktop(lg)에서만 서브 이미지 4장 그리드 노출. Tablet/Mobile Figma는 메인 이미지 1장 풀폭만 사용 (썸네일 없음) */}
      <div className="hidden shrink-0 grid-cols-2 grid-rows-2 gap-x-2 gap-y-3 lg:grid">
        {subImageSlots.map((url, index) =>
          onImageClick && url ? (
            <button
              key={index}
              type="button"
              className="h-[180px] w-[240px] overflow-hidden bg-[#D8D8D8]"
              onClick={() => onImageClick(index + 1)}
              aria-label={`${space.name} ${index + 2}번째 사진 보기`}
            >
              <img
                src={url}
                alt={`${space.name} ${index + 2}`}
                className="h-full w-full object-cover"
              />
            </button>
          ) : (
            <div
              key={index}
              className="h-[180px] w-[240px] overflow-hidden bg-[#D8D8D8]"
            >
              {url && (
                <img
                  src={url}
                  alt={`${space.name} ${index + 2}`}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default ExploreDetailGallery;
