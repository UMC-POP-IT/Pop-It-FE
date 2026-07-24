import { useEffect, useRef, useState, type ReactNode } from "react";

export interface KakaoLatLng {
  lat: number;
  lng: number;
}

interface KakaoMapProps {
  center: KakaoLatLng;
  level?: number;
  className?: string;
  /** map 인스턴스가 준비된 뒤 마커/오버레이 등을 렌더링하기 위한 render-prop */
  children?: (map: kakao.maps.Map) => ReactNode;
}

/**
 * 카카오 지도 SDK(window.kakao.maps)를 얹는 얇은 래퍼 컴포넌트
 * SDK 로드 여부는 상위 컴포넌트에서 useKakaoLoader로 먼저 확인한 뒤 렌더링해야 함
 */
const KakaoMap = ({
  center,
  level = 5,
  className,
  children,
}: KakaoMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const kakaoMap = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
    setMap(kakaoMap);
    // 최초 1회만 지도 인스턴스를 생성 (center/level 변경은 아래 effect에서 갱신)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
    map.setLevel(level);
  }, [map, center.lat, center.lng, level]);

  return (
    <div
      ref={containerRef}
      className={className}
    >
      {map && children?.(map)}
    </div>
  );
};

export default KakaoMap;
