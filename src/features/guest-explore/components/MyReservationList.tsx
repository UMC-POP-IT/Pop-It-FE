import { useEffect, useState } from "react";
import Tab from "@/shared/components/Tab";
import { CancelReservations, GetReservations, Reservation, Status } from "../api/my_reservation_api";
import { ReservationCard } from "@/features/guest-explore/components/ReservationCard";
import MyReservationListEmptyState from "@/features/guest-explore/components/MyReservationListEmptyState";

export const TAB_STATUSES = ["예약 예정", "승인 완료", "계약 완료", "사용 중", "지난 예약"] as const;

// TAB_STATUSES와 순서를 맞춘 탭별 매칭 상태값
// 계약(서명)·결제 중 하나라도 안 끝난 상태(APPROVED, CONTRACT_COMPLETED - 결제 전/취소/실패)는
// "승인 완료" 탭으로, 계약·결제가 모두 끝난 상태(PAYMENT_COMPLETED)만 "계약 완료" 탭으로 묶는다.
const TAB_STATUS_MAP: Status[][] = [
  ["PENDING_APPROVAL"],
  ["APPROVED", "CONTRACT_COMPLETED"],
  ["PAYMENT_COMPLETED"],
  ["IN_USE"],
  ["USAGE_COMPLETED", "CHECKOUT_COMPLETED"],
];

export const MyReservationList = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reservationList, setReservationList] = useState<Reservation[]>([]);

  useEffect(() => {
    GetReservations()
      .then((data) => setReservationList(data?.reservations ?? []))
      .catch((error) => console.error("게스트 - 나의 예약 내역 조회 실패", error));
  }, []);

  const handleCancelReservation = async (reservationId: number) => {
    await CancelReservations(reservationId);
    setReservationList((prev) => prev.filter((r) => r.reservationId !== reservationId));
  };

  const grouped = TAB_STATUS_MAP.map((statuses) =>
    reservationList.filter((r) => statuses.includes(r.status)),
  );

  const activeReservations = grouped[activeIndex];

  return (
    <section className="flex flex-col gap-4 mt-20">
      <h2 className="text-text-primary text-2xl font-bold">내 예약 내역</h2>
      <span className="text-text-secondary text-sm max-[1024px]:mb-[28px]">예정 • 진행 중 • 지난 예약을 한 곳에서 관리해 보세요!</span>

      <Tab
        tabs={TAB_STATUSES.map((status, i) => ({ label: status, count: grouped[i].length }))}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
        scrollOnMobile
      />

      <div className="flex flex-col">
        {activeReservations.length === 0 ? (
          <MyReservationListEmptyState status={TAB_STATUSES[activeIndex]} />
        ) : (
          activeReservations.map((reservation) => (
            <ReservationCard
              key={reservation.reservationId}
              reservation={reservation}
              onCancel={() => handleCancelReservation(reservation.reservationId)}
            />
          ))
        )}
      </div>
    </section>
  );
};
