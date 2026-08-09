import { create } from "zustand";

export interface ScrollSearchBarSummary {
  categoryLabel: string;
  dateLabel: string;
  districtLabel: string;
  keywordLabel: string;
}

interface ScrollSearchBarState {
  /**
   * 헤더(Header.tsx)에 축소된 검색바 pill을 보여줄지 여부.
   * 검색 결과 화면(ExplorePage, resultsMode)에서 스크롤을 내려 원래 검색바가
   * 헤더 뒤로 넘어갔을 때만 true가 된다 - 다른 화면/스크롤 위치에서는 항상 false.
   */
  isVisible: boolean;
  /** pill에 표시할 현재 검색 조건 요약(라벨은 HeroSearchBar가 쓰는 것과 동일). */
  summary: ScrollSearchBarSummary | null;
  /** pill 클릭 시 호출된다 - ExplorePage가 등록해서 검색바 오버레이를 연다. */
  onExpand: (() => void) | null;
  setState: (state: {
    isVisible: boolean;
    summary: ScrollSearchBarSummary | null;
    onExpand: (() => void) | null;
  }) => void;
  reset: () => void;
}

/**
 * Header는 모든 라우트에 공통으로 떠 있는 전역 레이아웃이라, 특정 화면(검색
 * 결과 화면)의 스크롤 상태를 직접 알 수 없다. 그 화면(ExplorePage)이 스크롤에
 * 따라 이 스토어를 갱신하면 Header는 그냥 구독만 해서 pill을 그리거나 숨긴다.
 */
export const useScrollSearchBarStore = create<ScrollSearchBarState>((set) => ({
  isVisible: false,
  summary: null,
  onExpand: null,
  setState: (state) => set(state),
  reset: () => set({ isVisible: false, summary: null, onExpand: null }),
}));
