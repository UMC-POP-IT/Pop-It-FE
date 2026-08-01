import { create } from "zustand";
import { useSpaceStore } from "@/store/spaceStore";

interface WishState {
  wishedIds: number[];
  toggleWish: (spaceId: number) => void;
  /**
   * 서버가 내려준 찜 여부(isWishlisted)로 로컬 상태를 맞춘다.
   * toggleWish와 달리 heartCount를 건드리지 않는다 - 서버 응답의 wishCount를
   * 그대로 신뢰하는 화면(공간 상세)에서 최초 진입 시 상태만 동기화하기 위한 용도.
   *
   * 찜 API가 아직 연동되지 않아 toggleWish는 로컬 상태만 바꾼다. 그래서 이미
   * 한 번 동기화한 spaceId는 재방문 시 다시 동기화하지 않는다 - 그렇지 않으면
   * 세션 내에서 로컬로 누른 토글이 페이지를 나갔다 들어올 때마다 서버 기본값(false)
   * 으로 되돌아간다. 찜 API 연동 후에는 이 가드를 제거하고 서버 값을 항상 신뢰하면 된다.
   */
  syncWished: (spaceId: number, isWished: boolean) => void;
  syncedSpaceIds: number[];
  /**
   * wishedIds/syncedSpaceIds를 비운다. 이 상태는 특정 사용자의 서버 동기화 결과를
   * 담고 있어서, 로그인/로그아웃으로 사용자가 바뀔 때 초기화하지 않으면 이전
   * 사용자의 찜 상태가 다음 사용자에게 그대로 보일 수 있다 (authStore에서 호출).
   */
  reset: () => void;
}

export const useWishStore = create<WishState>((set, get) => ({
  wishedIds: [],
  syncedSpaceIds: [],
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
    // 세션 내에서 이미 한 번 동기화한 공간이면, 그 사이 로컬 토글이 있었을 수 있으므로
    // 서버 기본값으로 덮어쓰지 않는다.
    if (get().syncedSpaceIds.includes(spaceId)) return;

    const alreadyWished = get().wishedIds.includes(spaceId);
    set((state) => ({
      wishedIds:
        alreadyWished === isWished
          ? state.wishedIds
          : isWished
            ? [...state.wishedIds, spaceId]
            : state.wishedIds.filter((id) => id !== spaceId),
      syncedSpaceIds: [...state.syncedSpaceIds, spaceId],
    }));
  },
  reset: () => set({ wishedIds: [], syncedSpaceIds: [] }),
}));
