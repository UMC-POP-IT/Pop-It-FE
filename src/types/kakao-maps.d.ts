/**
 * 카카오 지도 JavaScript SDK 최소 타입 선언
 * (실제 SDK는 window.kakao 전역으로 로드되며, 별도 @types 패키지가 없어 직접 선언)
 * 문서: https://apis.map.kakao.com/web/documentation/
 */
export {};

declare global {
  namespace kakao.maps {
    class LatLng {
      constructor(latitude: number, longitude: number);
      getLat(): number;
      getLng(): number;
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
      panBy(dx: number, dy: number): void;
      setLevel(level: number): void;
      relayout(): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      clickable?: boolean;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
    }

    interface CustomOverlayOptions {
      position: LatLng;
      content: string | HTMLElement;
      map?: Map;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
      clickable?: boolean;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
    }

    namespace services {
      type Status = "OK" | "ZERO_RESULT" | "ERROR";

      const Status: {
        OK: Status;
        ZERO_RESULT: Status;
        ERROR: Status;
      };

      interface AddressSearchResult {
        x: string; // 경도
        y: string; // 위도
        address_name: string;
      }

      class Geocoder {
        addressSearch(
          address: string,
          callback: (result: AddressSearchResult[], status: Status) => void,
        ): void;
      }
    }

    function load(callback: () => void): void;
  }

  interface Window {
    kakao: typeof kakao;
  }
}
