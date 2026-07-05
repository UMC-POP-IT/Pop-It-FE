import { create } from "zustand";
import type { User } from "@/types";

type Mode = "GUEST" | "HOST";

interface AuthState {
  user: User | null;
  mode: Mode;
  isLoginModalOpen: boolean;

  setUser: (user: User | null) => void;
  setMode: (mode: Mode) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  mode: "GUEST",
  isLoginModalOpen: false,

  setUser: (user) => set({ user }),
  setMode: (mode) => set({ mode }),
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  logout: () => set({ user: null, mode: "GUEST" }),
}));
