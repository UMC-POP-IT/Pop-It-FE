import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_spaces";

interface ExploreDetailGalleryProps {
  space: ExploreSpaceDetail;
  onImageClick?: (index: number) => void;
}

const ExploreDetailGallery = ({ space, onImageClick }: ExploreDetailGalleryProps) => {
  const [mainImage, ...subImages] = space.imageUrls;
  const subImageSlots = Array.from({ length: 4 }, (_, index) => subImages[index]);

  return (
    <div className="flex w-full items-center gap-5">
      {onImageClick && mainImage ? (
        <button
          type="button"
          className="h-[372px] w-[692px] shrink-0 overflow-hidden bg-[#D8D8D8]"
          onClick={() => onImageClick(0)}
          aria-label={`${space.name} 사진 보기`}
        >
          <img src={mainImage} alt={space.name} className="h-full w-full object-cover" />
        </button>
      ) : (
        <div className="h-[372px] w-[692px] shrink-0 overflow-hidden bg-[#D8D8D8]">
          {mainImage && <img src={mainImage} alt={space.name} className="h-full w-full object-cover" />}
        </div>
      )}

      <div className="grid shrink-0 grid-cols-2 grid-rows-2 gap-x-2 gap-y-3">
        {subImageSlots.map((url, index) =>
          onImageClick && url ? (
            <button
              key={index}
              type="button"
              className="h-[180px] w-[240px] overflow-hidden bg-[#D8D8D8]"
              onClick={() => onImageClick(index + 1)}
              aria-label={`${space.name} ${index + 2}번째 사진 보기`}
            >
              <img src={url} alt={`${space.name} ${index + 2}`} className="h-full w-full object-cover" />
            </button>
          ) : (
            <div key={index} className="h-[180px] w-[240px] overflow-hidden bg-[#D8D8D8]">
              {url && <img src={url} alt={`${space.name} ${index + 2}`} className="h-full w-full object-cover" />}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ExploreDetailGallery;
