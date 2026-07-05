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
        <div className="flex flex-shrink-0 flex-col items-center gap-1">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${i <= currentStep ? "bg-primary text-white" : "bg-border text-text-secondary"} `}
          >
            {i + 1}
          </div>
          <span
            className={`text-center text-xs whitespace-nowrap ${i === currentStep ? "text-primary font-medium" : "text-text-secondary"} `}
          >
            {step}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`mx-1 mt-3.5 h-0.5 flex-1 ${i < currentStep ? "bg-primary" : "bg-border"} `}
          />
        )}
      </div>
    ))}
  </div>
);

export default StepIndicator;
