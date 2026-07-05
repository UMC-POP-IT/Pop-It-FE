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
      className={`text-text-primary placeholder:text-text-disabled focus:border-primary w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-colors focus:outline-none ${error ? "border-danger" : "border-border"} ${props.disabled ? "bg-bg cursor-not-allowed opacity-40" : ""} ${className} `}
      {...props}
    />
    {error && <span className="text-danger text-xs">{error}</span>}
  </div>
);

export default Input;
