const TOP_POSITION_CLASS = {
  "1/4": "top-1/4",
  "1/2": "top-1/2",
} as const;

export const ScrollButton = ({
  direction,
  position,
  onClick,
}: {
  direction: "prev" | "next";
  position: keyof typeof TOP_POSITION_CLASS;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "이전 공간 보기" : "다음 공간 보기"}
      onClick={onClick}
      className={`border-border absolute ${TOP_POSITION_CLASS[position]} ${
        direction === "prev" ? "-left-4" : "-right-4"
      } z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md border bg-white shadow-md`}
    >
      <span className="text-text-primary">
        {direction === "prev" ? "‹" : "›"}
      </span>
    </button>
  );
}