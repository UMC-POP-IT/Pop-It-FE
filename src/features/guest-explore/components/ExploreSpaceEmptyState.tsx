import Button from "@/shared/components/Button";

interface ExploreSpaceEmptyStateProps {
  /** 검색어·필터를 일괄 해제하고 재검색을 트리거한다. */
  onResetFilters: () => void;
}

const ExploreSpaceEmptyState = ({ onResetFilters }: ExploreSpaceEmptyStateProps) => {
  return (
    <div className="bg-tag-bg mt-6 flex h-[300px] w-full flex-col items-center justify-center gap-4 rounded-xl px-4">
      <span className="text-text-primary text-center text-sm font-medium whitespace-pre-line md:text-lg">
        {"조건에 맞는 공간이 없습니다\n검색 조건을 변경해 다시 찾아보세요."}
      </span>
      <Button variant="primary" size="sm" onClick={onResetFilters}>
        조건 초기화
      </Button>
    </div>
  );
};

export default ExploreSpaceEmptyState;
