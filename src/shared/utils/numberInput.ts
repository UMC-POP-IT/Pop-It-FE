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

// 붙여넣기 방어 — 숫자와 소수점만 남기고, 소수점은 첫 번째 것만 인정한다
export const filterDecimal = (value: string) => {
  const [head, ...rest] = value.replace(/[^0-9.]/g, "").split(".");
  return rest.length > 0 ? `${head}.${rest.join("")}` : head;
};