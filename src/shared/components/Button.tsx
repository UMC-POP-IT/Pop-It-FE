import { type ButtonHTMLAttributes } from "react";

type ButtonVariant =
  "primary" | "outline" | "danger" | "kakao" | "naver" | "ghost" | "black" | "gray";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary-hover text-white hover:bg-primary",
  outline: "border border-primary text-primary bg-white hover:bg-primary-light",
  danger: "border border-danger text-danger bg-white hover:bg-danger-light",
  kakao: "bg-kakao text-kakao-text",
  naver: "bg-naver text-naver-text",
  ghost: "bg-transparent text-text-secondary hover:bg-bg",
  black: "bg-text-primary text-white hover:bg-gray-800",
  gray: "bg-tag-bg text-text-tertiary hover:bg-gray-200",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-6 text-base font-bold rounded-lg",
  md: "h-12 px-4 text-base font-bold rounded-lg",
  lg: "h-14 w-full text-lg font-medium rounded-lg",
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
    className={`flex items-center justify-center transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"} ${className} `}
    {...props}
  >
    {children}
  </button>
);

export default Button;
