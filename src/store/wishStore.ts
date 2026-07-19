import { create } from "zustand";
import { useSpaceStore } from "@/store/spaceStore";

interface WishState {
  wishedIds: number[];
  toggleWish: (spaceId: number) => void;
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
}));
