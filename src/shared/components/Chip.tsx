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
    className={`flex h-14 w-[184px] shrink-0 items-center justify-center rounded-lg border-[2.5px] bg-white px-5 text-lg whitespace-nowrap transition-colors ${
      selected
        ? "border-primary-hover text-primary-hover font-bold"
        : "border-divider text-text-placeholder hover:border-primary-hover hover:text-primary-hover font-medium"
    }`}
  >
    {label}
  </button>
);

export default Chip;
