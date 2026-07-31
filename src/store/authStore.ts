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
    /**
   * 호스트 등록 완료 여부 (클라이언트 임시 상태)
   *
   * ⚠️ 현재는 Zustand 메모리에만 존재해 새로고침 시 false로 초기화된다.
   *    등록을 마친 사용자도 새로고침하면 등록 화면으로 되돌아간다.
   *
   * TODO(호스트 등록 API 연동): GET /api/v1/hosts/me 응답으로 복원한다.
   *   - 200 → 등록됨 / 404 → 미등록 (404는 에러가 아니라 정상 상태)
   *   - 조회 중(미확정)과 미등록을 boolean으로는 구분할 수 없어
   *     "unknown" | "registered" | "unregistered" 형태로 확장 필요.
   *     (미확정을 false로 두면 조회 완료 전에 가드가 잘못 튕겨낸다)
   */
  isHostRegistered: boolean;

  setUser: (user: User | null) => void;
  login: (user: User) => void;
  setMode: (mode: Mode) => void;
  openLoginModal: (pendingAction?: PendingAction) => void;
  closeLoginModal: () => void;
  clearPendingAction: () => void;
  setHostRegistered: (isHostRegistered: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  mode: "GUEST",
  isLoginModalOpen: false,
  pendingAction: null,
  isHostRegistered: false,

  setUser: (user) => set({ user }),
  login: (user) => set({ user, isLoginModalOpen: false }),
  setMode: (mode) => set({ mode }),
  openLoginModal: (pendingAction) =>
    set({ isLoginModalOpen: true, pendingAction: pendingAction ?? null }),
  closeLoginModal: () => set({ isLoginModalOpen: false, pendingAction: null }),
  clearPendingAction: () => set({ pendingAction: null }),
  setHostRegistered: (isHostRegistered) => set({ isHostRegistered }),
  logout: () =>
    set({
      user: null,
      mode: "GUEST",
      pendingAction: null,
      isHostRegistered: false, // 로그아웃 시 초기화 → 다음 사용자에게 다시 안내
    }),
}));
