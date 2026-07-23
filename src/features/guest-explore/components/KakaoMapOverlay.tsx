import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface KakaoMapOverlayProps {
  map: kakao.maps.Map;
  lat: number;
  lng: number;
  zIndex?: number;
  /** 0(하단)~1(상단) / 콘텐츠와 좌표 지점의 세로 정렬 기준. 기본값 0.5(중앙) */
  yAnchor?: number;
  xAnchor?: number;
  children: ReactNode;
}

/**
 * 카카오 지도 위에 React로 만든 커스텀 오버레이(가격 라벨, 미니카드, 핀 등)를 얹기 위한 헬퍼.
 * kakao.maps.CustomOverlay가 붙잡고 있는 DOM 노드에 React Portal로 children을 렌더링한다.
 */
const KakaoMapOverlay = ({
  map,
  lat,
  lng,
  zIndex,
  yAnchor = 0.5,
  xAnchor = 0.5,
  children,
}: KakaoMapOverlayProps) => {
  const contentRef = useRef<HTMLDivElement>(document.createElement("div"));
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  useEffect(() => {
    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(lat, lng),
      content: contentRef.current,
      clickable: true,
      xAnchor,
      yAnchor,
      zIndex,
    });
    overlay.setMap(map);
    overlayRef.current = overlay;

    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
    };
  }, [map, lat, lng, xAnchor, yAnchor, zIndex]);

  return createPortal(children, contentRef.current);
};

export default KakaoMapOverlay;
