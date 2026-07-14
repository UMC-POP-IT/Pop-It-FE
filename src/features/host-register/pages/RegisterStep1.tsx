import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import iconOwner from "@/assets/icons/icon_owner.svg";
import Chip from "@/shared/components/Chip";
import Select from "@/shared/components/Select";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";

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
  // 단계 간 값 유지용 store (뒤로 와도 선택/입력 유지)
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-[794px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 (공통 컴포넌트) — 0 = 첫 단계 */}
      <StepIndicator
        steps={STEPS}
        currentStep={0}
      />

      {/* 섹션: 위치/구조 */}
      <div className="flex flex-col gap-6">
        <h2 className="text-text-primary border-border border-b pb-2 text-[28px] font-bold">
          위치/구조
        </h2>

        {/* 등록자 유형 — 원형 아이콘 + 라벨*/}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-[22px] font-bold">
            등록자 유형
          </span>
          <img
            src={iconOwner}
            alt="소유자"
            className="size-[112px]"
          />
        </div>

        {/* 건물 유형 — 칩 버튼 (여러 개 중 택1)
            공통 Chip으로 수정 완료 */}
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-[22px] font-bold">
            건물 유형
          </span>
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
          <span className="text-text-primary text-[22px] font-bold">주소</span>

          {/* 시 / 구 (한 줄) */}
          <div className="flex gap-3">
            <label className="flex w-full flex-col gap-1">
              <span className="text-text-tertiary text-xl font-bold">시</span>
              <Input
                placeholder="서울특별시"
                value={form.city}
                onChange={(e) => setValues({ city: e.target.value })}
              />
            </label>

            <label className="flex w-full flex-col gap-1">
              <span className="text-text-tertiary text-xl font-bold">구</span>
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
                placeholder="주소"
                value={form.address}
                onChange={(e) => setValues({ address: e.target.value })}
              />
            </div>
            {/* TODO: 주소 검색 API 연동 */}
            <Button
              variant="black"
              size="nav"
              className="text-xl! font-bold!"
            >
              주소 찾기
            </Button>
          </div>

          {/* 상세 주소 */}
          <Input
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
          size="nav"
          onClick={() => navigate("/host/register/step2")}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
