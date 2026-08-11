interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0부터 시작
  /** fill: 가로 폭 전체에 균등 분배 (기본, 공간 등록 5단계) · compact: 가운데로 모아 단계 간 폭 고정 (호스트 등록 2단계) */
  spacing?: "fill" | "compact";
}

const StepIndicator = ({
  steps,
  currentStep,
  spacing = "fill",
}: StepIndicatorProps) => {
  const isCompact = spacing === "compact";

  return (
    // fill 모드의 좌우 여백(px-10)은 모바일에서 뺀다 — 360 폭에 5단계가 들어가야 해서
    // 40씩 잡아먹으면 원과 라벨이 겹친다
    <div
      className={`flex w-full items-start py-3 ${isCompact ? "justify-center" : "px-5 md:px-10"}`}
    >
      {steps.map((step, i) => (
        <div
          key={i}
          className={`flex items-start ${isCompact ? "" : "flex-1 last:flex-none"}`}
        >
          {/* 원 지름: 모바일 36 / md 이상 56. 원 안 숫자는 22 / 32 (피그마 title_b22).
              원↔라벨 간격 20은 3단 공통 */}
          <div className="flex flex-shrink-0 flex-col items-center gap-5">
            <div
              className={`flex size-9 items-center justify-center rounded-full text-[22px] font-bold transition-colors md:size-14 md:text-[32px] ${
                i < currentStep
                  ? "border-primary text-primary border-4"
                  : i === currentStep
                    ? "bg-primary text-white"
                    : "bg-divider text-white"
              } `}
            >
              {i < currentStep ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12L10 17L19 8"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {/* 라벨: 모바일 caption_b12(12/700) / md 이상 16 */}
            <span
              className={`text-center text-xs font-bold whitespace-nowrap md:text-base ${
                i < currentStep || i === currentStep
                  ? "text-text-primary"
                  : "text-text-tertiary"
              }`}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              // 점을 원의 세로 한가운데에 맞춘다 — 원 반지름 − 점 반지름.
              // 모바일 36/2 − 4/2 = 16, md 이상 56/2 − 8/2 = 24
              className={`mt-4 flex items-center justify-center gap-2 md:mt-6 ${isCompact ? "w-16" : "flex-1"}`}
            >
              {[0, 1].map((dot) => (
                <div
                  key={dot}
                  // 연결 점: 모바일 4 / md 이상 8
                  className={`size-1 rounded-full md:size-2 ${i < currentStep ? "bg-primary" : "bg-divider"}`}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
