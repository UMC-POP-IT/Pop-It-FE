interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const Chip = ({ label, selected, onClick }: ChipProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
      selected
        ? "bg-primary border-primary text-white"
        : "border-border text-text-secondary bg-white hover:border-primary hover:text-primary"
    }`}
  >
    {label}
  </button>
);

export default Chip;
