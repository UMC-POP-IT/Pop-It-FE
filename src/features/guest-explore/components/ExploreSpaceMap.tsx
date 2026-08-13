import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import KakaoMap from "./KakaoMap";
import KakaoMapOverlay from "./KakaoMapOverlay";
import MapBackground from "./MapBackground";
import { useKakaoLoader } from "@/shared/hooks/useKakaoLoader";
import { useWishStore } from "@/store/wishStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";
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
  const [sheetDragOffsetY, setSheetDragOffsetY] = useState(0);
  const wishedIds = useWishStore((state) => state.wishedIds);
  const { handleWishToggle } = useWishGuard();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const sheetDragStartYRef = useRef<number | null>(null);
  const sheetInitialFocusRef = useRef<HTMLDivElement>(null);
  const center = spaces[0]
    ? { lat: spaces[0].latitude, lng: spaces[0].longitude }
    : FALLBACK_CENTER;
  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId);
  const isMobileSheetOpen = Boolean(selectedSpace && isMobile);
  const sheetDialogRef = useDialogA11y<HTMLDivElement>({
    isOpen: isMobileSheetOpen,
    onClose: () => setSelectedSpaceId(null),
    initialFocusRef: sheetInitialFocusRef,
  });

  useEffect(() => {
    if (!isMobileSheetOpen) {
      setSheetDragOffsetY(0);
      return;
    }
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobileSheetOpen]);

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
    setSheetDragOffsetY(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetDragMove = (event: PointerEvent<HTMLDivElement>) => {
    const startY = sheetDragStartYRef.current;
    if (startY === null) return;
    setSheetDragOffsetY(Math.max(0, event.clientY - startY));
  };

  const handleSheetDragEnd = (event: PointerEvent<HTMLDivElement>) => {
    const startY = sheetDragStartYRef.current;
    sheetDragStartYRef.current = null;
    setSheetDragOffsetY(0);
    if (startY === null) return;
    if (event.clientY - startY >= MOBILE_SHEET_CLOSE_DRAG_Y) {
      setSelectedSpaceId(null);
    }
  };

  return (
    <div className="relative mt-4 h-[560px] w-full overflow-hidden rounded-lg max-md:h-[clamp(360px,calc(100dvh-220px),520px)] md:mt-6">
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

      {selectedSpace &&
        isMobile &&
        createPortal(
          <div
            ref={sheetDialogRef}
            role="dialog"
            aria-label={`${selectedSpace.name} 공간 정보`}
            // 지도 박스(overflow-hidden, 뷰포트보다 낮은 고정 높이) 안에 그대로 두면
            // absolute든 fixed든 그 박스 경계에서 잘려버리고, 하단 고정 내비게이션
            // (MobileBottomNav, fixed bottom-0 z-40)에도 z-index가 밀려 가려진다 -
            // document.body로 포탈해서 지도 DOM 트리를 완전히 벗어나야 진짜
            // 뷰포트 기준 fixed로 동작하고, z-50(내비바 z-40보다 위)로 내비바
            // 위에 뜬다(BottomSheet.tsx와 동일한 패턴).
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] bg-white shadow-[0px_-4px_10px_rgba(0,0,0,0.16)] transition-transform duration-150 ease-out"
            style={{ transform: `translateY(${sheetDragOffsetY}px)` }}
          >
            <div
              ref={sheetInitialFocusRef}
              tabIndex={-1}
              className="sr-only"
            />
            <div
              role="button"
              tabIndex={0}
              aria-label="공간 카드 접기"
              onPointerDown={handleSheetDragStart}
              onPointerMove={handleSheetDragMove}
              onPointerUp={handleSheetDragEnd}
              onPointerCancel={() => {
                sheetDragStartYRef.current = null;
                setSheetDragOffsetY(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedSpaceId(null);
                }
              }}
              className="flex cursor-grab touch-none items-center justify-center py-3 active:cursor-grabbing"
            >
              <span
                aria-hidden="true"
                className="h-1 w-10 rounded-full bg-[#999999]"
              />
            </div>
            <div className="px-3 pb-4 text-left">
              <div className="bg-bg relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
                <button
                  type="button"
                  onClick={() => onSelectSpace(selectedSpace.id)}
                  className="block h-full w-full"
                >
                  {selectedSpace.imageUrls[0] && (
                    <img
                      src={selectedSpace.imageUrls[0]}
                      alt={selectedSpace.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
                <div className="absolute right-2 bottom-2">
                  <span className="rounded bg-black/35 px-2 py-1 text-[10px] font-medium text-white">
                    {mapSpaceCategoryTag(selectedSpace.category)}
                  </span>
                </div>
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
                  className={`absolute top-3 right-3 text-lg leading-none ${
                    wishedIds.includes(selectedSpace.id)
                      ? "text-red-500"
                      : "text-white drop-shadow"
                  }`}
                >
                  {wishedIds.includes(selectedSpace.id) ? "♥" : "♡"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSelectSpace(selectedSpace.id)}
                className="flex w-full items-start justify-between gap-3 px-1 pt-3 text-left"
              >
                <div className="min-w-0">
                  <span className="text-text-primary block truncate text-sm font-bold">
                    {selectedSpace.name}
                  </span>
                  <span className="text-text-primary mt-1 block text-sm font-bold">
                    {selectedSpace.cost.day.toLocaleString()}원{" "}
                    <span className="text-text-secondary text-xs font-normal">
                      /일
                    </span>
                  </span>
                  {selectedSpace.keywords.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {selectedSpace.keywords
                        .slice(0, 2)
                        .map((keyword, index) => (
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
              </button>
            </div>
            {/* iOS 홈 인디케이터 세이프 에어리어 - BottomSheet.tsx와 동일하게 실제
              기기의 하단 제스처 바 영역만큼 비워둔다. */}
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ExploreSpaceMap;
