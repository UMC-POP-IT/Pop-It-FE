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
    // 피그마 칩 폭: 모바일 flex:1 0 0(3열이라 104) · 태블릿 165 · 데스크톱 184.
    // 모바일만 남는 폭을 나눠 갖고, md부터는 고정폭으로 돌아간다
    // 선택 상태 피그마: radius 8 · border 1px Blue/blue-500(#0564F5) · bg Blue/blue-50(#E6F0FE).
    // 예전엔 테두리가 2.5px에 blue-400이었고 배경이 흰색이라 안이 안 채워졌다
    className={`flex h-14 flex-1 shrink-0 items-center justify-center rounded-lg border px-5 text-lg whitespace-nowrap transition-colors md:w-[165px] md:flex-none lg:w-[184px] ${
      selected
        ? "border-primary bg-primary-light text-primary font-bold"
        : "border-divider text-text-placeholder hover:border-primary-hover hover:text-primary-hover bg-white font-medium"
    }`}
  >
    {label}
  </button>
);

export default Chip;
