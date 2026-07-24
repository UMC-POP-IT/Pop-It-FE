import type { KeyboardEvent } from "react";

// number input의 화살표(스피너) 숨김 클래스 — 숫자 입력 칸 공통 사용
export const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

// number 입력에서 e, E, +, -, . 못 치게 막기 (type="number"의 허용 문자 차단)
export const blockNonNumeric = (e: KeyboardEvent<HTMLInputElement>) => {
  if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
};
