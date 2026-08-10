import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";
import DateRangePicker from "@/features/host-register/components/DateRangePicker";
import { STEPS } from "@/features/host-register/api/mock_register";
import { NO_SPINNER, blockNonNumeric } from "@/shared/utils/numberInput";

/** 서버 pricePerDay가 int32(최대 2,147,483,647원)라서 만원 단위 입력은 여기까지 */
const MAX_PRICE_DAY_MANWON = 214_748;

export const RegisterStep2 = () => {
  const isEdit = useRegisterStore((s) => s.isEdit);
  const navigate = useNavigate();
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);

  const depositError =
    Number(form.deposit) > 100 ? "보증금은 100만원 이하 입력해 주세요" : "";

  //금액: 일 단가 입력됐는지 (주/월 가격은 상세 페이지에서 일 단가로 계산)
  const hasPrice = form.priceDay !== "";

  // 값이 있을 때만 상한 검사 — 빈 칸은 "미입력"이지 "잘못된 값"이 아니다
  const priceDayError =
    hasPrice && Number(form.priceDay) > MAX_PRICE_DAY_MANWON
      ? `1일 대여료는 ${MAX_PRICE_DAY_MANWON.toLocaleString()}만원 이하로 입력해 주세요`
      : "";

  //기간: 시작일 + 종료일 둘 다 입력됐나
  const hasPeriod = form.startDate !== "" && form.endDate !== "";

  //전부 통과 + 보증금·대여료 에러 없음 -> 유효
  const isValid = hasPrice && hasPeriod && !depositError && !priceDayError;

  return (
    <div className="mx-auto flex w-full max-w-[826px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        {isEdit ? "공간 수정" : "공간 등록"}
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
                <span className="text-text-secondary text-left text-base font-medium">
                  최대 100만원 설정 가능
                </span>
              )}
            </div>

            {/* 금액 (일 단가만 입력 — 주/월 가격은 상세 페이지에서 계산) */}
            <div className="flex flex-col gap-1">
              <label className="text-text-tertiary text-xl font-bold">
                1일 대여료
              </label>
              <div className="relative">
                <Input
                  type="number"
                  aria-label="1일 대여료"
                  value={form.priceDay}
                  onChange={(e) =>
                    setValues({
                      priceDay: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                  onKeyDown={blockNonNumeric}
                  className={NO_SPINNER}
                  error={priceDayError}
                />
                <span className="text-text-secondary pointer-events-none absolute top-7 right-4 -translate-y-1/2 text-lg font-medium">
                  만원/일
                </span>
              </div>
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

          <span className="text-text-secondary text-left text-base font-medium">
            최대 3개월 신청 가능
          </span>
        </div>
      </div>

      {/* 이전 / 다음으로 버튼 (우측 정렬)*/}
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          size="nav"
          onClick={() => navigate("/host/register")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="nav"
          disabled={!isValid}
          onClick={() => navigate("/host/register/step3")}
        >
          다음으로
        </Button>
      </div>
    </div>
  );
};
