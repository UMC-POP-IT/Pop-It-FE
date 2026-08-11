import { Navigate, Outlet } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";

/**
 * 서버가 이미 받아들인 등록/수정 폼으로 되돌아가는 것을 막는다.
 *
 * 공간 등록은 호스트 등록과 달리 여러 번 하는 것이 정상이라 화면 자체를 막지 않는다.
 * 문제가 되는 구간은 딱 하나 — 제출은 성공했는데 성공 모달의 [확인]을 아직 안 누른 사이다.
 * 그때는 reset()이 돌지 않아 폼이 그대로 살아 있어서, 뒤로가기로 step4까지 빠져나갔다가
 * 다시 제출하면 서버가 같은 내용으로 공간을 하나 더 만든다(서버는 중복을 막지 않는다).
 *
 * [확인]을 누르거나 '새 공간 등록'·'수정' 진입에서 reset()이 돌면 플래그가 꺼져 정상 통과한다.
 *
 * step5는 이 가드로 감싸지 않는다. 성공 모달을 띄우고 있는 화면이라 여기서 막으면
 * 등록 성공 안내가 뜨자마자 사라진다. step5의 [완료] 버튼은 같은 플래그로 따로 잠근다.
 */
export const SpaceRegisterGuard = () => {
  const isSpaceSubmitted = useRegisterStore((s) => s.isSpaceSubmitted);

  if (isSpaceSubmitted) {
    return (
      <Navigate
        to="/host/spaces"
        replace
      />
    );
  }

  return <Outlet />;
};

export default SpaceRegisterGuard;
