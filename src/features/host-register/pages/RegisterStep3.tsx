import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";

// 5단계 진행바 라벨
const STEPS = ["위치/구조", "거래 정보", "공간 정보", "상세 정보", "사진 등록"];

// 칩 그룹 선택지 
const USAGE_OPTIONS = ["팝업스토어", "전시/갤러리", "복합공간", "쇼룸", "카페/F&B"]; // 기본 정보(택1)
const STRUCTURE_OPTIONS = ["오픈형 홀", "가벽 분리형", "룸 분리형"]; // 공간 구조(택1)
const FLOOR_TYPE_OPTIONS = ["일반 층", "반지층", "지하", "옥탑"]; // 층수 유형(택1)
const HEATING_OPTIONS = [
  "개별 난방",
  "중앙 난방",
  "지역 난방",
  "벽걸이 에어컨",
  "스탠드 에어컨",
  "천장 에어컨",
]; // 냉난방(다중)
const SECURITY_OPTIONS = [
  "현관 보안",
  "CCTV",
  "방범창",
  "카드키",
  "자체 경비원",
  "사설 경비",
]; // 보안(다중)
const ETC_OPTIONS = ["화재 경보기", "소화기", "WIFI", "화장실"]; // 기타(다중)

export const RegisterStep3 = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-2xl font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 — 2 = 세 번째 단계(공간 정보) */}
      <StepIndicator steps={STEPS} currentStep={2} />

      {/* 섹션: 공간 정보 */}
      <div className="flex flex-col gap-6">
        <h2 className="text-text-primary border-border border-b pb-2 text-lg font-bold">
          공간 정보
        </h2>

        {/* 기본 정보 / 공간 구조 (택1) */}
        <ChipGroup label="기본 정보" options={USAGE_OPTIONS} selected={["팝업스토어"]} />
        <ChipGroup
          label="공간 정보"
          options={STRUCTURE_OPTIONS}
          selected={["오픈형 홀"]}
        />

        {/* 면적 — ㎡ = 평 (자동 환산은 이후 로직) */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-bold">면적</span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input type="number" placeholder="전용 면적" />
              <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
                ㎡
              </span>
            </div>
            <span className="text-text-secondary">=</span>
            <div className="relative flex-1">
              <Input type="number" />
              <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
                평
              </span>
            </div>
          </div>
          <span className="text-text-disabled text-xs">
            ㎡ 입력 시 평이 자동 계산돼요
          </span>
        </div>

        {/* 층수 유형(택1) + 상세 층수 입력 */}
        <ChipGroup
          label="층수"
          options={FLOOR_TYPE_OPTIONS}
          selected={["일반 층"]}
        />
        <div className="relative">
          <Input type="number" placeholder="층수 입력" />
          <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
            층
          </span>
        </div>

        {/* 주차 — 주차 가능 / 주차 불가능 (택1)
            ⚠️ 피그마 '주차 가능' 칩에 날짜(2026.06.24)가 들어가 있음 → 의도인지 디자인 확인 필요.
            일단 데이터 모델(hasParking boolean) 기준 가능/불가 칩으로 구현 */}
        <ChipGroup
          label="주차"
          options={["주차 가능", "주차 불가능"]}
          selected={["주차 가능"]}
        />

        {/* 시설 정보 (다중 선택) */}
        <span className="text-text-primary text-sm font-bold">시설 정보</span>
        <ChipGroup
          label="냉난방"
          options={HEATING_OPTIONS}
          selected={["개별 난방"]}
        />
        <ChipGroup label="보안" options={SECURITY_OPTIONS} selected={["현관 보안"]} />
        <ChipGroup label="기타" options={ETC_OPTIONS} selected={["화재 경보기"]} />
      </div>

      {/* 이전 / 다음으로 (다음으로는 초기 비활성) */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="md">
          이전
        </Button>
        <Button variant="primary" size="md" disabled>
          다음으로
        </Button>
      </div>
    </div>
  );
};

// 칩 그룹 (선택 버튼 묶음)
// 공통 Chip 컴포넌트 없어 임시 로컬 구현 → 챈(4번)과 협의 예정
// 정적: selected로 선택 상태만 표시. 실제 선택/해제 로직은 이후 RHF로 연결
const ChipGroup = ({
  label,
  options,
  selected,
}: {
  label: string;
  options: string[];
  selected: string[];
}) => (
  <div className="flex flex-col gap-2">
    <span className="text-text-primary text-sm font-bold">{label}</span>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              isSelected
                ? "border-primary text-primary font-medium"
                : "border-border text-text-secondary"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);
