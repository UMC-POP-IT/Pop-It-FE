import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, className = "", ...props }: InputProps) => (
  <div className="flex w-full flex-col gap-1">
    {label && (
      <label className="text-text-primary text-sm font-medium">{label}</label>
    )}
    <input
      className={`text-text-primary placeholder:text-text-placeholder h-14 w-full rounded-lg border-2 bg-white px-5 text-lg transition-colors focus:outline-none focus:ring-2 ${error ? "border-danger focus:ring-danger" : "border-divider focus:border-primary focus:ring-primary"} ${props.disabled ? "bg-bg cursor-not-allowed opacity-40" : ""} ${className} `}
      {...props}
    />
    {error && <span className="text-danger text-xs">{error}</span>}
  </div>
);

export default Input;
