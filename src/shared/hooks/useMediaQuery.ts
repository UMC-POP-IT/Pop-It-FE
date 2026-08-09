import { useEffect, useState } from "react";

/**
 * CSS media query 문자열(예: "(min-width: 768px)")을 구독해서 현재 일치 여부를
 * 반환한다. 창 크기가 바뀌거나(리사이즈, 기기 회전) 브레이크포인트를 넘나들
 * 때마다 자동으로 갱신된다.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);
    handleChange(); // query 문자열이 바뀌었을 수도 있으니 구독 직후 한 번 동기화
    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
};
