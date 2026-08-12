import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 400;

/**
 * 로딩 상태(isLoading)가 delayMs 이상 계속될 때만 true를 반환한다.
 *
 * 데이터 요청이 실제로 짧게 끝나는 경우(대부분의 경우)에는 로딩 UI를 아예
 * 노출하지 않기 위한 훅이다 - 매번 로딩 화면을 잠깐 보여주면 화면이 순간
 * 깜빡이면서 오류처럼 느껴지는 경험을 준다(#275). delayMs 이전에 isLoading이
 * false로 바뀌면 타이머가 취소되어 로딩 UI가 아예 렌더링되지 않는다.
 */
export const useDelayedLoading = (
  isLoading: boolean,
  delayMs: number = DEFAULT_DELAY_MS,
): boolean => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShouldShow(false);
      return;
    }
    const timer = setTimeout(() => setShouldShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  return shouldShow;
};
