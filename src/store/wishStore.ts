import { create } from "zustand";
import { useSpaceStore } from "@/store/spaceStore";

interface WishState {
  wishedIds: number[];
  localWishToggle: (spaceId: number) => void;
  /**
   * 서버가 내려준 찜 여부(isWishlisted)로 로컬 상태를 맞춘다.
   * localWishToggle와 달리 heartCount를 건드리지 않는다 - 서버 응답의 wishCount를
   * 그대로 신뢰하는 화면(공간 탐색/상세)에서 최초 진입 시 상태만 동기화하기 위한 용도.
   *
   * 찜 토글 API는 useWishGuard.handleWishToggle에서 실제로 호출되지만, 그 요청이
   * 응답을 받기 전에 필터 변경/페이지네이션/재시도 등으로 목록·상세 조회가 다시
   * 일어나면 아직 토글 반영 전인 stale한 서버 값이 syncWished로 들어올 수 있다.
   * 이미 한 번 동기화했거나 로컬에서 토글된 적 있는 spaceId는 재동기화하지 않아
   * 이 경쟁 상태에서 로컬 상태가 되돌아가는 것을 막는다.
   */
  syncWished: (spaceId: number, isWished: boolean) => void;
  syncedSpaceIds: number[];
  /**
   * 서버 동기화 여부와 무관하게, 세션 중 사용자가 직접 토글한 spaceId 집합.
   * localWishToggle이 syncWished보다 먼저 호출된 경우(예: 로그인 리다이렉트 후
   * pendingAction으로 handleWishToggle이 실행되며 localWishToggle이 먼저 반영되고,
   * 그 뒤에 상세 페이지의 최초 동기화가 일어나는 경우) syncedSpaceIds만으로는
   * 막을 수 없어 별도로 둔다.
   */
  syncedButLocallyToggled: number[];
  /**
   * wishedIds/syncedSpaceIds/syncedButLocallyToggled를 비운다. 이 상태는 특정
   * 사용자의 서버 동기화 결과를 담고 있어서, 로그인/로그아웃으로 사용자가 바뀔 때
   * 초기화하지 않으면 이전 사용자의 찜 상태가 다음 사용자에게 그대로 보일 수
   * 있다 (authStore에서 호출).
   */
  reset: () => void;
}

export const useWishStore = create<WishState>((set, get) => ({
  wishedIds: [],
  syncedSpaceIds: [],
  syncedButLocallyToggled: [],
  localWishToggle: (spaceId) => {
    const isWished = get().wishedIds.includes(spaceId);
    set((state) => ({
      wishedIds: isWished
        ? state.wishedIds.filter((id) => id !== spaceId) // 이미 찜한 공간이면 제거
        : [...state.wishedIds, spaceId], // 찜하지 않은 공간이면 추가
      syncedButLocallyToggled: state.syncedButLocallyToggled.includes(spaceId)
        ? state.syncedButLocallyToggled
        : [...state.syncedButLocallyToggled, spaceId],
    }));
    useSpaceStore.getState().adjustHeartCount(spaceId, isWished ? -1 : 1);
  },
  syncWished: (spaceId, isWished) => {
    // 이미 한 번 동기화했거나(순서: 동기화 → 토글), 동기화 전/도중에 사용자가
    // 직접 토글한 적이 있으면(순서: 토글 → 동기화) 서버 기본값으로 덮어쓰지 않는다.
    // 아직 손대지 않은 공간은 기존과 동일하게 매번 서버 값으로 동기화한다.
    if (
      get().syncedSpaceIds.includes(spaceId) ||
      get().syncedButLocallyToggled.includes(spaceId)
    ) {
      return;
    }

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
  reset: () =>
    set({ wishedIds: [], syncedSpaceIds: [], syncedButLocallyToggled: [] }),
}));
