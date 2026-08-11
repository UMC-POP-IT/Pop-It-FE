import { useRef, useState, type PointerEvent } from "react";
import KakaoMap from "./KakaoMap";
import KakaoMapOverlay from "./KakaoMapOverlay";
import MapBackground from "./MapBackground";
import { useKakaoLoader } from "@/shared/hooks/useKakaoLoader";
import { useWishStore } from "@/store/wishStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import type { SpaceSummary } from "@/features/guest-explore/api/space_search_api";
import { mapSpaceCategoryTag } from "@/shared/utils/spaceCategory";

interface ExploreSpaceMapProps {
  /** 지도 위에 가격 마커로 노출할 공간 목록 */
  spaces: SpaceSummary[];
  onSelectSpace: (spaceId: number) => void;
  /**
   * 찜 토글 핸들러. 넘기지 않으면 컴포넌트 내부에서 로그인 가드만 거쳐 바로
   * 토글한다 - 그 경우 wishStore의 wishedIds는 갱신되지만, 목록 뷰(ExploreSpace)가
   * 들고 있는 카드별 heartCount는 갱신되지 않는다. 지도 위 찜하기가 목록의
   * heartCount에도 반영되게 하려면 ExploreSpace의 onWishToggle을 그대로 넘긴다.
   */
  onWishToggle?: (space: SpaceSummary) => void;
}

const DEFAULT_LEVEL = 6;
const MOBILE_SELECTED_MARKER_PAN_Y = 150;
const MOBILE_SHEET_CLOSE_DRAG_Y = 56;
// spaces가 비어있는 경우를 대비한 기본 좌표 (강남역)
const FALLBACK_CENTER = { lat: 37.4979, lng: 127.0276 };

const ExploreSpaceMap = ({
  spaces,
  onSelectSpace,
  onWishToggle,
}: ExploreSpaceMapProps) => {
  const { isLoaded, error } = useKakaoLoader();
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const wishedIds = useWishStore((state) => state.wishedIds);
  const { handleWishToggle } = useWishGuard();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const sheetDragStartYRef = useRef<number | null>(null);

  const center = spaces[0]
    ? { lat: spaces[0].latitude, lng: spaces[0].longitude }
    : FALLBACK_CENTER;
  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId);

  const handleMarkerClick = (space: SpaceSummary, map: kakao.maps.Map) => {
    setSelectedSpaceId(space.id);

    if (!isMobile) return;
    map.setCenter(new kakao.maps.LatLng(space.latitude, space.longitude));
    requestAnimationFrame(() => {
      map.panBy(0, MOBILE_SELECTED_MARKER_PAN_Y);
    });
  };

  const handleSheetDragStart = (event: PointerEvent<HTMLDivElement>) => {
    sheetDragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetDragEnd = (event: PointerEvent<HTMLDivElement>) => {
    const startY = sheetDragStartYRef.current;
    sheetDragStartYRef.current = null;
    if (startY === null) return;
    if (event.clientY - startY >= MOBILE_SHEET_CLOSE_DRAG_Y) {
      setSelectedSpaceId(null);
    }
  };

  return (
    <div className="relative mt-4 h-[560px] w-full overflow-hidden rounded-lg max-md:h-[520px] md:mt-6">
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
                    onClick={() => handleMarkerClick(space, map)}
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

              {selectedSpace && !isMobile && (
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
                          {mapSpaceCategoryTag(selectedSpace.category)}
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

      {selectedSpace && isMobile && (
        <div className="absolute inset-x-0 bottom-0 z-30 rounded-t-[20px] bg-white shadow-[0px_-4px_10px_rgba(0,0,0,0.16)]">
          <div
            role="button"
            tabIndex={0}
            aria-label="공간 카드 접기"
            onPointerDown={handleSheetDragStart}
            onPointerUp={handleSheetDragEnd}
            onPointerCancel={() => {
              sheetDragStartYRef.current = null;
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedSpaceId(null);
              }
            }}
            className="flex touch-none cursor-grab items-center justify-center py-3 active:cursor-grabbing"
          >
            <span aria-hidden="true" className="h-1 w-10 rounded-full bg-[#999999]" />
          </div>
          <button
            type="button"
            onClick={() => onSelectSpace(selectedSpace.id)}
            className="block w-full px-3 pb-4 text-left"
          >
            <div className="bg-bg relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
              {selectedSpace.imageUrls[0] && (
                <img
                  src={selectedSpace.imageUrls[0]}
                  alt={selectedSpace.name}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute right-2 bottom-2">
                <span className="rounded bg-black/35 px-2 py-1 text-[10px] font-medium text-white">
                  {mapSpaceCategoryTag(selectedSpace.category)}
                </span>
              </div>
            </div>
            <div className="flex items-start justify-between gap-3 px-1 pt-3">
              <div className="min-w-0">
                <span className="text-text-primary block truncate text-sm font-bold">
                  {selectedSpace.name}
                </span>
                <span className="text-text-primary mt-1 block text-sm font-bold">
                  {selectedSpace.cost.day.toLocaleString()}원{" "}
                  <span className="text-text-secondary text-xs font-normal">/일</span>
                </span>
                {selectedSpace.keywords.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {selectedSpace.keywords.slice(0, 2).map((keyword, index) => (
                      <span
                        key={`${keyword}-${index}`}
                        className="bg-tag-bg text-text-tag rounded-full px-2 py-0.5 text-xs"
                      >
                        {keyword.startsWith("#") ? keyword : `#${keyword}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-text-secondary flex shrink-0 items-center gap-0.5 text-xs">
                ♡ {selectedSpace.heartCount}
              </span>
            </div>
          </button>
          <button
            type="button"
            aria-label={wishedIds.includes(selectedSpace.id) ? "찜 해제하기" : "찜하기"}
            onClick={() =>
              onWishToggle
                ? onWishToggle(selectedSpace)
                : handleWishToggle(selectedSpace.id)
            }
            className={`absolute top-16 right-5 text-lg leading-none ${
              wishedIds.includes(selectedSpace.id) ? "text-red-500" : "text-white drop-shadow"
            }`}
          >
            {wishedIds.includes(selectedSpace.id) ? "♥" : "♡"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExploreSpaceMap;
