type BadgeVariant = "success" | "pending" | "category";

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-badge-success-bg text-badge-success-text",
  pending: "bg-badge-pending-bg text-badge-pending-text",
  category: "bg-black/50 text-white",
};

const Badge = ({ variant, label }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantStyles[variant]} `}
  >
    {label}
  </span>
);

export default Badge;
