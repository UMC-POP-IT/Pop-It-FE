import { type ButtonHTMLAttributes } from "react";

type ButtonVariant =
  "primary" | "outline" | "danger" | "kakao" | "naver" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  outline: "border border-primary text-primary bg-white hover:bg-primary-light",
  danger: "border border-danger text-danger bg-white hover:bg-danger-light",
  kakao: "bg-kakao text-kakao-text",
  naver: "bg-naver text-naver-text",
  ghost: "bg-transparent text-text-secondary hover:bg-bg",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "w-full py-3 text-base rounded-xl",
};

const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) => (
  <button
    disabled={disabled}
    className={`font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"} ${className} `}
    {...props}
  >
    {children}
  </button>
);

export default Button;
