import { useEffect, useState } from "react";
import Tab from "@/shared/components/Tab";
import { CancelReservations, GetReservations, Reservation, Status } from "../api/my_reservation_api";
import { ReservationCard } from "@/features/guest-explore/components/ReservationCard";
import MyReservationListEmptyState from "@/features/guest-explore/components/MyReservationListEmptyState";

const TAB_STATUSES = ["예약 예정", "승인 완료", "계약 완료", "사용 중", "지난 예약"];

// TODO: 임시 목데이터 (퇴실 거절 UI 확인용) - 확인 끝나면 제거할 것
const MOCK_CHECKOUT_REJECTED_RESERVATION: Reservation = {
  reservationId: -999,
  status: "USAGE_COMPLETED",
  statusDescription: "이용 완료",
  startDate: "2026-06-23",
  endDate: "2026-06-23",
  usagePurpose: "임시 목데이터 (퇴실 거절 확인용)",
  totalPrice: 25000000,
  isPhotoVerified: true,
  checkoutRejected: true,
  space: {
    spaceId: -999,
    buildingName: "신사 어반빌딩",
    address: "서울 강남구 테헤란로 152",
    thumbnailUrl: "",
  },
  guest: {
    userId: -999,
    nickname: "테스트",
  },
};

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
      // TODO: 목데이터 추가 부분 - 퇴실 거절 UI 확인 끝나면 MOCK_CHECKOUT_REJECTED_RESERVATION 제거하고 원복할 것
      .then((data) => setReservationList([...(data?.reservations ?? []), MOCK_CHECKOUT_REJECTED_RESERVATION]))
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
