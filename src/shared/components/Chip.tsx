interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Chip = ({ label, selected, onClick }: ChipProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    // 폭은 칩이 정하지 않고 감싸는 그리드가 정한다 — 열 수만 바꾸면 3단이 알아서 맞는다.
    //   모바일 328 3열 간격 8 → 104 · 태블릿 535 3열 간격 20 → 165 · 데스크톱 644 4열 간격 8 → 155
    // 선택 상태 피그마: radius 8 · border 1px Blue/blue-500(#0564F5) · bg Blue/blue-50(#E6F0FE).
    // 예전엔 테두리가 2.5px에 blue-400이었고 배경이 흰색이라 안이 안 채워졌다
    className={`flex h-14 w-full items-center justify-center rounded-lg border px-5 text-lg whitespace-nowrap transition-colors ${
      selected
        ? "border-primary bg-primary-light text-primary font-bold"
        : "border-divider text-text-placeholder hover:border-primary-hover hover:text-primary-hover bg-white font-medium"
    }`}
  >
    {label}
  </button>
);

export default Chip;
