import { create } from "zustand";
import { useSpaceStore } from "@/store/spaceStore";

interface WishState {
  wishedIds: number[];
  toggleWish: (spaceId: number) => void;
  /**
   * 서버가 내려준 찜 여부(isWishlisted)로 로컬 상태를 맞춘다.
   * toggleWish와 달리 heartCount를 건드리지 않는다 - 서버 응답의 wishCount를
   * 그대로 신뢰하는 화면(공간 탐색/상세)에서 최초 진입 시 상태만 동기화하기 위한 용도.
   */
  syncWished: (spaceId: number, isWished: boolean) => void;
}

export const useWishStore = create<WishState>((set, get) => ({
  wishedIds: [],
  toggleWish: (spaceId) => {
    const isWished = get().wishedIds.includes(spaceId);
    set((state) => ({
      wishedIds: isWished
        ? state.wishedIds.filter((id) => id !== spaceId) // 이미 찜한 공간이면 제거
        : [...state.wishedIds, spaceId], // 찜하지 않은 공간이면 추가
    }));
    useSpaceStore.getState().adjustHeartCount(spaceId, isWished ? -1 : 1);
  },
  syncWished: (spaceId, isWished) => {
    const alreadyWished = get().wishedIds.includes(spaceId);
    if (alreadyWished === isWished) return;
    set((state) => ({
      wishedIds: isWished
        ? [...state.wishedIds, spaceId]
        : state.wishedIds.filter((id) => id !== spaceId),
    }));
  },
}));
