import {
  SPACE_CATEGORY_OPTIONS,
  SEOUL_DISTRICTS,
  type SpaceCategory,
} from "@/features/guest-explore/api/space_search_api";
import FilterDropdown from "./FilterDropdown";

// "전체"(선택 해제) 옵션은 항상 맨 위에 고정하고, 나머지만 가나다순으로 정렬한다.
const byKoreanLabel = <T extends { label: string }>(a: T, b: T) =>
  a.label.localeCompare(b.label, "ko");

const CATEGORY_OPTIONS: { value: SpaceCategory | ""; label: string }[] = [
  { value: "", label: "전체" },
  ...[...SPACE_CATEGORY_OPTIONS].sort(byKoreanLabel),
];

const DISTRICT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "지역 전체" },
  ...SEOUL_DISTRICTS.map((district) => ({ value: district, label: district })).sort(
    byKoreanLabel,
  ),
];

// [지역] 드롭다운은 25개 구 + 전체라 한 화면에 다 안 들어온다. 다른 드롭다운과
// 같은 높이(6줄)만 보여주고 나머지는 스크롤로 접근하게 한다.
const DISTRICT_MAX_VISIBLE_OPTIONS = 6;

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
          <FilterDropdown
            ariaLabel="공간 용도 필터"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={onCategoryChange}
          />

          <FilterDropdown
            ariaLabel="지역(구) 필터"
            options={DISTRICT_OPTIONS}
            value={district}
            onChange={onDistrictChange}
            maxVisibleOptions={DISTRICT_MAX_VISIBLE_OPTIONS}
          />
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M11.5334 5.26611C11.6648 5.23524 11.8043 5.25006 11.9276 5.31169L17.5 8.09733L23.0724 5.31169C23.2531 5.22134 23.4679 5.23069 23.6398 5.33675C23.8118 5.44304 23.9167 5.63133 23.9167 5.8335V20.4168C23.9167 20.6378 23.7919 20.8398 23.5942 20.9386L17.7609 23.8553C17.5967 23.9374 17.4033 23.9374 17.2391 23.8553L11.6667 21.0685L6.09424 23.8553C5.91355 23.9457 5.69877 23.9363 5.52686 23.8302C5.35488 23.724 5.25 23.5357 5.25 23.3335V8.75016C5.25 8.52921 5.3748 8.32717 5.57243 8.22835L11.4058 5.31169L11.5334 5.26611ZM6.41667 9.11019V22.389L11.0833 20.0557V6.77686L6.41667 9.11019ZM12.25 20.0557L16.9167 22.389V9.11019L12.25 6.77686V20.0557ZM18.0833 9.11019V22.389L22.75 20.0557V6.77686L18.0833 9.11019Z"
              fill="currentColor"
            />
          </svg>
          <span>지도</span>
        </button>
      </div>
    </div>
  );
};

export default ExploreSearchFilterBar;
