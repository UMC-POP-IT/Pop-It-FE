export interface Coordinate {
  latitude: number;
  longitude: number;
}

// 카카오가 준 x·y를 숫자 좌표로 변환한다. 값이 이상하면 null.
const toCoordinate = (item?: { x?: string; y?: string }): Coordinate | null => {
  const latitude = Number(item?.y); // 카카오는 y가 위도
  const longitude = Number(item?.x); // x가 경도
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
};

export const geocodeAddress = (address: string): Promise<Coordinate | null> =>
  new Promise((resolve) => {
    // SDK(services)가 아직 없으면 변환 불가 → 계약대로 null
    const Geocoder = window.kakao?.maps?.services?.Geocoder;
    if (!Geocoder) {
      resolve(null);
      return;
    }

    try {
      const geocoder = new Geocoder();

      geocoder.addressSearch(address, (result, status) => {
        // 콜백은 나중에 실행돼 바깥 try/catch가 못 잡는다 → 여기서 따로 막는다
        try {
          if (
            status !== window.kakao?.maps?.services?.Status?.OK ||
            !Array.isArray(result) ||
            result.length === 0
          ) {
            resolve(null);
            return;
          }

          resolve(toCoordinate(result[0]));
        } catch {
          resolve(null);
        }
      });
    } catch {
      resolve(null); // 생성·검색 호출 중 예외 (콜백 밖)
    }
  });
