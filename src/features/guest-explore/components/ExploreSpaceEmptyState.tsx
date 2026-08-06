import Button from "@/shared/components/Button";

interface ExploreSpaceEmptyStateProps {
  /** 검색어·필터를 일괄 해제하고 재검색을 트리거한다. */
  onResetFilters: () => void;
}

const ExploreSpaceEmptyState = ({ onResetFilters }: ExploreSpaceEmptyStateProps) => {
  return (
    <div className="bg-tag-bg mt-6 flex h-[300px] w-full flex-col items-center justify-center gap-4 rounded-xl">
      <span className="text-text-primary text-lg font-medium">
        조건에 맞는 공간이 없어요
      </span>
      <Button variant="primary" size="sm" onClick={onResetFilters}>
        조건 초기화
      </Button>
    </div>
  );
};

export default ExploreSpaceEmptyState;
