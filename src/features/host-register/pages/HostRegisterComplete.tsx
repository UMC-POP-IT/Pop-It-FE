import Button from "@/shared/components/Button";

// 호스트 등록 완료 화면
// TODO: [호스트 홈으로] 클릭 시 호스트 홈으로 이동
export const HostRegisterComplete = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-6 text-center">
      {/* 완료 체크 아이콘 (아이콘 라이브러리 없어 인라인 SVG) */}
      <span className="text-primary">
        <CheckCircleIcon />
      </span>

      <h1 className="text-text-primary text-2xl font-bold">
        호스트 등록 완료!
      </h1>
      <p className="text-text-secondary text-sm">
        이제 공간을 등록하여 팝잇을 이용해보세요
      </p>

      <Button
        variant="primary"
        size="md"
      >
        호스트 홈으로
      </Button>
    </div>
  );
};

// 원형 체크 아이콘
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
    />
    <path d="m8 12 3 3 5-5" />
  </svg>
);
