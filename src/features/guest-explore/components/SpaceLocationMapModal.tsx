import KakaoMap from "./KakaoMap";
import KakaoMapOverlay from "./KakaoMapOverlay";
import MapBackground from "./MapBackground";
import { useKakaoLoader } from "@/shared/hooks/useKakaoLoader";
import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_spaces";

interface SpaceLocationMapModalProps {
  space: ExploreSpaceDetail;
  isOpen: boolean;
  onClose: () => void;
}

const DETAIL_MAP_LEVEL = 3;

/** 공간 상세 페이지 - 지도 아이콘 클릭 시 노출되는 위치 확인 모달 */
const SpaceLocationMapModal = ({
  space,
  isOpen,
  onClose,
}: SpaceLocationMapModalProps) => {
  const { isLoaded, error } = useKakaoLoader();

  if (!isOpen) return null;

  const center = { lat: space.latitude, lng: space.longitude };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
import { useEffect } from "react";

const SpaceLocationMapModal = ({
  space,
  isOpen,
  onClose,
}: SpaceLocationMapModalProps) => {
  const { isLoaded, error } = useKakaoLoader();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const center = { lat: space.latitude, lng: space.longitude };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${space.name} 위치 확인`}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative z-10 h-[560px] w-[1012px] overflow-hidden rounded-xl bg-white">
        <div className="absolute inset-0">
          {isLoaded ? (
            <KakaoMap
              center={center}
              level={DETAIL_MAP_LEVEL}
              className="h-full w-full"
            >
              {(map) => (
                <KakaoMapOverlay
                  map={map}
                  lat={center.lat}
                  lng={center.lng}
                  yAnchor={1}
                >
                  <svg
                    width="32"
                    height="40"
                    viewBox="0 0 32 40"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M16 0C7.163 0 0 7.163 0 16C0 27 16 40 16 40C16 40 32 27 32 16C32 7.163 24.837 0 16 0Z"
                      fill="`#e6483a`"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="6"
                      fill="white"
                    />
                  </svg>
                </KakaoMapOverlay>
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
        </div>

        <div className="absolute top-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-5 py-2 shadow-md">
          <span className="text-text-primary text-sm font-bold">
            {space.name}
          </span>
          <span className="bg-border h-3 w-px" />
          <span className="text-text-secondary text-sm">{space.address}</span>
        </div>

        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="bg-primary absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md"
        >
          ✕
        </button>
      </div>
    </div>
  );
  );
};

export default SpaceLocationMapModal;
