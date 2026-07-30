import { useEffect, useState } from "react";
import Tab from "@/shared/components/Tab";
import { CancelReservations, GetReservations, Reservation } from "../api/my_reservation_api";
import { ReservationCard } from "@/features/guest-explore/components/ReservationCard";
import MyReservationListEmptyState from "@/features/guest-explore/components/MyReservationListEmptyState";

const TAB_STATUSES = ["예약 예정", "승인 완료", "계약 완료", "사용 중", "지난 예약"];

export const MyReservationList = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reservationList, setReservationList] = useState<Reservation[]>([]);

  useEffect(() => {
    GetReservations()
      .then((data) => setReservationList(data?.reservations ?? [])) // undefined라면 empty
      .catch((error) => console.error("게스트 - 나의 예약 내역 조회 실패", error));
  }, []);

  const handleCancelReservation = async (reservationId: number) => {
    await CancelReservations(reservationId);
    setReservationList((prev) => prev.filter((r) => r.reservationId !== reservationId));
  };

  const grouped = TAB_STATUSES.map((status) =>
    reservationList.filter((r) => {
      if (r.status in ["USAGE_COMPLETED", "CHECKOUT_COMPLETED"])
        return true;
      else
        return r.status === status
    }),
  );

  const activeReservations = grouped[activeIndex];

  return (
    <section className="flex flex-col gap-4 mt-20">
      <h2 className="text-text-primary text-2xl font-bold">내 예약 내역</h2>
      <span className="text-text-secondary text-sm">예정 • 진행 중 • 지난 예약을 한 곳에서 관리해 보세요!</span>

      <Tab
        tabs={TAB_STATUSES.map((status, i) => ({ label: status, count: grouped[i].length }))}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />

      <div className="flex flex-col">
        {activeReservations.length === 0 ? (
          <MyReservationListEmptyState />
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
