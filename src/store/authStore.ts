import { create } from "zustand";
import type { User } from "@/types";

type Mode = "GUEST" | "HOST";

export type PendingAction =
  | { type: "wish"; spaceId: number }
  | { type: "navigate"; path: string }
  | { type: "modeToggle"; targetMode: Mode; navigateTo: string };

interface AuthState {
  user: User | null;
  mode: Mode;
  isLoginModalOpen: boolean;
  pendingAction: PendingAction | null;
  hasSeenHostIntro: boolean; // 호스트 등록 안내 모달을 이미 봤는지 (한 번만 노출)

  setUser: (user: User | null) => void;
  login: (user: User) => void;
  setMode: (mode: Mode) => void;
  openLoginModal: (pendingAction?: PendingAction) => void;
  closeLoginModal: () => void;
  clearPendingAction: () => void;
  setPendingAction: (action: PendingAction) => void;
  setHostIntroSeen: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  mode: "GUEST",
  isLoginModalOpen: false,
  pendingAction: null,
  hasSeenHostIntro: false,

  setUser: (user) => set({ user }),
  login: (user) => set({ user, isLoginModalOpen: false }),
  setMode: (mode) => set({ mode }),
  openLoginModal: (pendingAction) =>
    set({ isLoginModalOpen: true, pendingAction: pendingAction ?? null }),
  closeLoginModal: () => set({ isLoginModalOpen: false, pendingAction: null }),
  clearPendingAction: () => set({ pendingAction: null }),
  setPendingAction: (action) => set({ pendingAction: action }),
  setHostIntroSeen: () => set({ hasSeenHostIntro: true }),
  logout: () =>
    set({
      user: null,
      mode: "GUEST",
      pendingAction: null,
      hasSeenHostIntro: false, // 로그아웃 시 초기화 → 다음 사용자에게 다시 안내
    }),
}));
