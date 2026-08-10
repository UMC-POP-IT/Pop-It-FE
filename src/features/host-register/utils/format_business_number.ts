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

/**
 * 포맷된 문자열에서 "숫자를 digitCount개 지난 직후"의 문자 인덱스를 돌려준다.
 * 하이픈이 끼면 문자 인덱스가 밀리므로, 커서는 문자 위치가 아니라
 * 숫자 개수 기준으로 복원해야 원래 자리에 남는다.
 * digitCount가 실제 숫자 개수보다 크면 문자열 끝을 돌려준다.
 */
export const caretIndexAfterDigits = (
  formatted: string,
  digitCount: number,
) => {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (formatted[i] >= "0" && formatted[i] <= "9") {
      seen += 1;
      if (seen === digitCount) return i + 1;
    }
  }
  return formatted.length;
};
