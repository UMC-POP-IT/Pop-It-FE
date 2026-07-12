import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import { useNavigate } from "react-router-dom";
import { STEPS } from "@/features/host-register/api/mock_register";
import { useRegisterStore } from "@/store/registerStore";

export const RegisterStep2 = () => {
  const navigate = useNavigate();
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-2xl font-bold">
        공간 등록
      </h1>

      {/* 상단 진행바 (공통 컴포넌트) — 1 = 두 번째 단계(거래 정보) */}
      <StepIndicator
        steps={STEPS}
        currentStep={1}
      />

      {/* 섹션: 거래 정보 */}
      <div className="flex flex-col gap-8">
        <h2 className="text-text-primary border-border border-b pb-2 text-lg font-bold">
          거래 정보
        </h2>

        {/* 가격 정보 (2단: 보증금 / 금액) */}
        <div className="flex flex-col gap-3">
          <span className="text-text-primary text-sm font-bold">가격 정보</span>

          <div className="grid grid-cols-2 gap-6">
            {/* 보증금 */}
            <div className="flex flex-col gap-1">
              <span className="text-text-primary text-sm font-medium">
                보증금
              </span>
              <div className="relative">
                <Input
                  type="number"
                  value={form.deposit}
                  onChange={(e) => setValues({ deposit: e.target.value })}
                />
                <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
                  만원
                </span>
              </div>
              <span className="text-text-disabled text-xs">
                최대 100만원 설정 가능
              </span>
            </div>

            {/* 금액 (일/주/월 3줄) */}
            <div className="flex flex-col gap-1">
              <span className="text-text-primary text-sm font-medium">
                금액
              </span>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Input
                    type="number"
                    value={form.priceDay}
                    onChange={(e) => setValues({ priceDay: e.target.value })}
                  />
                  <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
                    만원/일
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.priceWeek}
                    onChange={(e) => setValues({ priceWeek: e.target.value })}
                  />
                  <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
                    만원/주
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.priceMonth}
                    onChange={(e) => setValues({ priceMonth: e.target.value })}
                  />
                  <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm">
                    만원/월
                  </span>
                </div>
              </div>

              <span className="text-text-disabled text-xs">
                제출하지 않는 대여 단위는 공란으로 남겨주세요
              </span>
            </div>
          </div>
        </div>

        {/* 계약 가능 기간 (시작일 / 종료일) */}
        <div className="flex flex-col gap-3">
          <span className="text-text-primary text-sm font-bold">
            계약 가능 기간
          </span>

          <div className="grid grid-cols-2 gap-6">
            {/* 시작일 */}
            <Input
              label="시작일"
              type="date"
              value={form.startDate}
              onChange={(e) => setValues({ startDate: e.target.value })}
            />

            {/* 종료일 */}
            <div className="flex flex-col gap-1">
              <Input
                label="종료일"
                type="date"
                value={form.endDate}
                onChange={(e) => setValues({ endDate: e.target.value })}
              />
              <span className="text-text-disabled text-xs">
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
          onClick={() => navigate("/host/register")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/host/register/step3")}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
