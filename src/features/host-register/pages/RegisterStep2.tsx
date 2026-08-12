import StepIndicator from "@/shared/components/StepIndicator";
import Input from "@/shared/components/Input";
import Button from "@/shared/components/Button";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "@/store/registerStore";
import DateRangePicker from "@/features/host-register/components/DateRangePicker";
import { STEPS } from "@/features/host-register/api/mock_register";
import { NO_SPINNER, blockNonNumeric } from "@/shared/utils/numberInput";

/** 서버 pricePerDay가 최소 1원이라 만원 단위 입력은 최소 1만원 */
const MIN_PRICE_DAY_MANWON = 1;

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

  // 값이 있을 때만 범위 검사 — 빈 칸은 "미입력"이지 "잘못된 값"이 아니다
  const priceDayNumber = Number(form.priceDay);
  const priceDayError = !hasPrice
    ? ""
    : !(priceDayNumber >= MIN_PRICE_DAY_MANWON)
      ? `1일 대여료는 ${MIN_PRICE_DAY_MANWON}만원 이상 입력해 주세요`
      : priceDayNumber > MAX_PRICE_DAY_MANWON
        ? `1일 대여료는 ${MAX_PRICE_DAY_MANWON.toLocaleString()}만원 이하로 입력해 주세요`
        : "";

  //기간: 시작일 + 종료일 둘 다 입력됐나
  const hasPeriod = form.startDate !== "" && form.endDate !== "";

  //전부 통과 + 보증금·대여료 에러 없음 -> 유효
  const isValid = hasPrice && hasPeriod && !depositError && !priceDayError;

  return (
    // 여백·폭 규격은 RegisterStep1과 동일 (본문 328/535/644, 위 134 / 아래 120·88)
    <div className="mx-auto flex w-full max-w-[535px] flex-col pt-0 pb-14 md:pt-[102px] md:pb-[88px] lg:max-w-[644px]">
      {/* 페이지 제목 (가운데) — 모바일 28 / md 이상 32 */}
      <h1 className="text-text-primary text-center text-[28px] font-bold md:text-[32px]">
        {isEdit ? "공간 수정" : "공간 등록"}
      </h1>

      {/* 상단 진행바 (공통 컴포넌트) — 1 = 두 번째 단계(거래 정보).
          StepIndicator에 className prop이 없어 div로 감싸 간격을 준다.
          컴포넌트 안에 py-3(12)이 이미 있어 피그마 36 = mt-6(24) + 12.
          모바일은 20 = mt-2(8) + 12 */}
      <div className="mt-2 md:mt-6">
        <StepIndicator
          steps={STEPS}
          currentStep={1}
        />
      </div>

      {/* 섹션: 거래 정보 — 피그마 74 = mt-[62px] + 진행바 아래 py-3(12).
          모바일은 58 = mt-[46px] + 12 */}
      <div className="mt-[46px] flex flex-col md:mt-[62px]">
        <h2 className="text-text-primary border-border border-b pb-6 text-[24px] font-bold md:text-[28px]">
          거래 정보
        </h2>

        {/* 입력 필드 묶음 — 구분선 아래 28(mt-7), 필드 사이 48(gap-12).
            두 값이 달라 섹션 gap 하나로는 못 만들어 래퍼를 따로 둔다 */}
        <div className="mt-7 flex flex-col gap-12">
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
                {/* 시안 라벨은 "금액"이지만 일부러 "1일 대여료"로 둔다.
                    주/월 가격은 상세 페이지에서 이 값으로 계산하므로 여기 입력하는 게
                    '하루치'라는 걸 라벨에서 알려줘야 한다. 시안 수정 요청함 */}
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

            <span className="text-text-secondary text-right text-base font-medium">
              최대 3개월 선택 가능
            </span>
          </div>
        </div>
      </div>

      {/* 이전 / 다음으로 버튼 (우측 정렬) — 피그마 72 (3단 공통).
          버튼 사이는 모바일 16 / md 이상 8 */}
      <div className="mt-18 flex justify-end gap-4 md:gap-2">
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
