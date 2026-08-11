type BadgeVariant = "success" | "pending" | "category" | "highlight";

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-badge-success-bg text-badge-success-text",
  pending: "bg-badge-pending-bg text-badge-pending-text",
  category: "bg-black/50 text-white",
  highlight: "bg-primary-light text-primary",
};

const Badge = ({ variant, label, className = "" }: BadgeProps) => (
  <span
    className={`px-2 py-0.5 text-xs font-medium ${variantStyles[variant]} ${
      /* highlight(AI 추천 이유), category(팝업스토어, 카페.... 등) 일때는 rounded 덜 되게끔 조절 & 내용 초과하면 ...으로 대체되게끔 */
      variant === "highlight" || variant === "category"
        ? "inline-block max-w-full truncate align-bottom rounded-md"
        : "inline-flex items-center rounded-full"
    } ${className}`}
  >
    {label}
  </span>
);

export default Badge;
