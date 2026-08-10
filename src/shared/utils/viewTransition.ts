import { flushSync } from "react-dom";
import type { CSSProperties } from "react";

/**
 * HeroSearchBar(큰 검색바)와 Header의 축소 pill이 공유하는 view-transition-name.
 * 이 이름을 가진 엘리먼트가 "이전 화면"과 "이후 화면"에 하나씩 있으면, 브라우저가
 * 둘의 위치/크기를 자동으로 보간해서 하나가 다른 하나로 모핑되는 것처럼 보여준다.
 * 절대 두 엘리먼트가 동시에 이 이름을 가져서는 안 된다(같은 순간엔 반드시 화면에
 * 실제로 보이는 쪽에만 부여해야 함 - 동시에 존재하면 브라우저가 예외를 던진다).
 */
export const SEARCH_BAR_VIEW_TRANSITION_NAME = "search-bar";

/** viewTransitionName은 아직 React CSSProperties 타입에 없어서 직접 확장해서 쓴다. */
export type MorphTransitionStyle = CSSProperties & { viewTransitionName?: string };

/**
 * 검색바 위치 상태 변경을 View Transitions API로 감싼다. 같은
 * view-transition-name을 가진 두 엘리먼트가 서로 자리를 넘겨받을 때(예: 스크롤로
 * 큰 검색바 → 헤더의 작은 pill, 또는 그 반대) 브라우저가 위치/크기를 자동으로
 * 보간해 모핑 애니메이션을 만들어준다. 직접 rect를 측정해 FLIP을 구현하는 대신
 * 브라우저 내장 기능을 쓴다(Chrome/Edge 111+, Safari 18+, Firefox 133+ -
 * 2026년 기준 baseline, web.dev 발표 기준).
 *
 * flushSync가 필요한 이유: startViewTransition은 콜백이 "동기적으로" DOM을
 * 갱신했다고 가정하고 콜백이 끝나는 즉시 이후 화면을 캡처한다. React의 기본
 * 배치(batching)로 상태 업데이트를 다음 tick으로 미루면, 캡처 시점에 아직 이전
 * DOM이 남아있어 전환 애니메이션이 재생되지 않는다.
 *
 * 미지원 브라우저(구형 Firefox 등)에서는 startViewTransition 자체가 없으므로
 * 그냥 즉시 update()만 실행한다 - 기능은 동일하고 전환 애니메이션만 생략된다
 * (progressive enhancement, 별도 폴백 코드가 필요 없다).
 */
/** withSearchBarTransition이 실행 중인 동안 true. Banner가 구독해서 flash 방지에 쓴다. */
export let searchBarTransitionActive = false;

export const withSearchBarTransition = (update: () => void) => {
  if (typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  searchBarTransitionActive = true;
  document.startViewTransition(() => {
    flushSync(update);
  }).finished.finally(() => {
    searchBarTransitionActive = false;
  });
};
