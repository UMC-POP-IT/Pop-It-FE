import { create } from "zustand";

export interface ScrollSearchBarSummary {
  categoryLabel: string;
  dateLabel: string;
  districtLabel: string;
  keywordLabel: string;
}

/**
 * 축소된 검색바 pill 안의 개별 세그먼트. Header.tsx가 세그먼트별로 따로
 * 클릭을 받아서 onExpand에 넘기면, HeroSearchBar가 그 세그먼트에 해당하는
 * 드롭다운/캘린더/검색어 입력을 검색창이 펼쳐짐과 동시에 자동으로 연다(#275).
 */
export type SearchBarSegment = "category" | "date" | "district" | "keyword";

interface ScrollSearchBarState {
  /**
   * 헤더(Header.tsx)에 축소된 검색바 pill을 보여줄지 여부.
   * 검색 결과 화면(ExplorePage, resultsMode)에서 스크롤을 내려 원래 검색바가
   * 헤더 뒤로 넘어갔을 때만 true가 된다 - 다른 화면/스크롤 위치에서는 항상 false.
   */
  isVisible: boolean;
  /** pill에 표시할 현재 검색 조건 요약(라벨은 HeroSearchBar가 쓰는 것과 동일). */
  summary: ScrollSearchBarSummary | null;
  /**
   * pill의 개별 세그먼트 클릭 시 호출된다 - ExplorePage가 등록해서 검색바
   * 오버레이를 열고, segment가 있으면 그 세그먼트의 드롭다운/캘린더/검색어
   * 입력까지 함께 연다(예: "서울 전체" 세그먼트를 클릭하면 지역 드롭다운이
   * 펼쳐진 검색창과 동시에 열린다).
   */
  onExpand: ((segment?: SearchBarSegment) => void) | null;
  /**
   * pill 트리거 버튼(Header.tsx)에 포커스를 되돌릴 때 쓴다. Header가 자기
   * 버튼 ref로 등록해두면, 오버레이를 닫는 쪽(ExplorePage)이 이걸 호출해서
   * Escape로 오버레이를 닫았을 때 포커스가 사라지지 않고 트리거로 돌아가게
   * 한다. isVisible/summary/onExpand와 달리 검색 상태와 무관하게(Header가
   * 항상 떠 있는 전역 레이아웃이라) 한 번 등록되면 reset()에도 유지된다.
   */
  focusTrigger: (() => void) | null;
  setState: (state: {
    isVisible: boolean;
    summary: ScrollSearchBarSummary | null;
    onExpand: ((segment?: SearchBarSegment) => void) | null;
  }) => void;
  setFocusTrigger: (focusTrigger: (() => void) | null) => void;
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
  focusTrigger: null,
  setState: (state) => set(state),
  setFocusTrigger: (focusTrigger) => set({ focusTrigger }),
  reset: () => set({ isVisible: false, summary: null, onExpand: null }),
}));
