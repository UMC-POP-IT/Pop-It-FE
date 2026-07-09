import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";

// 5단계 진행바 라벨 (피그마 기준)
const STEPS = ["위치/구조", "거래 정보", "공간 정보", "상세 정보", "사진 등록"];

// 건물 유형 칩 선택지 (피그마 기준)
const BUILDING_TYPES = [
  "대형 사무실",
  "중소형 사무실",
  "오피스텔 형",
  "단지내 상가",
  "일반 상가",
  "복합 상가",
];

// 구 드롭다운 선택지 (Mock — API 연동 전 임시값)
const DISTRICTS = [
  "강남구",
  "강동구",
  "마포구",
  "서초구",
  "송파구",
  "영등포구",
  "종로구",
  "중구",
];

export const RegisterStep1 = () => {
  // 정적 화면: 선택된 값 표시용 하드코딩 (실제 선택 로직은 이후 RHF로 연결)
  const selectedBuilding = "대형 사무실";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-2xl font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 (공통 컴포넌트) — 0 = 첫 단계 */}
      <StepIndicator
        steps={STEPS}
        currentStep={0}
      />

      {/* 섹션: 위치/구조 */}
      <div className="flex flex-col gap-6">
        <h2 className="text-text-primary border-border border-b pb-2 text-lg font-bold">
          위치/구조
        </h2>

        {/* 등록자 유형 — 원형 아이콘 + 라벨
            ⚠️ 공통 컴포넌트 없어 임시 구현 → 챈(4번)과 협의 예정 */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-bold">
            등록자 유형
          </span>
          <div className="flex w-fit flex-col items-center gap-1">
            <button
              type="button"
              className="bg-tag-bg text-text-secondary flex h-16 w-16 items-center justify-center rounded-full"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </button>
            <span className="text-text-secondary text-xs">소유자</span>
          </div>
        </div>

        {/* 건물 유형 — 칩 버튼 (여러 개 중 택1)
            공통 Chip으로 수정 완료 */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-bold">건물 유형</span>
          <div className="flex flex-wrap gap-2">
            {BUILDING_TYPES.map((type) => {
              const isSelected = type === selectedBuilding;
              return (
                <button
                  key={type}
                  type="button"
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-primary text-primary font-medium"
                      : "border-border text-text-secondary"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* 주소 */}
        <div className="flex flex-col gap-3">
          <span className="text-text-primary text-sm font-bold">주소</span>

          {/* 시 / 구 (한 줄) */}
          <div className="flex gap-3">
            <Input
              label="시"
              placeholder="서울특별시"
            />

            {/* 구 — 드롭다운
                ⚠️ 공통 Select 없어 임시 native <select> → 챈(4번)이 추후 추가 예정 */}
            <label className="flex w-full flex-col gap-1">
              <span className="text-text-primary text-sm font-medium">구</span>
              <select
                className="text-text-primary border-border focus:border-primary w-full rounded-lg border bg-white px-4 py-2.5 text-sm transition-colors focus:outline-none"
                defaultValue=""
              >
                <option
                  value=""
                  disabled
                >
                  구 선택
                </option>
                {DISTRICTS.map((district) => (
                  <option
                    key={district}
                    value={district}
                  >
                    {district}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* 주소 입력 + 주소 찾기 버튼*/}

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input placeholder="주소" />
            </div>
            <Button
              variant="black"
              size="md"
            >
              주소 찾기
            </Button>
          </div>

          {/* 상세 주소 */}
          <Input placeholder="상세 주소를 입력해주세요" />
        </div>
      </div>

      {/* 다음으로 버튼 (우측 정렬)
          정적: 초기 비활성(회색) 상태로 표시.
          TODO: 필수항목 유효성 검사 통과 시 활성화 + Step2 라우팅 (RHF 붙일 때) */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          disabled
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
