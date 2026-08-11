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
 * hostStatus가 "unknown"이면 막지 않는다. 등록 여부를 모르는 상태에서 미등록으로 단정하면
 * 이미 등록한 호스트를 등록 화면에 가둘 수 있어서다. 새로고침 직후의 unknown은
 * MainLayout의 SessionBootstrap이 세션 복원과 함께 조회를 끝낸 뒤 isSessionReady를 켜므로
 * 이 가드가 판단할 때는 이미 채워져 있다.
 */
export const HostRegisterGuard = ({
  allowJustRegistered = false,
}: HostRegisterGuardProps) => {
  const hostStatus = useAuthStore((s) => s.hostStatus);
  const isJustRegistered = useHostRegisterStore((s) => s.isJustRegistered);

  // 완료 화면은 통과권만 본다.
  // hostStatus는 등록 직후와 한참 뒤 뒤로가기 때 똑같이 "registered"라 이 둘을 구분하지 못하고,
  // hostStatus를 조건에 끼우면 아직 등록하지 않은 계정이 주소를 직접 입력해 완료 화면을 볼 수 있다.
  if (allowJustRegistered) {
    if (isJustRegistered) return <Outlet />;
    return (
      <Navigate
        to={
          hostStatus === "registered" ? "/host/spaces" : "/host/host-register"
        }
        replace
      />
    );
  }

  if (hostStatus === "registered") {
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
