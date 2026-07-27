// 주소(글자) → 좌표(숫자) 변환 — 카카오 지도 SDK의 Geocoder 사용
// 변환 실패(주소 모호/통신 실패) 시 null 반환

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export const geocodeAddress = (address: string): Promise<Coordinate | null> =>
  new Promise((resolve) => {
    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      // 못 찾았거나 결과가 비었으면 null
      if (status !== window.kakao.maps.services.Status.OK || !result[0]) {
        resolve(null);
        return;
      }

      // 카카오는 x=경도, y=위도이며 값이 문자열이라 숫자로 변환
      resolve({
        latitude: Number(result[0].y),
        longitude: Number(result[0].x),
      });
    });
  });
