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

  setUser: (user: User | null) => void;
  login: (user: User) => void;
  setMode: (mode: Mode) => void;
  openLoginModal: (pendingAction?: PendingAction) => void;
  closeLoginModal: () => void;
  clearPendingAction: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  mode: "GUEST",
  isLoginModalOpen: false,
  pendingAction: null,

  setUser: (user) => set({ user }),
  login: (user) => set({ user, isLoginModalOpen: false }),
  setMode: (mode) => set({ mode }),
  openLoginModal: (pendingAction) =>
    set({ isLoginModalOpen: true, pendingAction: pendingAction ?? null }),
  closeLoginModal: () => set({ isLoginModalOpen: false, pendingAction: null }),
  clearPendingAction: () => set({ pendingAction: null }),
  logout: () => set({ user: null, mode: "GUEST", pendingAction: null }),
}));
