import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";

// 5단계 전체 라벨 (칸반보드 플로우 기준 순서)
const STEPS = ["위치/구조", "거래정보", "공간정보", "상세정보", "사진등록"];

// 드롭다운 선택지 (Mock — API 연동 전 임시값)
const OWNER_TYPES = ["임대인", "임차인", "위탁 관리인"];
const BUILDING_TYPES = [
  "대형 사무실",
  "중소형 사무실",
  "오피스텔 방",
  "단지 내 상가",
  "일반 상가",
  "팝업 상가",
];

export const RegisterStep1 = () => {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6">
      {/* 상단 진행바 (공통 컴포넌트) — 0 = 첫 단계 */}
      <StepIndicator
        steps={STEPS}
        currentStep={0}
      />

      {/* 화면 제목 */}
      <div>
        <h1 className="text-text-primary text-xl font-bold">공간 등록</h1>
        <p className="text-text-secondary mt-1 text-sm">
          1단계 · 위치와 구조 정보를 입력해주세요.
        </p>
      </div>

      {/* 입력 폼 (정적 — RHF 로직은 이후 단계에서 연결) */}
      <div className="flex flex-col gap-4">
        {/* 등록자 유형 (드롭다운)
            ⚠️ 공통 Select 컴포넌트가 없어서 임시 native <select> 사용.
            추후 챈(4번)에게 공통 Select 필요 여부 공유 예정 */}
        <label className="flex w-full flex-col gap-1">
          <span className="text-text-primary text-sm font-medium">
            등록자 유형
          </span>
          <select
            className="text-text-primary border-border focus:border-primary w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-colors focus:outline-none"
            defaultValue=""
          >
            <option
              value=""
              disabled
            >
              등록자 유형을 선택하세요
            </option>
            {OWNER_TYPES.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>
        </label>

        {/* 건물 유형 (드롭다운) */}
        <label className="flex w-full flex-col gap-1">
          <span className="text-text-primary text-sm font-medium">
            건물 유형
          </span>
          <select
            className="text-text-primary border-border focus:border-primary w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-colors focus:outline-none"
            defaultValue=""
          >
            <option
              value=""
              disabled
            >
              건물 유형을 선택하세요
            </option>
            {BUILDING_TYPES.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>
        </label>

        {/* 시 / 구 (한 줄에 나란히) */}
        <div className="flex gap-3">
          <Input
            label="시"
            placeholder="예: 서울특별시"
          />
          <Input
            label="구"
            placeholder="예: 마포구"
          />
        </div>

        {/* 주소 / 상세주소 */}
        <Input
          label="주소"
          placeholder="도로명 주소를 입력하세요"
        />
        <Input
          label="상세주소"
          placeholder="동/호수 등 상세주소"
        />
      </div>

      {/* 하단 다음 버튼 (전체 너비)
          TODO: 다음 단계(Step2) 라우팅은 스텝 네비게이션 붙일 때 연결 */}
      <Button
        variant="primary"
        size="lg"
      >
        다음
      </Button>
    </div>
  );
};
