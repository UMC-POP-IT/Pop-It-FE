import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";

const FILTER_LABELS = ["전체", "지역", "일 단위"];

const ExploreSearchFilterBar = () => {
  return (
    <div className="flex h-[49px] w-full items-center justify-between gap-6">
      <div className="w-[589px] shrink-0">
        <Input
          placeholder="공간, 지역 이름, 정보로 검색"
          className="h-[49px] rounded bg-[#F2F2F2] border-none px-10 text-sm placeholder:text-[#808080]"
        />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {FILTER_LABELS.map((label) => (
          <button
            key={label}
            type="button"
            className="flex h-[49px] min-w-[108px] items-center justify-center gap-3 rounded bg-[#F2F2F2] px-4 text-sm font-medium text-[#121212]"
          >
            <span>{label}</span>
            <span className="text-base leading-none">⌄</span>
          </button>
        ))}

        <Button
          type="button"
          variant="ghost"
          className="flex h-12 min-w-[98px] items-center justify-center gap-2 rounded-full bg-[#E6F0FE] px-4 text-sm font-medium text-[#121212] hover:bg-[#E6F0FE]"
        >
          <span>🗺</span>
          <span>지도</span>
        </Button>
      </div>
    </div>
  );
};

export default ExploreSearchFilterBar;