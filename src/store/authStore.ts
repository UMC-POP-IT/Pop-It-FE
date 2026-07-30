import { create } from "zustand";
import type { User } from "@/types";

type Mode = "GUEST" | "HOST";

export type PendingAction =
  | { type: "wish"; spaceId: number }
  | { type: "navigate"; path: string }
  | { type: "modeToggle"; targetMode: Mode; navigateTo: string };

interface AuthState {
  user: User | null;
  accessToken: string | null; // 백엔드 API 인증용 accessToken (Authorization 헤더에 실어 보냄)
  refreshToken: string | null; // accessToken 만료 시 재발급받는 데 사용
  mode: Mode;
  isLoginModalOpen: boolean;
  pendingAction: PendingAction | null;
  hasSeenHostIntro: boolean; // 호스트 등록 안내 모달을 이미 봤는지 (한 번만 노출)

  setUser: (user: User | null) => void;
  login: (user: User, accessToken?: string, refreshToken?: string) => void;
  setAccessToken: (accessToken: string) => void;
  setMode: (mode: Mode) => void;
  openLoginModal: (pendingAction?: PendingAction) => void;
  closeLoginModal: () => void;
  clearPendingAction: () => void;
  setHostIntroSeen: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  mode: "GUEST",
  isLoginModalOpen: false,
  pendingAction: null,
  hasSeenHostIntro: false,

  setUser: (user) => set({ user }),
  login: (user, accessToken, refreshToken) =>
    set({ user, accessToken: accessToken ?? null, refreshToken: refreshToken ?? null, isLoginModalOpen: false }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setMode: (mode) => set({ mode }),
  openLoginModal: (pendingAction) =>
    set({ isLoginModalOpen: true, pendingAction: pendingAction ?? null }),
  closeLoginModal: () => set({ isLoginModalOpen: false, pendingAction: null }),
  clearPendingAction: () => set({ pendingAction: null }),
  setHostIntroSeen: () => set({ hasSeenHostIntro: true }),
  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      mode: "GUEST",
      pendingAction: null,
      hasSeenHostIntro: false, // 로그아웃 시 초기화 → 다음 사용자에게 다시 안내
    }),
}));
