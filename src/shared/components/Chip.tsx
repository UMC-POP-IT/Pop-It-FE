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
    // 모바일 좌우 여백은 0, md 이상은 시안대로 20.
    // SUIT Variable은 한글 advance가 874/1000em이라 18px에서 한 자 15.73px이고,
    // 가장 긴 라벨 "중소형 사무실"(BUILDING_TYPES)이 15.73×6 + 공백 4.14 = 98.53px다.
    // 모바일 칩은 104폭에서 테두리 2를 빼면 글자 자리가 102라 여백 없이 겨우 들어간다.
    // px-5(40)면 62, px-2(16)면 86만 남아 둘 다 넘치고, whitespace-nowrap이 줄바꿈을
    // 막아 넘친 글자가 칩 밖으로 그려지면서 옆 칩과 겹쳐 보였다.
    // md 이상은 칩이 165(태블릿)·155(데스크톱)라 px-5를 써도 남는다
    className={`flex h-14 w-full items-center justify-center rounded-lg border px-0 text-lg transition-colors md:px-5 ${
      selected
        ? "border-primary bg-primary-light text-primary font-bold"
        : "border-divider text-text-placeholder hover:border-primary-hover hover:text-primary-hover bg-white font-medium"
    }`}
  >
    {/* 360 뷰포트에서는 위 계산대로 다 들어가지만 여유가 3.47px뿐이라, 그보다 좁은 화면
        (320 등)에서는 자리가 모자란다. 그때 글자가 칩 밖으로 삐져나와 옆 칩과 겹치는 대신
        말줄임으로 끝나게 하는 안전장치다.
        min-w-0이 없으면 flex 항목이 내용 크기 아래로 줄지 않아 truncate가 동작하지 않는다
        (flex 항목의 min-width 기본값이 auto라 내용 폭이 하한이 된다).
        버튼에 직접 걸면 안 된다 — display:flex라 ellipsis가 익명 flex 항목에 적용되지 않는다 */}
    <span className="min-w-0 truncate">{label}</span>
  </button>
);

export default Chip;
