// 숫자(0-9) 외 문자를 모두 제거 — 사업자번호·계좌번호 등 숫자만 받는 칸에서 공통 사용
export const sanitizeNumber = (value: string) => value.replace(/[^0-9]/g, "");
