import { useState } from "react";
import Tab from "@/shared/components/Tab";
import {
  reservations,
  getReservationStatus,
  type ReservationStatus,
} from "@/features/guest-explore/api/mock_recommend_spaces";
import { ReservationCard } from "@/features/guest-explore/components/ReservationCard";

const TAB_STATUSES: ReservationStatus[] = ["예약 예정", "사용 중", "지난 예약"];

export const MyReservationList = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const grouped = TAB_STATUSES.map((status) =>
    reservations.filter((r) => getReservationStatus(r) === status),
  );
  const activeReservations = grouped[activeIndex];

  return (
    <section className="flex flex-col gap-4 mt-20">
      <h2 className="text-text-primary text-2xl font-bold">내 예약 내역</h2>
      <span className="text-text-secondary text-sm">예정 • 사용 중 • 지난 예약을 한 곳에서 관리해 보세요!</span>

      <Tab
        tabs={TAB_STATUSES.map((status, i) => ({ label: status, count: grouped[i].length }))}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />

      <div className="flex flex-col">
        {activeReservations.length === 0 ? (
          <div className="bg-tag-bg flex h-40 items-center justify-center rounded-lg">
            <p className="text-text-secondary text-sm">아직 예약한 공간이 없어요</p>
          </div>
        ) : (
          activeReservations.map((reservation, i) => (
            <ReservationCard
              key={`${reservation.space.name}-${reservation.start.year}-${reservation.start.month}-${reservation.start.day}-${i}`}
              reservation={reservation}
            />
          ))
        )}
      </div>
    </section>
  );
};
