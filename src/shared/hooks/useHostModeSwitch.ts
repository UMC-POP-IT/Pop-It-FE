import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type HostStatus } from "@/store/authStore";
import { switchMode } from "@/shared/utils/oauth";

/**
 * 게스트 → 호스트 모드 전환의 단일 출처.
 *
 * 헤더 전환 버튼 · 로그인 직후 pendingAction · 호스트 등록 완료 화면이
 * 각자 다르게 구현하고 있어 한쪽을 고치면 다른 쪽이 어긋났다. 규칙을 여기 모은다.
 *
 * 1. hostStatus를 아직 모르면(unknown) 서버에 한 번 물어본다.
 * 2. 그래도 unknown이면 **이동하지 않고** "unknown"을 돌려준다.
 *    미등록으로 단정하면 이미 등록한 호스트를 등록 화면으로 보내게 된다.
 * 3. 클라이언트 모드를 HOST로 바꾸고 등록 여부에 맞는 화면으로 이동한다.
 * 4. 서버 currentMode도 등록 여부와 무관하게 항상 동기화한다.
 *    (실패해도 화면 이동은 이미 끝났으므로 막지 않는다)
 *
 * 실패 안내는 화면마다 형태가 달라 훅이 정하지 않는다. 반환값을 보고 호출한 쪽이 처리한다.
 */
export const useHostModeSwitch = () => {
  const navigate = useNavigate();

  return useCallback(async (): Promise<HostStatus> => {
    // 구독하지 않고 호출 시점의 최신 값을 읽는다.
    // useEffect 안에서 호출될 때 오래된 hostStatus를 잡는 것을 막기 위함.
    const { hostStatus, refreshHostStatus, setMode } = useAuthStore.getState();

    const status =
      hostStatus === "unknown" ? await refreshHostStatus() : hostStatus;

    if (status === "unknown") return status;

    setMode("HOST");
    navigate(status === "registered" ? "/host/spaces" : "/host/host-register");

    switchMode("HOST").catch((err: unknown) => {
      console.error("[useHostModeSwitch] 호스트 모드 서버 동기화 실패:", err);
    });

    return status;
  }, [navigate]);
};

export default useHostModeSwitch;
