import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchHistoryState {
  /**
   * 이 브라우저에서 공간 탐색 검색을 한 번이라도 실행했는지 여부.
   * localStorage에 영구 저장되어 새로고침/재방문해도 유지된다(로그인 여부와 무관).
   * AI 맞춤형 공간 섹션은 이 값이 true일 때만 노출한다.
   */
  hasSearched: boolean;
  markSearched: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      hasSearched: false,
      markSearched: () => set({ hasSearched: true }),
    }),
    { name: "pop-it:search-history" },
  ),
);
