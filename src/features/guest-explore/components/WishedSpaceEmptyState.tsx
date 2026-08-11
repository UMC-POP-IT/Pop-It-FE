import Button from "@/shared/components/Button";

const WishedSpaceEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-tag-bg size-full rounded-lg px-4 py-8">
      <div className="flex flex-col items-center">
        <span className="text-md">아직 찜한 공간이 없어요</span>
        <span className="text-md">관심 있는 공간을 찜해보세요!</span>
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={() => window.location.href = "/"}
        className="w-full max-w-sm"
      >
        공간 둘러보기
      </Button>
    </div>
  );
}

export default WishedSpaceEmptyState;