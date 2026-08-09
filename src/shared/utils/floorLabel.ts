// 공간 상세페이지에 노출되는 층수 표기 규칙.
// 호스트 공간등록 시 입력한 층수 유형(floorType)·층수(floorNumber)를
// 아래 규칙에 맞는 문구로 변환한다.
//   반지층 → "반지층" (숫자 없음)
//   옥탑   → "옥탑" (숫자 없음)
//   지하   → "지하 n층"
//   지상층 → "n층" ("지상" 접두어 없이 숫자만)
// floorNumber는 Swagger 명세상 null일 수 있다 (층수 입력칸이 없는 유형 등).
// null인데도 문자열 보간을 그대로 하면 "지하 null층" 같은 값이 그대로 노출되므로
// 숫자가 없을 때는 층수를 뺀 문구로 대체한다.
export const formatFloorLabel = (floorType: string, floorNumber: number | null) => {
  switch (floorType) {
    case "SEMI_BASEMENT":
      return "반지층";
    case "ROOFTOP":
      return "옥탑";
    case "BASEMENT":
      return floorNumber != null ? `지하 ${floorNumber}층` : "지하";
    case "GENERAL_FLOOR":
      return floorNumber != null ? `${floorNumber}층` : "층수 정보 없음";
    default:
      // 백엔드 enum이 늘어나거나 값이 비어있는 등 예외 상황에서도
      // 화면이 깨지지 않도록 원본 값을 그대로 노출한다.
      return floorNumber != null ? `${floorNumber}층 (${floorType})` : floorType;
  }
};
