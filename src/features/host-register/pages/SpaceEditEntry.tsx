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

// mock/API의 category → 등록 폼 용도(USAGE_OPTIONS) 라벨 매핑
// 데이터 쪽 라벨("갤러리")과 폼 옵션("전시/갤러리")이 달라 명시적 변환이 필요
const USAGE_BY_CATEGORY: Record<string, string> = {
  팝업스토어: "팝업스토어",
  갤러리: "전시/갤러리",
  "전시/갤러리": "전시/갤러리",
  복합문화: "복합공간",
  복합공간: "복합공간",
  쇼룸: "쇼룸",
  "카페/F&B": "카페/F&B",
};

// "서울 강남구 역삼동 130-3" → 시/도·시군구 분리
// (주소 찾기 모달만 city/district를 채우므로, 수정 진입 시 같은 형태로 복원)
const toAddressParts = (address: string) => {
  const [city = "", district = ""] = address.split(" ");
  return {
    city: city.startsWith("서울") ? city : "",
    district: district.endsWith("구") ? district : "",
  };
};

// "66.5m²" → "66.5" — 소수점을 보존해 면적이 조용히 바뀌지 않게 함
const toAreaValue = (area: string) =>
  area.replace(/,/g, "").match(/[\d.]+/)?.[0] ?? "";

// 원 단위 금액 → 만원 단위 정수 (Step2 대여료 입력이 "만원/일" 정수라서 필요)
// 만원 단위가 아니면 반올림되므로 조용히 넘기지 않고 DEV에서 알린다
const toPriceDay = (won: number) => {
  if (import.meta.env.DEV && won % 10000 !== 0) {
    console.warn(
      `[SpaceEditEntry] 대여료 ${won}원은 만원 단위가 아니어서 반올림됩니다. API 연동 시 금액 단위 정책 확정 필요.`,
    );
  }
  return String(Math.round(won / 10000));
};

// category → 용도. 매핑에 없거나 폼 옵션에 없는 값이면 빈 값 + DEV 경고
const toUsage = (category: string) => {
  const mapped = USAGE_BY_CATEGORY[category] ?? "";
  const isValidUsage = USAGE_OPTIONS.includes(mapped);
  if (import.meta.env.DEV && !isValidUsage) {
    console.warn(
      `[SpaceEditEntry] category "${category}"를 용도로 매핑하지 못했습니다. USAGE_BY_CATEGORY 확인 필요.`,
    );
  }
  return isValidUsage ? mapped : "";
};

// Mock 공간 데이터 → 등록 폼 형태로 변환 (매핑 가능한 필드만)
// TODO(다음주 API): getSpace(spaceId) 응답으로 교체.
// detailAddress는 mock에 없어 비워두며, Step1 유효성 검사가 빈 값 제출을 막는다.
const toRegisterForm = (space: MockHostSpace): Partial<SpaceRegisterForm> => ({
  buildingName: space.name,
  address: space.address,
  ...toAddressParts(space.address), // city / district — 주소와 함께 복원
  area: toAreaValue(space.area),
  priceDay: toPriceDay(space.cost.day),
  description: space.description,
  usage: toUsage(space.category),
});
