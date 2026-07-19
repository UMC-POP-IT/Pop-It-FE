import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import Chip from "@/shared/components/Chip";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";
import { STEPS } from "@/features/host-register/api/mock_register";

// 칩 그룹 선택지
const USAGE_OPTIONS = [
  "팝업스토어",
  "전시/갤러리",
  "복합공간",
  "쇼룸",
  "카페/F&B",
]; // 기본 정보(택1)
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
  const navigate = useNavigate();
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);
  return (
    <div className="mx-auto flex w-full max-w-[794px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 — 2 = 세 번째 단계(공간 정보) */}
      <StepIndicator
        steps={STEPS}
        currentStep={2}
      />

      {/* 섹션: 공간 정보 */}
      <div className="flex flex-col gap-6">
        <h2 className="text-text-primary border-border border-b pb-2 text-[28px] font-bold">
          공간 정보
        </h2>

        {/* 기본 정보 / 공간 구조 (택1) */}
        <ChipGroup
          label="기본 정보"
          options={USAGE_OPTIONS}
          selected={form.usage ? [form.usage] : []}
          onChange={(next) => setValues({ usage: next[0] ?? "" })}
        />
        <ChipGroup
          label="공간 정보"
          options={STRUCTURE_OPTIONS}
          selected={form.spaceStructure ? [form.spaceStructure] : []}
          onChange={(next) => setValues({ spaceStructure: next[0] ?? "" })}
        />

        {/* 면적 — ㎡ 입력 시 평 자동 환산 (평은 읽기 전용·파생값이라 store 저장 X) */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-[22px] font-bold">면적</span>
          <span className="text-text-tertiary text-xl font-bold">
            전용 면적
          </span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={form.area}
                onChange={(e) => setValues({ area: e.target.value })}
                className="text-text-primary placeholder:text-text-secondary h-14 w-full rounded-lg bg-[#F2F2F2] px-5 text-right text-lg font-medium transition-colors focus:outline-none"
              />
              <span className="text-text-secondary pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-lg font-medium">
                ㎡
              </span>
            </div>
            <span className="text-text-secondary text-2xl">=</span>
            <div className="relative flex-1">
              {/* 평 = ㎡ × 0.3025 (자동 계산, 읽기 전용) */}
              <input
                type="number"
                readOnly
                value={form.area ? (Number(form.area) * 0.3025).toFixed(1) : ""}
                className="text-text-primary placeholder:text-text-secondary h-14 w-full rounded-lg bg-[#F2F2F2] px-5 text-right text-lg font-medium transition-colors focus:outline-none"
              />
              <span className="text-text-secondary pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-lg font-medium">
                평
              </span>
            </div>
          </div>
          <span className="text-text-placeholder text-base font-bold">
            ㎡ 입력 시 평이 자동 계산돼요
          </span>
        </div>

        {/* 층수 유형(택1) + 상세 층수 입력 */}
        <ChipGroup
          label="층수"
          options={FLOOR_TYPE_OPTIONS}
          selected={form.floorType ? [form.floorType] : []}
          onChange={(next) => setValues({ floorType: next[0] ?? "" })}
        />
        <div className="relative">
          <Input
            type="number"
            placeholder="층수 입력"
            value={form.floor}
            onChange={(e) => setValues({ floor: e.target.value })}
          />
          <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-medium">
            층
          </span>
        </div>

        {/* 주차 — 주차 가능 / 주차 불가능 (택1)*/}
        <ChipGroup
          label="주차"
          options={["주차 가능", "주차 불가능"]}
          selected={
            form.hasParking === true
              ? ["주차 가능"]
              : form.hasParking === false
                ? ["주차 불가능"]
                : []
          }
          onChange={(next) =>
            setValues({ hasParking: next[0] === "주차 가능" })
          }
        />

        {/* 시설 정보 (다중 선택) */}
        <span className="text-text-primary text-[22px] font-bold">
          시설 정보
        </span>
        <ChipGroup
          label="냉난방"
          options={HEATING_OPTIONS}
          selected={form.heatingList}
          onChange={(next) => setValues({ heatingList: next })}
          multiple
          labelVariant="secondary"
        />
        <ChipGroup
          label="보안"
          options={SECURITY_OPTIONS}
          selected={form.securityList}
          onChange={(next) => setValues({ securityList: next })}
          multiple
          labelVariant="secondary"
        />
        <ChipGroup
          label="기타"
          options={ETC_OPTIONS}
          selected={form.etcList}
          onChange={(next) => setValues({ etcList: next })}
          multiple
          labelVariant="secondary"
        />
      </div>

      {/* 이전 / 다음으로 (다음으로는 초기 비활성) */}
      <div className="flex justify-end gap-2">
        <Button
          variant="gray"
          size="nav"
          onClick={() => navigate("/host/register/step2")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="nav"
          onClick={() => navigate("/host/register/step4")}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};

// 칩 그룹 (공통 Chip · 택1/다중) — 선택값은 부모(store)가 관리 (controlled)
const ChipGroup = ({
  label,
  options,
  selected,
  onChange,
  multiple = false,
  labelVariant = "primary",
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  /** primary: 22px 검정 (상위 그룹) · secondary: 20px 회색 (하위 그룹, 예: 시설 정보 하위의 냉난방/보안/기타) */
  labelVariant?: "primary" | "secondary";
}) => {
  const toggle = (option: string) => {
    const next = multiple
      ? selected.includes(option)
        ? selected.filter((item) => item !== option) // 이미 있으면 제거
        : [...selected, option] // 없으면 추가
      : [option]; // 택1: 이거 하나로 교체
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <span
        className={
          labelVariant === "secondary"
            ? "text-text-tertiary text-xl font-bold"
            : "text-text-primary text-[22px] font-bold"
        }
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={selected.includes(option)}
            onClick={() => toggle(option)}
          />
        ))}
      </div>
    </div>
  );
};
