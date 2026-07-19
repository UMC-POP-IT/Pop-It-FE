const FILTER_LABELS = ["전체", "지역", "일 단위"];

const ExploreSearchFilterBar = () => {
  return (
    <div className="flex w-full items-center justify-between gap-6">
      <div className="relative w-[589px] shrink-0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-[10px] -translate-y-1/2 text-[#808080]"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M21 21L16.65 16.65"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="공간, 지역 이름, 정보로 검색"
          aria-label="공간, 지역 이름, 정보로 검색"
          className="w-full rounded-lg bg-tag-bg py-3 pr-[10px] pl-11 text-lg text-text-secondary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          {FILTER_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              className="flex items-center justify-center gap-5 rounded-lg bg-tag-bg px-4 py-3 text-lg text-text-primary hover:bg-tag-bg/80"
            >
              <span>{label}</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-[6px] rounded-full bg-primary-light px-4 py-[10px] text-lg text-text-primary hover:bg-primary-light/80"
        >
          <span>🗺</span>
          <span>지도</span>
        </button>
      </div>
    </div>
  );
};

export default ExploreSearchFilterBar;