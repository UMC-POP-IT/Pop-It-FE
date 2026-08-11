import { type ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "primary"
  | "outline"
  | "danger"
  | "kakao"
  | "google"
  | "ghost"
  | "black"
  | "gray"
  | "cancel"
  | "secondary";
type ButtonSize = "sm" | "md" | "lg" | "nav" | "field";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary-hover text-white hover:bg-primary",
  outline: "border border-primary text-primary bg-white hover:bg-primary-light",
  danger: "border border-danger text-danger bg-white hover:bg-danger-light",
  kakao: "bg-kakao text-kakao-text hover:bg-[#fdd800]",
  google:
    "bg-google text-google-text border border-google-border hover:bg-[#f8f9fa]",
  ghost: "bg-transparent text-text-secondary hover:bg-bg",
  black: "bg-text-primary text-white hover:bg-gray-800",
  gray: "bg-tag-bg text-text-tertiary hover:bg-gray-200",
  cancel: "bg-[#fff3f3] text-danger hover:bg-danger-light",
  secondary: "bg-surface-blue text-text-primary hover:bg-primary-light",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-6 text-base font-bold rounded-lg",
  md: "h-12 px-4 text-base font-bold rounded-lg",
  lg: "h-14 w-full text-lg font-medium rounded-lg",
  // 하단 내비게이션 버튼 (이전/다음으로) — 피그마 데스크톱·태블릿 184×56, 모바일 156×56, 18px/700
  nav: "h-14 w-[156px] md:w-[184px] text-lg font-bold rounded-lg",
  // 입력창 옆에 붙는 인라인 버튼 (주소 찾기) — 데스크톱·태블릿 184×56, 모바일 156×56, 20px/700
  field: "h-14 w-[156px] md:w-[184px] text-xl font-bold rounded-lg",
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
