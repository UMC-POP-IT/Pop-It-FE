// 공간 상세페이지에 노출되는 층수 표기 규칙.
// 호스트 공간등록 시 입력한 층수 유형(floorType)·층수(floorNumber)를
// 아래 규칙에 맞는 문구로 변환한다.
//   반지층 → "반지층" (숫자 없음)
//   옥탑   → "옥탑" (숫자 없음)
//   지하   → "지하 n층"
//   지상층 → "n층" ("지상" 접두어 없이 숫자만)
export const formatFloorLabel = (floorType: string, floorNumber: number) => {
  switch (floorType) {
    case "SEMI_BASEMENT":
      return "반지층";
    case "ROOFTOP":
      return "옥탑";
    case "BASEMENT":
      return `지하 ${floorNumber}층`;
    case "GENERAL_FLOOR":
      return `${floorNumber}층`;
    default:
      // 백엔드 enum이 늘어나거나 값이 비어있는 등 예외 상황에서도
      // 화면이 깨지지 않도록 원본 값을 그대로 노출한다.
      return `${floorNumber}층 (${floorType})`;
  }
};
