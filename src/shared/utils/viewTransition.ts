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
export type MorphTransitionStyle = CSSProperties & {
  viewTransitionName?: string;
};

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

/**
 * 마지막으로 시작된 전환의 종료(성공/실패 무관)를 기다릴 수 있는 promise.
 * withSearchBarTransition 호출들을 이 promise 뒤로 한 줄로 세워서, 브라우저에
 * "동시에 두 개 이상의" startViewTransition이 걸리지 않도록 한다.
 *
 * 왜 필요한가: 검색 결과 화면에서 재검색 직후(오버레이를 접는 전환) 곧바로 새
 * 결과가 로드되어 스크롤 상태가 다시 계산되는 전환(IntersectionObserver 콜백)이
 * 뒤따라 걸리는 경우가 있다 - 두 전환이 겹치면 나중 전환이 먼저 걸린 전환의
 * "이후" 스냅샷을 아직 다 반영되지 않은 중간 상태에서 캡처해버리거나, 브라우저가
 * 이전 전환을 즉시 스킵(skipTransition)시켜 그 전환이 만들려던 최종 DOM
 * 상태(opacity 등)가 애니메이션 없이 어중간하게 남는 경우가 있었다 - 그 결과로
 * 검색바가 opacity-0인 채로 멈춰 "사라진" 것처럼 보이는 버그가 있었다(#275).
 * 순서를 보장하면 각 전환이 항상 이전 전환이 완전히 끝난 뒤의 안정된 DOM에서
 * 시작해서, 이런 레이스가 생기지 않는다.
 */
let lastTransitionSettled: Promise<void> = Promise.resolve();

export const withSearchBarTransition = (update: () => void) => {
  if (typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  // 이전 전환이 아직 끝나지 않았다면 그걸 먼저 기다린 뒤에 이번 전환을 시작한다.
  // 큐에 매달리는 동안에도 update 자체는 나중에 실행되므로(never lost), 순서만
  // 뒤로 밀린다 - 상태 업데이트가 유실되지는 않는다.
  // runNext는 반드시 "이 전환이 끝나는" promise를 반환해야 한다 - 그래야
  // lastTransitionSettled.then(runNext)가 만드는 다음 promise가 runNext() 호출
  // 자체가 아니라 그 안의 transition.finished가 끝날 때까지 실제로 대기한다
  // (Promise.then 핸들러가 promise를 반환하면 바깥 promise가 그 promise를
  // 그대로 이어받는다는 규칙을 이용).
  const runNext = () => {
    searchBarTransitionActive = true;
    return document.startViewTransition!(() => {
      flushSync(update);
    })
      .finished.catch(() => {})
      .finally(() => {
        searchBarTransitionActive = false;
      });
  };
  lastTransitionSettled = lastTransitionSettled.then(runNext, runNext);
};
