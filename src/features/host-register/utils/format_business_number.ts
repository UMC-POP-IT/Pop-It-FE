/**
 * 숫자 문자열 → 사업자등록번호 표시 형식 (000-00-00000).
 * 화면 표시 전용 — store와 서버 요청에는 하이픈 없는 숫자만 담는다.
 * (백엔드: 하이픈 포함/미포함 모두 받고 DB에는 숫자 10자리로 저장, 조회 시에도 숫자로 내려옴)
 */
export const formatBusinessNumber = (digits: string) => {
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};
