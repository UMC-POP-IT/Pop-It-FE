import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";
import DateRangePicker from "@/features/host-register/components/DateRangePicker";
import { STEPS } from "@/features/host-register/api/mock_register";
import { type KeyboardEvent } from "react";

// number input 화살표(스피너) 숨김 클래스
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export const RegisterStep2 = () => {
  const navigate = useNavigate();
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);
  // number 입력에서 e, +, -, . 못 치게 막기
  const blockNonNumeric = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
  };
  const depositError =
    Number(form.deposit) > 100 ? "보증금은 100만원 이하 입력해 주세요" : "";

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
          <span className="text-text-primary text-[22px] font-bold">
            가격 정보
          </span>

          <div className="grid grid-cols-2 gap-6">
            {/* 보증금 */}
            <div className="flex flex-col gap-1">
              <label className="text-text-tertiary text-xl font-bold">
                보증금
              </label>
              <div className="relative">
                <Input
                  type="number"
                  aria-label="보증금"
                  value={form.deposit}
                  onChange={(e) =>
                    setValues({
                      deposit: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                  onKeyDown={blockNonNumeric}
                  className={NO_SPINNER}
                  error={depositError}
                />
                <span className="text-text-secondary pointer-events-none absolute top-7 right-4 -translate-y-1/2 text-lg font-medium">
                  만원
                </span>
              </div>
              {!depositError && (
                <span className="text-text-placeholder text-base font-bold">
                  최대 100만원 설정 가능
                </span>
              )}
            </div>

            {/* 금액 (일/주/월 3줄) */}
            <div className="flex flex-col gap-1">
              <label className="text-text-tertiary text-xl font-bold">
                금액
              </label>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Input
                    type="number"
                    value={form.priceDay}
                    onChange={(e) =>
                      setValues({
                        priceDay: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    onKeyDown={blockNonNumeric}
                    className={NO_SPINNER}
                  />
                  <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-medium">
                    만원/일
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.priceWeek}
                    onChange={(e) =>
                      setValues({
                        priceWeek: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    onKeyDown={blockNonNumeric}
                    className={NO_SPINNER}
                  />
                  <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-medium">
                    만원/주
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={form.priceMonth}
                    onChange={(e) =>
                      setValues({
                        priceMonth: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    onKeyDown={blockNonNumeric}
                    className={NO_SPINNER}
                  />
                  <span className="text-text-secondary pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-medium">
                    만원/월
                  </span>
                </div>
              </div>
              <span className="text-text-placeholder text-base font-bold">
                제출하지 않는 대여 단위는 공란으로 남겨주세요
              </span>
            </div>
          </div>
        </div>

        {/* 계약 가능 기간 */}
        <div className="flex flex-col gap-3">
          <span className="text-text-primary text-[22px] font-bold">
            계약 가능 기간
          </span>

          {/* 필드 클릭 → 달력 팝업 → 확인 시 store 저장.
              store 값으로 초기화(뒤로 왔을 때 유지) */}
          <DateRangePicker
            initialStart={form.startDate}
            initialEnd={form.endDate}
            onConfirm={(start, end) =>
              setValues({ startDate: start, endDate: end })
            }
          />

          <span className="text-text-placeholder text-base font-bold">
            최대 3개월 신청 가능
          </span>
        </div>
      </div>

      {/* 이전 / 다음으로 버튼 (우측 정렬)
          TODO(2차): 유효성 검사 통과 시 활성화 */}
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
