import { type InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, className = "", ...props }: InputProps) => {
  // 오류 문구와 입력칸을 잇는 id — 한 화면에 Input이 여러 개여도 안 겹친다
  const errorId = useId();

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label className="text-text-primary text-sm font-medium">{label}</label>
      )}
      <input
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`text-text-primary placeholder:text-text-placeholder h-14 w-full rounded-lg border bg-white px-5 text-lg font-medium transition-colors focus:ring-2 focus:outline-none ${error ? "border-danger focus:ring-danger" : "border-divider focus:border-primary focus:ring-primary"} ${props.disabled ? "bg-bg cursor-not-allowed opacity-40" : ""} ${className} `}
        {...props}
      />
      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-danger text-right text-base font-bold"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;