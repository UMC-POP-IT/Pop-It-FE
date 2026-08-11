import { create } from "zustand";
import type { User } from "@/types";
import { getMyHost } from "@/shared/utils/oauth";
import { useWishStore } from "@/store/wishStore";
import { useRegisterStore, useHostRegisterStore } from "@/store/registerStore";

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

/**
 * 진행 중인 hostStatus 조회를 무효화하는 순번.
 *
 * hostStatus를 바꾸는 길이 두 갈래다 — 서버에 물어보는 refreshHostStatus와,
 * 답을 이미 아는 쪽에서 직접 넣는 setHostStatus(등록 성공 직후의 HostRegisterStep2).
 * 늦게 도착한 조회 응답이 그 사이에 확정된 값을 덮으면 방금 등록한 호스트가
 * 다시 unregistered가 된다. 세션이 바뀌거나 값이 직접 정해질 때마다 번호를 올려
 * 그 전에 나간 조회의 응답을 버린다.
 *
 * store 밖 모듈 변수인 이유: 화면에 그릴 값이 아니라 응답을 반영할지 판단하는 표식이라
 * 상태로 두면 바뀔 때마다 불필요한 리렌더만 생긴다.
 */
let hostStatusRequestId = 0;

// accessToken / refreshToken은 store에 두지 않고 localStorage에만 저장한다.
// API 호출은 src/shared/utils/apiClient.ts의 apiFetch가 localStorage에서 직접 읽는다.
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  mode: "GUEST",
  isLoginModalOpen: false,
  pendingAction: null,
  hostStatus: "unknown",
  isSessionReady: false,

  setSessionReady: () => set({ isSessionReady: true }),
  setHostStatus: (hostStatus) => {
    // 등록 성공처럼 답이 확정된 경우다. 그 전에 나간 조회의 응답은 이제 낡았으므로 버린다.
    hostStatusRequestId += 1;
    set({ hostStatus });
  },

  refreshHostStatus: async () => {
    // 이 호출의 번호를 뽑아둔다. 뒤에 누가 번호를 더 올리면 내 응답은 낡은 것이 된다.
    const myRequestId = (hostStatusRequestId += 1);
    // 요청을 보낸 시점의 사용자. 응답을 기다리는 사이 로그아웃하거나 계정이 바뀌면
    // 이전 계정의 조회 결과가 지금 로그인한 사용자의 상태로 기록된다
    // (A가 호스트라면 뒤이어 로그인한 B가 등록 화면에 들어가지 못한다).
    const requestedUser = get().user;
    // 응답이 도착한 시점에 부른다. 요청 시점에 검사하면 그 사이의 변화를 볼 수 없다.
    const isCurrent = () =>
      hostStatusRequestId === myRequestId && get().user === requestedUser;

    try {
      const host = await getMyHost();
      const status: HostStatus = host ? "registered" : "unregistered";
      if (!isCurrent()) return "unknown";
      set({ hostStatus: status });
      return status;
    } catch (error) {
      // 네트워크 오류·인증 만료 등. 미등록으로 단정할 수 없으므로 unknown으로 되돌린다.
      // (set 없이 return만 하면 store에 이전 값이 남아 반환값과 어긋난다)
      console.error("호스트 상태 조회 실패:", error);
      if (isCurrent()) set({ hostStatus: "unknown" });
      return "unknown";
    }
  },

  login: (user) => {
    // 앞 사용자 앞으로 나간 조회가 아직 떠 있을 수 있다. 그 응답이 새 사용자의 상태가 되지 않도록 버린다.
    hostStatusRequestId += 1;
    // 이전 사용자의 찜 동기화 상태가 다음 로그인 사용자에게 그대로 남지 않도록 초기화
    useWishStore.getState().reset();
    // logout()에도 같은 초기화가 있지만 여기서도 한 번 더 한다.
    // OAuth 콜백은 logout()을 거치지 않고 login()만 부르므로(MainLayout의 OAuthCallbackHandler),
    // 로그아웃 없이 계정이 바뀌면 앞 사용자의 계좌번호·사업자등록번호와
    // 완료 화면 통과권이 그대로 남는다.
    useRegisterStore.getState().reset();
    useHostRegisterStore.getState().reset();
    set({
      user,
      mode: user.currentMode,
      isLoginModalOpen: false,
      // 앞 사용자의 등록 여부를 그대로 두면 다음 사용자가 그 값으로 판정된다.
      // A(등록됨) → B(미등록)로 계정만 바뀌면 useHostModeSwitch가 재조회 없이 B를
      // /host/spaces로 보내고, HostRegisterGuard는 B를 등록 화면에서 튕겨낸다.
      // "unregistered"가 아니라 "unknown"이어야 한다 — 미등록으로 단정하면 이번엔
      // 이미 등록한 호스트가 등록 화면으로 끌려간다.
      hostStatus: "unknown",
    });
  },
  setMode: (mode) => set({ mode }),
  openLoginModal: (pendingAction) =>
    set({ isLoginModalOpen: true, pendingAction: pendingAction ?? null }),
  closeLoginModal: () => set({ isLoginModalOpen: false, pendingAction: null }),
  clearPendingAction: () => set({ pendingAction: null }),
  setPendingAction: (action) => set({ pendingAction: action }),
  logout: () => {
    // 로그아웃 뒤에 도착한 조회 응답이 비워둔 hostStatus를 다시 채우지 않도록 버린다
    hostStatusRequestId += 1;
    useWishStore.getState().reset();
    // 등록 폼은 전역 store라 로그아웃해도 남는다. 사업자등록번호·계좌번호 같은 입력값과
    // 완료 화면 통과권(isJustRegistered)이 다음 로그인 사용자에게 그대로 보이지 않도록 비운다
    useRegisterStore.getState().reset();
    useHostRegisterStore.getState().reset();
    set({
      user: null,
      mode: "GUEST",
      pendingAction: null,
      hostStatus: "unknown", // 다음 사용자로 바뀔 수 있어 다시 조회하도록 되돌린다
    });
  },
}));
