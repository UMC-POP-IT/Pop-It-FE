import { type SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Select = ({ options, value, onChange, placeholder, disabled, className = "", ...props }: SelectProps) => (
  <div className="relative w-full">
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`border-divider h-14 w-full appearance-none rounded-lg border-2 bg-white px-5 text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      } ${value ? "text-text-primary" : "text-text-placeholder"} ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export default Select;
