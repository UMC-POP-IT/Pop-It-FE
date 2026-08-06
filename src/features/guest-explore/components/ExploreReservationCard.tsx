import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  createReservation,
  type CreateReservationResponse,
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

const ExploreReservationCard = ({ spaceId, dayCost, onLoginRequired }: ExploreReservationCardProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const guestName = user?.nickname ?? "";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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

  // 오늘이 속한 달보다 과거로는 이동할 수 없도록 이전 달 버튼을 막는다.
  const isPrevMonthDisabled =
    viewDate.getFullYear() === todayStart.getFullYear() &&
    viewDate.getMonth() === todayStart.getMonth();

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleSelectDate = (date: Date) => {
    if (!user) {
      onLoginRequired?.();
      return;
    }
    if (date < todayStart) return;
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
    setSubmitError(null);
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (usagePurpose: string) => {
    if (!(startDate && endDate)) return;
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

    if (date < todayStart) {
      return "text-text-disabled cursor-not-allowed";
    }
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      if (isSameDay(date, startDate)) {
        return "bg-primary-100 rounded-l-full text-text-primary";
      }
      if (isSameDay(date, endDate)) {
        return "bg-primary-100 rounded-r-full text-text-primary";
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

  return (
    <div className="flex w-[488px] shrink-0 items-center rounded-xl bg-[#F6FAFF] p-5">
      <div className="flex w-full flex-col gap-6">
        <div className="border-primary flex w-fit items-center justify-center border-b py-1">
          <h3 className="text-text-primary text-xl font-bold">예약하기</h3>
        </div>

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
            <div className="flex w-full items-center justify-center gap-1">
              <button
                type="button"
                aria-label="이전 달"
                onClick={handlePrevMonth}
                disabled={isPrevMonthDisabled}
                className="text-text-primary flex h-8 w-8 items-center justify-center text-xl disabled:cursor-not-allowed disabled:opacity-30"
              >
                ‹
              </button>
              <span className="text-text-primary text-xl font-bold">
                {viewDate.getFullYear()}.
                {String(viewDate.getMonth() + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
                  )
                }
                className="text-text-primary flex h-8 w-8 items-center justify-center text-xl"
              >
                ›
              </button>
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
                    disabled={date < todayStart}
                    className={`flex w-full items-center justify-center p-3 text-base font-bold disabled:cursor-not-allowed ${getDayClassName(date)}`}
                  >
                    {isSelectedEndpoint(date) ? (
                      <span className="bg-primary flex h-9 w-9 items-center justify-center rounded-full text-white">
                        {date.getDate()}
                      </span>
                    ) : (
                      date.getDate()
                    )}
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
              disabled={!(startDate && endDate)}
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
