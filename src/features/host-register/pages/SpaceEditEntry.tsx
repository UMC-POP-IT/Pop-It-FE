import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useRegisterStore,
  type SpaceRegisterForm,
} from "@/store/registerStore";
import {
  mockHostSpaces,
  type MockHostSpace,
} from "@/features/host-manage/api/mock_host_data";
import { USAGE_OPTIONS } from "@/features/host-register/api/mock_register";

// 공간 수정 진입점: spaceId로 기존 값을 채우고 수정 모드로 등록폼에 보낸다.
export const SpaceEditEntry = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const setValues = useRegisterStore((s) => s.setValues);
  const setEdit = useRegisterStore((s) => s.setEdit);
  const reset = useRegisterStore((s) => s.reset);

  useEffect(() => {
    // useParams는 문자열을 주므로 id(number)와 비교할 때 형변환 필요
    const targetSpace = mockHostSpaces.find((s) => String(s.id) === spaceId);

    // 대상 공간을 못 찾으면 빈 폼을 열지 않고 목록으로 되돌림
    if (!targetSpace) {
      navigate("/host/spaces", { replace: true });
      return;
    }

    reset(); // 이전 등록/수정에서 남은 값 제거
    setValues(toRegisterForm(targetSpace)); // 기존 값 채우기
    setEdit(true, targetSpace.id); // 수정 모드 ON + 대상 id 보관
    navigate("/host/register", { replace: true }); // 등록폼으로 이동
  }, [spaceId, navigate, reset, setValues, setEdit]);

  return null; // 화면엔 아무것도 안 그림 (바로 넘김)
};

// Mock 공간 데이터 → 등록 폼 형태로 변환 (매핑 가능한 필드만)
// TODO(다음주 API): getSpace(spaceId) 응답으로 교체 + 나머지 필드까지 채우기
const toRegisterForm = (space: MockHostSpace): Partial<SpaceRegisterForm> => ({
  buildingName: space.name,
  address: space.address,
  area: space.area.replace(/[^0-9]/g, ""), // "66m²" → "66"
  priceDay: String(Math.round(space.cost.day / 10000)), // 700000원 → "70" (만원/일)
  description: space.description,
  // category 라벨이 USAGE_OPTIONS와 다른 경우가 있어 일치할 때만 반영
  usage: USAGE_OPTIONS.includes(space.category) ? space.category : "",
});
