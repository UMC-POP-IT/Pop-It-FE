import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import { useState } from "react";
import Chip from "@/shared/components/Chip";
import { useNavigate } from "react-router-dom";
import {
  STEPS,
  USAGE_OPTIONS,
  STRUCTURE_OPTIONS,
  FLOOR_TYPE_OPTIONS,
  HEATING_OPTIONS,
  SECURITY_OPTIONS,
  ETC_OPTIONS,
} from "@/features/host-register/api/mock_register";

export const RegisterStep3 = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-2xl font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 — 2 = 세 번째 단계(공간 정보) */}
      <StepIndicator
        steps={STEPS}
        currentStep={2}
      />

      {/* 섹션: 공간 정보 */}
      <div className="flex flex-col gap-6">
        <h2 className="text-text-primary border-border border-b pb-2 text-lg font-bold">
          공간 정보
        </h2>

        {/* 기본 정보 / 공간 구조 (택1) */}
        <ChipGroup
          label="기본 정보"
          options={USAGE_OPTIONS}
          selected={["팝업스토어"]}
        />
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
              <Input
                type="number"
                placeholder="전용 면적"
              />
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
          <Input
            type="number"
            placeholder="층수 입력"
          />
          <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
            층
          </span>
        </div>

        {/* 주차 — 주차 가능 / 주차 불가능 (택1)*/}
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
          multiple
        />
        <ChipGroup
          label="보안"
          options={SECURITY_OPTIONS}
          selected={["현관 보안"]}
          multiple
        />
        <ChipGroup
          label="기타"
          options={ETC_OPTIONS}
          selected={["화재 경보기"]}
          multiple
        />
      </div>

      {/* 이전 / 다음으로 (다음으로는 초기 비활성) */}
      <div className="flex justify-end gap-2">
        <Button
          variant="gray"
          onClick={() => navigate("/host/register/step2")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/host/register/step4")}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};

// 칩 그룹 (공통 Chip · 택1/다중)
// 정적: selected로 선택 상태만 표시. 실제 선택/해제 로직은 이후 RHF로 연결
const ChipGroup = ({
  label,
  options,
  selected,
  multiple = false,
}: {
  label: string;
  options: string[];
  selected: string[];
  multiple?: boolean;
}) => {
  const [selectedList, setSelectedList] = useState<string[]>(selected);

  const toggle = (option: string) => {
    setSelectedList((prev) =>
      multiple
        ? prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option]
        : [option],
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-text-primary text-sm font-bold">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={selectedList.includes(option)}
            onClick={() => toggle(option)}
          />
        ))}
      </div>
    </div>
  );
};
