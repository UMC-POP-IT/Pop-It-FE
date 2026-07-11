interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0부터 시작
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => (
  <div className="flex w-full items-start px-4 py-3">
    {steps.map((step, i) => (
      <div
        key={i}
        className="flex flex-1 items-start last:flex-none"
      >
        <div className="flex flex-shrink-0 flex-col items-center gap-5">
          <div
            className={`flex size-[56px] items-center justify-center rounded-full text-[32px] font-bold transition-colors ${
              i < currentStep
                ? "border-4 border-primary text-primary"
                : i === currentStep
                  ? "bg-primary text-white"
                  : "bg-border text-text-secondary"
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
          <span className="text-text-primary text-center text-base font-bold whitespace-nowrap">
            {step}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`mx-1 mt-7 h-0.5 flex-1 ${i < currentStep ? "bg-primary" : "bg-border"} `}
          />
        )}
      </div>
    ))}
  </div>
);

export default StepIndicator;
