import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";

// 공간 수정 진입점: 스위치를 켜고 등록폼으로 보낸다. (값 불러오기는 다음 주 API)
export const SpaceEditEntry = () => {
  const setEdit = useRegisterStore((s) => s.setEdit);
  const navigate = useNavigate();

  useEffect(() => {
    setEdit(true); // 수정 모드 ON
    // TODO(다음주 API): getSpace(spaceId)로 기존 값 받아 setValues(...)
    navigate("/host/register", { replace: true }); // 등록폼으로 이동
  }, [navigate, setEdit]);

  return null; // 화면엔 아무것도 안 그림 (바로 넘김)
};
