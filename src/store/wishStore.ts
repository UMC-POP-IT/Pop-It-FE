import { create } from "zustand";
import type { Space } from "@/types";

interface WishState {
  wishedSpaces: Space[];
  toggleWish: (space: Space) => void;
}

export const useWishStore = create<WishState>((set) => ({
  wishedSpaces: [],
  toggleWish: (space) =>
    set((state) => {
      const exists = state.wishedSpaces.some((s) => s.id === space.id);
      return {
        wishedSpaces: exists
          ? state.wishedSpaces.filter((s) => s.id !== space.id) // 이미 찜한 공간이면 제거
          : [...state.wishedSpaces, space], // 찜하지 않은 공간이면 추가
      };
    }),
}));
