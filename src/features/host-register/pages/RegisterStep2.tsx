import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import { useNavigate } from "react-router-dom";

// 5단계 진행바 라벨 (Step1과 동일 — 현재 단계만 다름)
const STEPS = ["위치/구조", "거래 정보", "공간 정보", "상세 정보", "사진 등록"];

// 금액(대여료) 단위별 입력 (일/주/월)
const PRICE_ROWS = ["만원/일", "만원/주", "만원/월"];

export const RegisterStep2 = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-[794px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 (공통 컴포넌트) — 1 = 두 번째 단계(거래 정보) */}
      <StepIndicator
        steps={STEPS}
        currentStep={1}
      />

      {/* 섹션: 거래 정보 */}
      <div className="flex flex-col gap-8">
        <h2 className="text-text-primary border-border border-b pb-2 text-[28px] font-bold">
          거래 정보
        </h2>

        {/* 가격 정보 (2단: 보증금 / 금액) */}
        <div className="flex flex-col gap-3">
          <span className="text-text-primary text-[22px] font-bold">가격 정보</span>

          <div className="grid grid-cols-2 gap-6">
            {/* 보증금 */}
            <div className="flex flex-col gap-1">
              <span className="text-text-tertiary text-xl font-bold">
                보증금
              </span>
              <div className="relative">
                <Input type="number" />
                <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-medium">
                  만원
                </span>
              </div>
              <span className="text-text-placeholder text-base font-bold">
                최대 100만원 설정 가능
              </span>
            </div>

            {/* 금액 (일/주/월 3줄) */}
            <div className="flex flex-col gap-1">
              <span className="text-text-tertiary text-xl font-bold">
                금액
              </span>
              <div className="flex flex-col gap-2">
                {PRICE_ROWS.map((unit) => (
                  <div
                    key={unit}
                    className="relative"
                  >
                    <Input type="number" />
                    <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-medium">
                      {unit}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-text-placeholder text-base font-bold">
                제출하지 않는 대여 단위는 공란으로 남겨주세요
              </span>
            </div>
          </div>
        </div>

        {/* 계약 가능 기간 (시작일 / 종료일) */}
        <div className="flex flex-col gap-3">
          <span className="text-text-primary text-[22px] font-bold">
            계약 가능 기간
          </span>

          <div className="grid grid-cols-2 gap-6">
            {/* 시작일 */}
            <label className="flex w-full flex-col gap-1">
              <span className="text-text-tertiary text-xl font-bold">시작일</span>
              <Input type="date" />
            </label>

            {/* 종료일 */}
            <div className="flex flex-col gap-1">
              <label className="flex w-full flex-col gap-1">
                <span className="text-text-tertiary text-xl font-bold">종료일</span>
                <Input type="date" />
              </label>
              <span className="text-text-placeholder text-base font-bold">
                최대 3개월 신청 가능
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 이전 / 다음으로 버튼 (우측 정렬)
          정적: 다음으로는 초기 비활성(회색) 상태.
          TODO: 유효성 검사 통과 시 활성화 + 단계 이동 (RHF 붙일 때) */}
      <div className="flex justify-end gap-2">
        <Button
          variant="gray"
          size="nav"
          onClick={() => navigate("/host/register")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="nav"
          onClick={() => navigate("/host/register/step3")}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
