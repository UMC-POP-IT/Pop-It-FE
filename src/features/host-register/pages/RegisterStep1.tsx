import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import iconOwner from "@/assets/icons/icon_owner.svg";
import Chip from "@/shared/components/Chip";
import Select from "@/shared/components/Select";
import { useNavigate } from "react-router-dom";
import {
  STEPS,
  BUILDING_TYPES,
  DISTRICTS,
} from "@/features/host-register/api/mock_register";
import { useRegisterStore } from "@/store/registerStore";

export const RegisterStep1 = () => {
  //보관함에서 폼 값 + 값 바꾸는 함수 꺼내기
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);

  const navigate = useNavigate();
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

        {/* 등록자 유형 — 원형 아이콘 + 라벨*/}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-bold">
            등록자 유형
          </span>
          <img
            src={iconOwner}
            alt="소유자"
            className="h-20 w-20"
          />
        </div>

        {/* 건물 유형 — 칩 버튼 (여러 개 중 택1)
            공통 Chip으로 수정 완료 */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-sm font-bold">건물 유형</span>
          <div className="flex flex-wrap gap-2">
            {BUILDING_TYPES.map((type) => (
              <Chip
                key={type}
                label={type}
                selected={type === form.buildingType}
                onClick={() => setValues({ buildingType: type })}
              />
            ))}
          </div>
        </div>

        {/* 주소 */}
        <div className="flex flex-col gap-3">
          <span className="text-text-primary text-sm font-bold">주소</span>

          {/* 시 / 구 (한 줄) */}
          <div className="flex gap-3">
            <Input
              label="시"
              aria-label="시"
              placeholder="서울특별시"
              value={form.city}
              onChange={(e) => setValues({ city: e.target.value })}
            />

            <label className="flex w-full flex-col gap-1">
              <span className="text-text-primary text-sm font-medium">구</span>
              <Select
                options={DISTRICTS.map((district) => ({
                  value: district,
                  label: district,
                }))}
                value={form.district}
                onChange={(e) => setValues({ district: e.target.value })}
                placeholder="구 선택"
              />
            </label>
          </div>

          {/* 주소 입력 + 주소 찾기 버튼*/}

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                aria-label="주소"
                placeholder="주소"
                value={form.address}
                onChange={(e) => setValues({ address: e.target.value })}
              />
            </div>
            <Button
              variant="black"
              size="md"
            >
              주소 찾기
            </Button>
          </div>

          {/* 상세 주소 */}
          <Input
            aria-label="상세 주소"
            placeholder="상세 주소를 입력해주세요"
            value={form.detailAddress}
            onChange={(e) => setValues({ detailAddress: e.target.value })}
          />
        </div>
      </div>

      {/* 다음으로 버튼 (우측 정렬)
          정적: 초기 비활성(회색) 상태로 표시.
          TODO: 필수항목 유효성 검사 통과 시 활성화 + Step2 라우팅 (RHF 붙일 때) */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/host/register/step2")}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
