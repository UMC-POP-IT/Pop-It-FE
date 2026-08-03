/**
 * 한글 라벨을 서버 enum 값으로 바꾼다.
 * 표에 없으면 빈 값을 보내 400을 맞는 대신, 어느 항목이 문제인지 즉시 알린다.
 * (공간 등록 · 호스트 등록 변환에서 공용으로 사용)
 */
export const toEnum = <T extends string>(
  map: Record<string, T>,
  label: string,
  fieldName: string,
): T => {
  const value = map[label];
  if (!value) {
    throw new Error(`${fieldName}을(를) 변환하지 못했습니다: "${label}"`);
  }
  return value;
};
