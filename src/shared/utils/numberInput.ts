import type { KeyboardEvent } from "react";

// number input의 화살표(스피너) 숨김 클래스 — 숫자 입력 칸 공통 사용
export const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

// number 입력에서 e, E, +, -, . 못 치게 막기 (type="number"의 허용 문자 차단)
export const blockNonNumeric = (e: KeyboardEvent<HTMLInputElement>) => {
  if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
};

// 소수점을 받는 칸용 — e, E, +, - 만 막고 . 은 허용 (면적 등)
export const blockNonDecimal = (e: KeyboardEvent<HTMLInputElement>) => {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
};

// 붙여넣기 방어 — 숫자와 소수점만 남기고, 소수점은 첫 번째 것만 인정한다.
// maxDecimals: 소수점 아래 자릿수 상한. 서버(exclusiveArea: double)는 자릿수 제한이
// 없어 FE가 정한다 — 면적은 평 환산을 소수 1자리로 보여주므로 기본 1자리로 맞춘다.
export const filterDecimal = (value: string, maxDecimals = 1) => {
  const [head, ...rest] = value.replace(/[^0-9.]/g, "").split(".");
  // 소수점이 없으면 정수부만. "66." 같은 입력 중간 상태는 그대로 둔다(점을 못 치게 되므로)
  if (rest.length === 0) return head;
  return `${head}.${rest.join("").slice(0, maxDecimals)}`;
};
