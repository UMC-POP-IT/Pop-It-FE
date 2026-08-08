import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import Chip from "@/shared/components/Chip";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";
import {
  STEPS,
  USAGE_OPTIONS,
  STRUCTURE_OPTIONS,
  FLOOR_TYPE_OPTIONS,
} from "@/features/host-register/api/mock_register";
import { NO_SPINNER, blockNonNumeric } from "@/shared/utils/numberInput";
import { useEffect, useState } from "react";
import { getFacilities } from "@/features/host-register/api/facility_api";
import type {
  FacilityCategory,
  FacilityCategoryGroup,
} from "@/features/host-register/api/facility_api";
import FacilityChipGroup from "@/features/host-register/components/FacilityChipGroup";

// 서버 카테고리 → 화면 라벨 (서버는 영어 enum, 화면은 한글)
const FACILITY_CATEGORY_LABEL: Record<FacilityCategory, string> = {
  HEATING_COOLING: "냉난방",
  SECURITY: "보안",
  ETC: "기타",
};

export const RegisterStep3 = () => {
  const isEdit = useRegisterStore((s) => s.isEdit);
  const navigate = useNavigate();
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);
  // 시설 목록 (서버에서 받아옴)
  const [facilityGroups, setFacilityGroups] = useState<FacilityCategoryGroup[]>(
    [],
  );

  const [isFacilityLoading, setIsFacilityLoading] = useState(true);
  const [facilityError, setFacilityError] = useState(false);

  useEffect(() => {
    getFacilities()
      .then((data) => setFacilityGroups(data.facilities))
      .catch((err: unknown) => {
        // 에러 객체 전체를 찍으면 요청 정보(토큰 등)까지 노출될 수 있어 메시지만 남긴다
        const message = err instanceof Error ? err.message : "알 수 없는 오류";
        console.error("시설 목록 조회 실패:", message);
        setFacilityError(true);
      })
      .finally(() => setIsFacilityLoading(false));
  }, []);

  // 시설 선택 토글 — 이미 있으면 빼고, 없으면 넣는다
  const toggleFacility = (facilityId: number) =>
    setValues({
      facilityIds: form.facilityIds.includes(facilityId)
        ? form.facilityIds.filter((id) => id !== facilityId)
        : [...form.facilityIds, facilityId],
    });

  //반지층, 옥탑은 '몇 층' 숫자가 없어 층수 입력칸을 숨긴다
  const needsFloorNumber =
    form.floorType !== "반지층" && form.floorType !== "옥탑";

  const isValid =
    form.usage !== "" &&
    form.spaceStructure !== "" &&
    form.area !== "" &&
    form.floorType !== "" &&
    (!needsFloorNumber || form.floor !== "") &&
    form.hasParking !== null;

  return (
    <div className="mx-auto flex w-full max-w-[826px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        {isEdit ? "공간 수정" : "공간 등록"}
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
                aria-label="전용 면적 (제곱미터)"
                value={form.area}
                onChange={(e) => setValues({ area: e.target.value })}
                className="text-text-primary placeholder:text-text-secondary h-14 w-full [appearance:textfield] rounded-lg bg-[#F2F2F2] pr-12 pl-5 text-right text-lg font-medium transition-colors focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                aria-label="평 환산 (자동 계산)"
                value={
                  form.area !== ""
                    ? (Number(form.area) * 0.3025).toFixed(1)
                    : ""
                }
                readOnly
                className="text-text-primary placeholder:text-text-secondary h-14 w-full [appearance:textfield] rounded-lg bg-[#F2F2F2] pr-12 pl-5 text-right text-lg font-medium transition-colors focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="text-text-secondary pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-lg font-medium">
                평
              </span>
            </div>
          </div>
          <span className="text-text-secondary text-right text-base font-medium">
            ㎡ 입력 시 평이 자동 계산돼요
          </span>
        </div>

        {/* 층수 유형(택1) + 상세 층수 입력 */}
        <ChipGroup
          label="층수"
          options={FLOOR_TYPE_OPTIONS}
          selected={form.floorType ? [form.floorType] : []}
          onChange={(next) => {
            const floorType = next[0] ?? "";
            const hidesFloor = floorType === "반지층" || floorType === "옥탑";
            setValues({
              floorType,
              floor: hidesFloor ? "" : form.floor,
            });
          }}
        />

        {needsFloorNumber && (
          <div className="relative">
            <Input
              type="number"
              aria-label="층수"
              placeholder="층수 입력"
              value={form.floor}
              onChange={(e) =>
                setValues({ floor: e.target.value.replace(/[^0-9]/g, "") })
              }
              onKeyDown={blockNonNumeric}
              className={NO_SPINNER}
            />
            <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-medium">
              층
            </span>
          </div>
        )}

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
        {isFacilityLoading ? (
          <span
            role="status"
            className="text-text-placeholder text-base font-bold"
          >
            시설 목록을 불러오는 중이에요...
          </span>
        ) : facilityError ? (
          <span
            role="alert"
            className="text-danger text-right text-base font-bold"
          >
            시설 목록을 불러오지 못했어요. 새로고침 후 다시 시도해주세요
          </span>
        ) : (
          facilityGroups.map((group) => (
            <FacilityChipGroup
              key={group.category}
              label={FACILITY_CATEGORY_LABEL[group.category]}
              items={group.items}
              selectedIds={form.facilityIds}
              onToggle={toggleFacility}
            />
          ))
        )}
      </div>

      {/* 이전 / 다음으로 (다음으로는 초기 비활성) */}
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          size="nav"
          onClick={() => navigate("/host/register/step2")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="nav"
          disabled={!isValid}
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
