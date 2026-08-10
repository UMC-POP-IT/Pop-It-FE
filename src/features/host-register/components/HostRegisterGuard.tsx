import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useHostRegisterStore } from "@/store/registerStore";

interface HostRegisterGuardProps {
  /**
   * 완료 화면 전용 통과 조건.
   * 방금 등록을 마친 흐름(isJustRegistered)일 때만 화면을 열어준다.
   */
  allowJustRegistered?: boolean;
}

/**
 * 이미 호스트로 등록된 계정이 호스트 등록 화면에 다시 들어오는 것을 막는다.
 *
 * 등록 흐름은 start → step1 → step2 → complete 를 전부 히스토리에 쌓기 때문에,
 * 완료 후 뒤로가기를 누르면 reset()으로 비워진 폼이 그대로 되살아난다.
 * 그 상태로 다시 제출하면 서버가 409(이미 등록된 호스트)를 돌려준다.
 * 여기서 Navigate replace로 되돌리면 방문한 등록 화면이 히스토리에서 덮어써져
 * 뒤로가기를 반복해도 다시 등록 화면에 도달하지 못한다.
 *
 * hostStatus가 "unknown"이면 막지 않는다. 새로고침하면 unknown으로 돌아가는데
 * 앱 시작 시 등록 여부를 조회하는 곳이 없어(호출처는 useHostModeSwitch 하나) 흔한 값이고,
 * 여기서 서버에 물으면 진입할 때마다 로딩 화면이 끼어든다.
 * unknown으로 통과해 재제출한 경우는 HostRegisterStep2의 409 분기가 완료 화면으로 보내준다.
 */
export const HostRegisterGuard = ({
  allowJustRegistered = false,
}: HostRegisterGuardProps) => {
  const hostStatus = useAuthStore((s) => s.hostStatus);
  const isJustRegistered = useHostRegisterStore((s) => s.isJustRegistered);

  // 완료 화면은 등록 직후 1회만 열어준다.
  // hostStatus는 등록 직후와 한참 뒤 뒤로가기 때 똑같이 "registered"라 이 둘을 구분하지 못한다.
  const isAllowed = allowJustRegistered && isJustRegistered;

  if (hostStatus === "registered" && !isAllowed) {
    return (
      <Navigate
        to="/host/spaces"
        replace
      />
    );
  }

  return <Outlet />;
};

export default HostRegisterGuard;
