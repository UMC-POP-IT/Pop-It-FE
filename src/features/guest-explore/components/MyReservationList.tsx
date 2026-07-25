import { useState } from "react";
import Tab from "@/shared/components/Tab";
import {
  reservations,
  getReservationStatus,
  cancelReservation,
  type ReservationStatus,
} from "@/features/guest-explore/api/mock_spaces";
import { ReservationCard } from "@/features/guest-explore/components/ReservationCard";
import MyReservationListEmptyState from "@/features/guest-explore/components/MyReservationListEmptyState";

const TAB_STATUSES: ReservationStatus[] = ["예약 예정", "승인 완료", "계약 완료", "사용 중" ,"지난 예약"];

export const MyReservationList = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reservationList, setReservationList] = useState(reservations);

  const handleCancelReservation = async (id: number) => {
    await cancelReservation(id);
    setReservationList((prev) => prev.filter((r) => r.id !== id));
  };

  const grouped = TAB_STATUSES.map((status) =>
    reservationList.filter((r) => getReservationStatus(r) === status),
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
              key={reservation.id}
              reservation={reservation}
              onCancel={() => handleCancelReservation(reservation.id)}
            />
          ))
        )}
      </div>
    </section>
  );
};
