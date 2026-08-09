import { create } from "zustand";
import type { User } from "@/types";
import { getMyHost } from "@/shared/utils/oauth";
import { useWishStore } from "@/store/wishStore";

type Mode = "GUEST" | "HOST";

/**
 * 호스트 등록 여부.
 * unknown = 아직 서버에 안 물어본 상태 (미등록과 반드시 구분해야 한다)
 */
export type HostStatus = "unknown" | "registered" | "unregistered";

export type PendingAction =
  | { type: "wish"; spaceId: number }
  | { type: "navigate"; path: string }
  | { type: "modeToggle"; targetMode: Mode; navigateTo: string };

interface AuthState {
  user: User | null;
  mode: Mode;
  isLoginModalOpen: boolean;
  pendingAction: PendingAction | null;
  isSessionReady: boolean;
  /**
   * 호스트 등록 여부 (GET /api/v1/hosts/me 결과)
   *
   * unknown      → 아직 조회하지 않음. 이 상태에서는 등록/미등록을 단정하지 않는다.
   * registered   → 200. 호스트 프로필이 있다.
   * unregistered → 404. 아직 등록하지 않았다 (오류가 아니라 정상 상태).
   *
   * 새로고침하면 unknown으로 돌아가고, 앱 시작 시 다시 조회해 채운다.
   */
  hostStatus: HostStatus;

  setSessionReady: () => void;
  setHostStatus: (hostStatus: HostStatus) => void;
  /** 서버에 물어 hostStatus를 갱신하고, 갱신된 값을 돌려준다 */
  refreshHostStatus: () => Promise<HostStatus>;

  login: (user: User) => void;
  setMode: (mode: Mode) => void;
  openLoginModal: (pendingAction?: PendingAction) => void;
  closeLoginModal: () => void;
  clearPendingAction: () => void;
  setPendingAction: (action: PendingAction) => void;
  logout: () => void;
}

// accessToken / refreshToken은 store에 두지 않고 localStorage에만 저장한다.
// API 호출은 src/shared/utils/apiClient.ts의 apiFetch가 localStorage에서 직접 읽는다.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  mode: "GUEST",
  isLoginModalOpen: false,
  pendingAction: null,
  hostStatus: "unknown",
  isSessionReady: false,

  setSessionReady: () => set({ isSessionReady: true }),
  setHostStatus: (hostStatus) => set({ hostStatus }),

  refreshHostStatus: async () => {
    try {
      const host = await getMyHost();
      const status: HostStatus = host ? "registered" : "unregistered";
      set({ hostStatus: status });
      return status;
    } catch (error) {
      // 네트워크 오류·인증 만료 등. 미등록으로 단정할 수 없으므로 unknown으로 되돌린다.
      // (set 없이 return만 하면 store에 이전 값이 남아 반환값과 어긋난다)
      console.error("호스트 상태 조회 실패:", error);
      set({ hostStatus: "unknown" });
      return "unknown";
    }
  },

  login: (user) => {
    // 이전 사용자의 찜 동기화 상태가 다음 로그인 사용자에게 그대로 남지 않도록 초기화
    useWishStore.getState().reset();
    set({ user, mode: user.currentMode, isLoginModalOpen: false });
  },
  setMode: (mode) => set({ mode }),
  openLoginModal: (pendingAction) =>
    set({ isLoginModalOpen: true, pendingAction: pendingAction ?? null }),
  closeLoginModal: () => set({ isLoginModalOpen: false, pendingAction: null }),
  clearPendingAction: () => set({ pendingAction: null }),
  setPendingAction: (action) => set({ pendingAction: action }),
  logout: () => {
    useWishStore.getState().reset();
    set({
      user: null,
      mode: "GUEST",
      pendingAction: null,
      hostStatus: "unknown", // 다음 사용자로 바뀔 수 있어 다시 조회하도록 되돌린다
    });
  },
}));
