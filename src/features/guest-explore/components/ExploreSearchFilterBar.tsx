import {
  SPACE_CATEGORY_OPTIONS,
  SEOUL_DISTRICTS,
  type SpaceCategory,
} from "@/features/guest-explore/api/space_search_api";

const CATEGORY_OPTIONS: { value: SpaceCategory | ""; label: string }[] = [
  { value: "", label: "전체" },
  ...SPACE_CATEGORY_OPTIONS,
];

const DISTRICT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "지역 전체" },
  ...SEOUL_DISTRICTS.map((district) => ({ value: district, label: district })),
];

interface ExploreSearchFilterBarProps {
  isMapView: boolean;
  onToggleMapView: () => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  category: SpaceCategory | "";
  onCategoryChange: (category: SpaceCategory | "") => void;
  district: string;
  onDistrictChange: (district: string) => void;
}

const dropdownClassName =
  "cursor-pointer appearance-none rounded-lg bg-tag-bg px-4 py-3 pr-9 text-lg text-text-primary hover:bg-tag-bg/80 focus:outline-none focus:ring-2 focus:ring-primary";

const ExploreSearchFilterBar = ({
  isMapView,
  onToggleMapView,
  keyword,
  onKeywordChange,
  category,
  onCategoryChange,
  district,
  onDistrictChange,
}: ExploreSearchFilterBarProps) => {
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
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="공간, 지역 이름, 정보로 검색"
          aria-label="공간, 지역 이름, 정보로 검색"
          className="bg-tag-bg text-text-secondary placeholder:text-text-secondary focus:ring-primary w-full rounded-lg py-3 pr-[10px] pl-11 text-lg focus:ring-2 focus:outline-none"
        />
      </div>

      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              aria-label="공간 용도 필터"
              value={category}
              onChange={(e) =>
                onCategoryChange(e.target.value as SpaceCategory | "")
              }
              className={dropdownClassName}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option
                  key={option.value || "all"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
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

          <div className="relative">
            <select
              aria-label="지역(구) 필터"
              value={district}
              onChange={(e) => onDistrictChange(e.target.value)}
              className={dropdownClassName}
            >
              {DISTRICT_OPTIONS.map((option) => (
                <option
                  key={option.value || "all"}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
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

          {/*
            "일 단위"(가격 단위 전환) 필터는 GET /api/v1/spaces 응답/파라미터에
            대응하는 값이 없어 이번 API 연동(#145) 범위에서 제외한다.
            디자인만 유지하고, 관련 API가 나오면 그때 연결한다.
          */}
          <button
            type="button"
            disabled
            className="bg-tag-bg text-text-primary flex cursor-not-allowed items-center justify-center gap-5 rounded-lg px-4 py-3 text-lg opacity-50"
          >
            <span>일 단위</span>
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
        </div>

        <button
          type="button"
          aria-pressed={isMapView}
          onClick={onToggleMapView}
          className={`flex items-center justify-center gap-[6px] rounded-full px-4 py-[10px] text-lg transition-colors ${
            isMapView
              ? "bg-primary text-white"
              : "bg-primary-light text-text-primary hover:bg-primary-light/80"
          }`}
        >
          <span>🗺</span>
          <span>지도</span>
        </button>
      </div>
    </div>
  );
};

export default ExploreSearchFilterBar;
