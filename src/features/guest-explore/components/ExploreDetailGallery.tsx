import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_recommend_spaces";

interface ExploreDetailGalleryProps {
  space: ExploreSpaceDetail;
}

const ExploreDetailGallery = ({ space }: ExploreDetailGalleryProps) => {
  const [mainImage, ...subImages] = space.imageUrls;
  const subImageSlots = Array.from({ length: 4 }, (_, index) => subImages[index]);

  return (
    <div className="flex w-full items-center gap-5">
      <div className="h-[372px] w-[692px] shrink-0 overflow-hidden bg-[#D8D8D8]">
        {mainImage && (
          <img
            src={mainImage}
            alt={space.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="grid shrink-0 grid-cols-2 grid-rows-2 gap-x-2 gap-y-3">
        {subImageSlots.map((url, index) => (
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
        ))}
      </div>
    </div>
  );
};

export default ExploreDetailGallery;
