import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  createReservation,
  getUnavailableDates,
  type CreateReservationResponse,
  type UnavailablePeriod,
} from "@/features/guest-explore/api/my_reservation_api";
import ReservationRequestModal from "@/features/guest-explore/components/ReservationRequestModal";
import Modal from "@/shared/components/Modal";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface ExploreReservationCardProps {
  spaceId: number;
  dayCost: number;
  onLoginRequired?: () => void;
}

const toApiDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dow = WEEKDAYS[date.getDay()];
  return `${y}.${m}.${d} (${dow})`;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const diffDays = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;

// 시/분/초를 버리고 "그 날짜"만 남긴 로컬 자정 Date로 정규화한다.
// 달력 그리드(calendarDays)도 전부 로컬 Y/M/D 기준으로 만들어지므로,
// 날짜 비교는 항상 이 함수를 거친 값끼리만 수행해야 시각(time-of-day) 차이로 인한
// 하루 어긋남을 막을 수 있다.
const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// 서버가 내려주는 "YYYY-MM-DD" 문자열은 시간대 정보가 없는 순수 날짜다.
// new Date(str)로 직접 파싱하면 ISO 8601로 인식되어 UTC 자정으로 해석되고,
// UTC보다 뒤(음수 오프셋)인 로컬 타임존에서는 하루 전 날짜로 밀려 보이는 문제가 생긴다.
// 그래서 반드시 연/월/일을 직접 분해해 로컬 Date로 만들어야 하며,
// 이렇게 만든 값은 toDateOnly로 정규화한 로컬 날짜와 항상 안전하게 비교할 수 있다.
const parseDateString = (str: string) => {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// 예약 가능 기간: 오늘부터 90일 이내
const BOOKING_WINDOW_DAYS = 90;

const ExploreReservationCard = ({ spaceId, dayCost, onLoginRequired }: ExploreReservationCardProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const guestName = user?.nickname ?? "";

  const todayStart = toDateOnly(new Date());

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([]);
  // 예약 불가 날짜 조회 상태. unavailablePeriods와 분리해서 관리한다 —
  // 조회가 끝나기 전에는 unavailablePeriods가 빈 배열이라 "예약 가능"과 구분이 안 되므로,
  // 로딩/실패 중에는 이 상태를 기준으로 날짜 선택 자체를 전부 막는다.
  const [availabilityStatus, setAvailabilityStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [availabilityRetryToken, setAvailabilityRetryToken] = useState(0);

  // 이 공간에 이미 선점(승인대기~진행 중)된 예약 기간을 받아와 달력에서 선택하지 못하게 막는다.
  // 조회가 끝나기 전(loading)이나 실패(error)했을 때는 어떤 날짜가 예약 불가인지 알 수 없으므로,
  // isDateDisabled에서 이 상태를 확인해 모든 날짜 선택을 막는다.
  useEffect(() => {
    let cancelled = false;
    setAvailabilityStatus("loading");
    getUnavailableDates(spaceId)
      .then((periods) => {
        if (cancelled) return;
        setUnavailablePeriods(periods);
        setAvailabilityStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setAvailabilityStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [spaceId, availabilityRetryToken]);

  const handleRetryAvailability = () => setAvailabilityRetryToken((n) => n + 1);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [reservationResult, setReservationResult] = useState<CreateReservationResponse | null>(
    null,
  );

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const gridStart = new Date(year, month, 1 - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [viewDate]);

  // 예약 가능한 마지막 날짜 = 오늘 + 90일 (이 날짜까지는 포함, 그 다음 날부터 선택 불가)
  const maxSelectableDate = new Date(todayStart);
  maxSelectableDate.setDate(maxSelectableDate.getDate() + BOOKING_WINDOW_DAYS);

  // 오늘이 속한 달보다 과거로, 오늘+90일이 속한 달보다 미래로는 이동할 수 없다.
  // (이동할 수 없는 방향의 화살표 버튼은 아예 렌더링하지 않는다.)
  // 두 날짜를 각자의 "월 1일"로 정규화한 뒤 비교해, 자정을 넘겨 페이지가 계속 열려있는
  // 등의 이유로 viewDate가 오늘이 속한 달보다 과거가 되어버린 경우까지 안전하게 막는다.
  const currentMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const viewedMonthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const isPrevMonthDisabled = viewedMonthStart <= currentMonthStart;
  const isNextMonthDisabled =
    viewDate.getFullYear() === maxSelectableDate.getFullYear() &&
    viewDate.getMonth() === maxSelectableDate.getMonth();

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (isNextMonthDisabled) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // date가 예약 불가 기간(startDate~endDate, 양 끝 포함)에 속하는지 확인한다.
  // date는 항상 calendarDays에서 온 로컬 자정 값이지만, 혹시 모를 시각 정보 차이까지
  // 방어하기 위해 비교 전에 toDateOnly로 한 번 더 정규화한다.
  const isDateBooked = (date: Date) => {
    const target = toDateOnly(date);
    return unavailablePeriods.some(({ startDate: s, endDate: e }) => {
      const start = parseDateString(s);
      const end = parseDateString(e);
      return target >= start && target <= end;
    });
  };

  // 선택 가능 범위: 오늘(포함) ~ 오늘+90일(포함). 그 밖(과거, 91일째 이후)이거나
  // 이미 예약된(선점된) 날짜는 선택할 수 없다.
  // 예약 불가 날짜 조회가 아직 끝나지 않았거나(loading) 실패했으면(error), 어떤 날짜가
  // 실제로 예약 가능한지 알 수 없으므로 안전하게 모든 날짜를 선택 불가로 취급한다.
  const isDateDisabled = (date: Date) => {
    if (availabilityStatus !== "success") return true;
    const target = toDateOnly(date);
    return target < todayStart || target > maxSelectableDate || isDateBooked(target);
  };

  // start~end 사이(양 끝 포함)에 이미 예약된 날짜가 하루라도 있는지 확인
  // start~end 구간이 예약 불가 기간 중 하나와 겹치는지 구간 비교로 한 번에 확인한다.
  // (날짜를 하루씩 순회하는 대신 겹침 조건 pStart <= end && pEnd >= start만 확인)
  const hasBookedDateBetween = (start: Date, end: Date) =>
    unavailablePeriods.some(({ startDate: s, endDate: e }) => {
      const pStart = parseDateString(s);
      const pEnd = parseDateString(e);
      return pStart <= end && pEnd >= start;
    });

  const handleSelectDate = (date: Date) => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (isDateDisabled(date)) return;
    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }
    if (date < startDate) {
      setStartDate(date);
      setEndDate(null);
      return;
    }
    // 기간(시작일~클릭한 날짜) 사이에 이미 예약된 날짜가 있으면 기간을 만들지 않고,
    // 클릭한 날짜를 새 시작일로 다시 잡는다 (기존 시작일 선택은 해제됨).
    if (hasBookedDateBetween(startDate, date)) {
      setStartDate(date);
      setEndDate(null);
      return;
    }
    setEndDate(date);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const totalDays = startDate && endDate ? diffDays(startDate, endDate) : 0;
  const totalPrice = totalDays * dayCost;

  const periodLabel: string | undefined =
    startDate && endDate ? `${formatDate(startDate)} ~ ${formatDate(endDate)}` : undefined;

  const handleOpenRequestModal = () => {
    if (!(startDate && endDate)) return;
    // 예약 불가 날짜 조회가 아직 안 끝났거나 실패한 상태면, 방금 선택한 기간이
    // 실제로 예약 가능한지 확인할 수 없으므로 요청 모달을 열지 않는다.
    if (availabilityStatus !== "success") return;
    setSubmitError(null);
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (usagePurpose: string) => {
    if (!(startDate && endDate)) return;
    if (availabilityStatus !== "success") return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await createReservation({
        spaceId,
        startDate: toApiDateString(startDate),
        endDate: toApiDateString(endDate),
        usagePurpose,
      });
      setReservationResult(result);
      setIsRequestModalOpen(false);
      setIsCompleteModalOpen(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "예약 요청에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteConfirm = () => {
    // navigate 이후 이 컴포넌트는 언마운트되므로 날짜 상태를 별도로 초기화할 필요는 없다.
    setIsCompleteModalOpen(false);
    navigate("/reservations");
  };

  // 완료 모달에는 클라이언트 예상치가 아닌 서버가 계산한 실제 금액(임대료/보험료/보증금/총액)을 보여준다.
  const completeDescription = reservationResult
    ? `나의 예약 > 예약 예정\n\n임대료 ${reservationResult.rentalFee.toLocaleString()}원 · 보험료 ${reservationResult.insuranceFee.toLocaleString()}원 · 보증금 ${reservationResult.deposit.toLocaleString()}원\n총 결제 예정 금액 ${reservationResult.totalPrice.toLocaleString()}원`
    : "나의 예약 > 예약 예정";

  // 여러 날짜(기간)를 선택한 경우에만 시작일~종료일 사이를 이어주는 캡슐 배경을 그린다.
  // 시작일=종료일(하루만 선택)인 경우는 캡슐 없이 숫자에 꽉 찬 원만 표시한다 (피그마 디자인 기준).
  const getDayClassName = (date: Date) => {
    const isCurrentMonth = date.getMonth() === viewDate.getMonth();

    if (isDateDisabled(date)) {
      return "cursor-not-allowed";
    }
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      // 시작일/종료일 칸은 원의 세로 지름(칸 정중앙)까지만 배경을 채운다.
      // 그 바깥쪽(반대쪽 절반)은 배경 없이 비워둬 원 뒤로 삐져나오지 않게 한다.
      if (isSameDay(date, startDate)) {
        return "text-text-primary bg-[linear-gradient(to_right,transparent_50%,var(--color-primary-100)_50%)]";
      }
      if (isSameDay(date, endDate)) {
        return "text-text-primary bg-[linear-gradient(to_right,var(--color-primary-100)_50%,transparent_50%)]";
      }
      if (date > startDate && date < endDate) {
        return "bg-primary-100 text-text-primary";
      }
    }
    return isCurrentMonth ? "text-text-primary" : "text-text-disabled";
  };

  // 시작일 또는 종료일(하루만 선택한 경우 포함)인 날짜의 숫자에 꽉 찬 원 강조를 준다.
  const isSelectedEndpoint = (date: Date) => {
    if (startDate && !endDate) return isSameDay(date, startDate);
    if (startDate && endDate) return isSameDay(date, startDate) || isSameDay(date, endDate);
    return false;
  };

  // 시작일/종료일뿐 아니라 그 사이(선택된 기간 전체) 날짜도 포함해 "선택됨" 여부를 판단한다.
  // 접근성용 aria-pressed에 사용 — 화면에 보이는 강조 스타일(isSelectedEndpoint)과는 별개다.
  const isDateSelected = (date: Date) => {
    if (startDate && !endDate) return isSameDay(date, startDate);
    if (startDate && endDate) return date >= startDate && date <= endDate;
    return false;
  };

  // 스크린 리더용 날짜 라벨: 연·월·일 전체와, 시작일/종료일이면 그 역할까지 함께 알려준다.
  const getDayAriaLabel = (date: Date) => {
    const base = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    if (startDate && isSameDay(date, startDate)) {
      if (endDate && !isSameDay(startDate, endDate)) return `${base}, 시작일`;
      return `${base}, 선택된 날짜`;
    }
    if (endDate && isSameDay(date, endDate)) {
      return `${base}, 종료일`;
    }
    return base;
  };

  // 날짜 칸 안의 숫자를 어떤 모양으로 그릴지 결정한다.
  // 우선순위: 선택됨(꽉 찬 원) > 오늘(테두리 원, 선택 불가 시 회색 테두리+취소선) > 선택 불가(회색 취소선 텍스트만) > 기본
  const renderDayNumber = (date: Date) => {
    const day = date.getDate();

    if (isSelectedEndpoint(date)) {
      return (
        <span className="bg-primary relative z-10 flex aspect-square h-full shrink-0 items-center justify-center rounded-full text-white">
          {day}
        </span>
      );
    }

    const isToday = isSameDay(date, todayStart);
    const disabled = isDateDisabled(date);

    if (isToday && !disabled) {
      // 오늘 날짜 표시 (선택 가능): 옅은 파란 테두리 원
      return (
        <span className="border-primary-100 relative z-10 flex aspect-square h-8 shrink-0 items-center justify-center rounded-full border text-text-primary">
          {day}
        </span>
      );
    }
    if (isToday && disabled) {
      // 오늘 날짜 표시 (선택 불가): 회색 테두리 원 + 취소선 (피그마 디자인 기준)
      return (
        <span className="relative z-10 flex aspect-square h-8 shrink-0 items-center justify-center rounded-full border border-[#c5c5c5] text-[#c5c5c5] line-through">
          {day}
        </span>
      );
    }
    if (disabled) {
      // 오늘이 아닌 나머지 선택 불가 날짜: 원 없이 회색 취소선 텍스트만
      return <span className="text-[#c5c5c5] line-through">{day}</span>;
    }
    return day;
  };

  return (
    <div className="flex w-[488px] shrink-0 items-center rounded-xl bg-[#F6FAFF] p-5">
      <div className="flex w-full flex-col gap-6">
        <div className="border-primary flex w-fit items-center justify-center border-b py-1">
          <h3 className="text-text-primary text-xl font-bold">예약하기</h3>
        </div>

        {availabilityStatus === "error" && (
          <div className="bg-tag-bg flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3">
            <span className="text-text-secondary text-sm">
              예약 가능 여부를 불러오지 못했어요. 날짜 선택이 제한됩니다.
            </span>
            <button
              type="button"
              onClick={handleRetryAvailability}
              className="text-primary-hover shrink-0 text-sm font-bold underline"
            >
              다시 시도
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* 시작일 / 종료일 */}
          <div className="flex items-center justify-center gap-10 rounded-lg bg-white px-8 py-2">
            <span className="text-text-primary text-base font-bold">
              {startDate ? formatDate(startDate) : "시작일 선택"}
            </span>
            <span className="bg-border h-[22px] w-px" />
            <span className="text-text-primary text-base font-bold">
              {endDate ? formatDate(endDate) : "종료일 선택"}
            </span>
          </div>

          {/* 달력 */}
          <div className="flex flex-col gap-7 rounded-lg bg-white px-3.5 py-5">
            {/* 화살표 유무와 상관없이 "YYYY.MM" 라벨 위치가 항상 고정되도록,
                화살표 자리는 비활성 방향일 때도 같은 크기(w-8)로 비워둔다. */}
            <div className="flex w-full items-center justify-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center">
                {!isPrevMonthDisabled && (
                  <button
                    type="button"
                    aria-label="이전 달"
                    onClick={handlePrevMonth}
                    className="text-text-primary flex h-8 w-8 items-center justify-center text-xl"
                  >
                    ‹
                  </button>
                )}
              </div>
              <span className="text-text-primary text-xl font-bold">
                {viewDate.getFullYear()}.
                {String(viewDate.getMonth() + 1).padStart(2, "0")}
              </span>
              <div className="flex h-8 w-8 items-center justify-center">
                {!isNextMonthDisabled && (
                  <button
                    type="button"
                    aria-label="다음 달"
                    onClick={handleNextMonth}
                    className="text-text-primary flex h-8 w-8 items-center justify-center text-xl"
                  >
                    ›
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                {WEEKDAYS.map((day) => (
                  <span
                    key={day}
                    className="text-text-primary flex w-[60px] items-center justify-center py-2 text-sm"
                  >
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((date) => (
                  <button
                    type="button"
                    key={date.toISOString()}
                    onClick={() => handleSelectDate(date)}
                    disabled={isDateDisabled(date)}
                    aria-label={getDayAriaLabel(date)}
                    aria-pressed={isDateSelected(date)}
                    className={`relative box-border flex h-10 w-full items-center justify-center border-0 p-0 text-base font-bold disabled:cursor-not-allowed ${getDayClassName(date)}`}
                  >
                    {renderDayNumber(date)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-6">
          <div className="text-text-primary flex w-full flex-col items-end gap-1">
            <div className="flex w-full items-center justify-between">
              <span className="text-base">예약 기간:</span>
              <span className="text-xl font-bold">
                {totalDays > 0 ? `${totalDays}일` : "-"}
              </span>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-base whitespace-nowrap">예상 가격:</span>
              <span className="text-xl font-bold whitespace-nowrap">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          <div className="flex w-full items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="border-primary-hover text-primary-hover flex h-[52px] w-[94px] items-center justify-center rounded-lg border bg-white text-lg font-bold"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={handleOpenRequestModal}
              disabled={!(startDate && endDate) || availabilityStatus !== "success"}
              className="bg-primary-hover flex h-[52px] flex-1 items-center justify-center rounded-lg text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              예약 요청하기
            </button>
          </div>
        </div>
      </div>

      {isRequestModalOpen && (
        <ReservationRequestModal
          isOpen={isRequestModalOpen}
          guestName={guestName}
          periodLabel={periodLabel}
          estimatedRentalFee={totalPrice}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onCancel={() => setIsRequestModalOpen(false)}
          onSubmit={handleSubmitRequest}
        />
      )}

      <Modal
        isOpen={isCompleteModalOpen}
        showCheckIcon
        singleButton
        title="예약 요청이 완료 되었습니다"
        description={completeDescription}
        confirmLabel="확인"
        onConfirm={handleCompleteConfirm}
      />
    </div>
  );
};

export default ExploreReservationCard;
