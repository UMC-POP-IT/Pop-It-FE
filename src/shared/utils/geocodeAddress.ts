export interface Coordinate {
  latitude: number;
  longitude: number;
}

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
        // 못 찾았거나 결과가 비었으면 null (result가 배열이 아닐 수도 있어 방어)
        if (
          status !== window.kakao.maps.services.Status.OK ||
          !Array.isArray(result) ||
          result.length === 0
        ) {
          resolve(null);
          return;
        }

        // 카카오는 x=경도, y=위도이며 값이 문자열이라 숫자로 변환
        resolve({
          latitude: Number(result[0].y),
          longitude: Number(result[0].x),
        });
      });
    } catch {
      resolve(null); // 생성·검색 중 예외도 null로 흡수 (reject 금지)
    }
  });
