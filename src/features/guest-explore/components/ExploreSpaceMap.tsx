import { useState } from "react";
import KakaoMap from "./KakaoMap";
import KakaoMapOverlay from "./KakaoMapOverlay";
import MapBackground from "./MapBackground";
import { useKakaoLoader } from "@/shared/hooks/useKakaoLoader";
import { useWishStore } from "@/store/wishStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import type { SpaceSummary } from "@/features/guest-explore/api/space_search_api";

interface ExploreSpaceMapProps {
  /** 지도 위에 가격 마커로 노출할 공간 목록 */
  spaces: SpaceSummary[];
  onSelectSpace: (spaceId: number) => void;
  onClose: () => void;
  /**
   * 찜 토글 핸들러. 넘기지 않으면 컴포넌트 내부에서 로그인 가드만 거쳐 바로
   * 토글한다 - 그 경우 wishStore의 wishedIds는 갱신되지만, 목록 뷰(ExploreSpace)가
   * 들고 있는 카드별 heartCount는 갱신되지 않는다. 지도 위 찜하기가 목록의
   * heartCount에도 반영되게 하려면 ExploreSpace의 onWishToggle을 그대로 넘긴다.
   */
  onWishToggle?: (space: SpaceSummary) => void;
}

const DEFAULT_LEVEL = 6;
// spaces가 비어있는 경우를 대비한 기본 좌표 (강남역)
const FALLBACK_CENTER = { lat: 37.4979, lng: 127.0276 };

const ExploreSpaceMap = ({
  spaces,
  onSelectSpace,
  onClose,
  onWishToggle,
}: ExploreSpaceMapProps) => {
  const { isLoaded, error } = useKakaoLoader();
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const wishedIds = useWishStore((state) => state.wishedIds);
  const { handleWishToggle } = useWishGuard();

  const center = spaces[0]
    ? { lat: spaces[0].latitude, lng: spaces[0].longitude }
    : FALLBACK_CENTER;
  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId);

  return (
    <div className="relative mt-6 h-[560px] w-full overflow-hidden rounded-lg">
      {isLoaded ? (
        <KakaoMap
          center={center}
          level={DEFAULT_LEVEL}
          className="h-full w-full"
        >
          {(map) => (
            <>
              {spaces.map((space) => (
                <KakaoMapOverlay
                  key={space.id}
                  map={map}
                  lat={space.latitude}
                  lng={space.longitude}
                  zIndex={space.id === selectedSpaceId ? 10 : 1}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSpaceId(space.id)}
                    className={`rounded-full border px-3 py-1 text-sm font-bold whitespace-nowrap shadow-sm ${
                      space.id === selectedSpaceId
                        ? "border-primary bg-primary text-white"
                        : "border-border text-text-primary bg-white"
                    }`}
                  >
                    {space.cost.day.toLocaleString()}원
                  </button>
                </KakaoMapOverlay>
              ))}

              {selectedSpace && (
                <KakaoMapOverlay
                  map={map}
                  lat={selectedSpace.latitude}
                  lng={selectedSpace.longitude}
                  yAnchor={1.4}
                  zIndex={20}
                >
                  <div className="border-border flex items-center gap-3 rounded-lg border bg-white p-2 pr-4 shadow-lg">
                    <button
                      type="button"
                      onClick={() => onSelectSpace(selectedSpace.id)}
                      className="flex items-center gap-3"
                    >
                      <div className="bg-bg h-14 w-14 shrink-0 overflow-hidden rounded-md">
                        {selectedSpace.imageUrls[0] && (
                          <img
                            src={selectedSpace.imageUrls[0]}
                            alt={selectedSpace.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-col items-start gap-0.5 text-left">
                        <span className="text-primary text-xs font-bold">
                          {selectedSpace.category}
                        </span>
                        <span className="text-text-primary text-sm font-bold">
                          {selectedSpace.name}
                        </span>
                        <span className="text-text-primary text-sm font-bold">
                          {selectedSpace.cost.day.toLocaleString()}원{" "}
                          <span className="text-text-secondary text-xs font-normal">
                            /일
                          </span>
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label={
                        wishedIds.includes(selectedSpace.id)
                          ? "찜 해제하기"
                          : "찜하기"
                      }
                      onClick={() =>
                        onWishToggle
                          ? onWishToggle(selectedSpace)
                          : handleWishToggle(selectedSpace.id)
                      }
                      className={`text-lg leading-none ${
                        wishedIds.includes(selectedSpace.id)
                          ? "text-red-500"
                          : "text-text-secondary"
                      }`}
                    >
                      {wishedIds.includes(selectedSpace.id) ? "♥" : "♡"}
                    </button>
                  </div>
                </KakaoMapOverlay>
              )}
            </>
          )}
        </KakaoMap>
      ) : (
        <>
          <MapBackground />
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 px-6 text-center">
            <span className="text-text-secondary text-sm">
              {error ?? "지도를 불러오는 중입니다..."}
            </span>
          </div>
        </>
      )}

      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="bg-primary absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md"
      >
        ✕
      </button>
    </div>
  );
};

export default ExploreSpaceMap;
