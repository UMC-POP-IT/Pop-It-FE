interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0부터 시작
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => (
  <div className="flex w-full items-start px-10 py-3">
    {steps.map((step, i) => (
      <div
        key={i}
        className="flex flex-1 items-start last:flex-none"
      >
        <div className="flex flex-shrink-0 flex-col items-center gap-5">
          <div
            className={`flex size-[56px] items-center justify-center rounded-full text-[32px] font-bold transition-colors ${
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
          <span
            className={`text-center text-base font-bold whitespace-nowrap ${
              i < currentStep || i === currentStep
                ? "text-text-primary"
                : "text-text-tertiary"
            }`}
          >
            {step}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className="mt-6 flex flex-1 items-center justify-center gap-2">
            {[0, 1].map((dot) => (
              <div
                key={dot}
                className={`size-2 rounded-full ${i < currentStep ? "bg-primary" : "bg-divider"}`}
              />
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);

export default StepIndicator;
