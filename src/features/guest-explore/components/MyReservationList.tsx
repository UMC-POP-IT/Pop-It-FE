import { useEffect, useState } from "react";
import Tab from "@/shared/components/Tab";
import { CancelReservations, GetReservations, Reservation, Status } from "../api/my_reservation_api";
import { ReservationCard } from "@/features/guest-explore/components/ReservationCard";
import MyReservationListEmptyState from "@/features/guest-explore/components/MyReservationListEmptyState";

const TAB_STATUSES = ["예약 예정", "승인 완료", "계약 완료", "사용 중", "지난 예약"];

// TAB_STATUSES와 순서를 맞춘 탭별 매칭 상태값
const TAB_STATUS_MAP: Status[][] = [
  ["PENDING_APPROVAL"],
  ["APPROVED"],
  ["CONTRACT_COMPLETED"],
  ["IN_USE"],
  ["USAGE_COMPLETED", "CHECKOUT_COMPLETED"],
];

// TODO(mock-test): 탭별 확인용 임시 목데이터, 확인 끝나면 이 블록과 아래 useState 초기값을 원복할 것
const MOCK_RESERVATIONS: Reservation[] = [
  {
    reservationId: 9001,
    status: "PENDING_APPROVAL",
    statusDescription: "승인 대기",
    startDate: "2026-08-20",
    endDate: "2026-08-25",
    usagePurpose: "팝업스토어",
    totalPrice: 1500000,
    isPhotoVerified: false,
    space: { spaceId: 1, buildingName: "[목] 예약 예정 스페이스", address: "서울시 강남구", thumbnailUrl: "https://placehold.co/300x200?text=PENDING" },
    guest: { userId: 1, nickname: "테스트유저" },
  },
  {
    reservationId: 9002,
    status: "APPROVED",
    statusDescription: "승인 완료",
    startDate: "2026-08-20",
    endDate: "2026-08-25",
    usagePurpose: "팝업스토어",
    totalPrice: 1,
    isPhotoVerified: false,
    space: { spaceId: 2, buildingName: "[목] 승인 완료 스페이스", address: "서울시 마포구", thumbnailUrl: "https://placehold.co/300x200?text=APPROVED" },
    guest: { userId: 1, nickname: "테스트유저" },
  },
  {
    reservationId: 9003,
    status: "CONTRACT_COMPLETED",
    statusDescription: "계약 완료",
    startDate: "2026-08-10",
    endDate: "2026-08-15",
    usagePurpose: "팝업스토어",
    totalPrice: 1500000,
    isPhotoVerified: false,
    space: { spaceId: 3, buildingName: "[목] 계약 완료 스페이스", address: "서울시 종로구", thumbnailUrl: "https://placehold.co/300x200?text=CONTRACT" },
    guest: { userId: 1, nickname: "테스트유저" },
  },
  {
    reservationId: 9004,
    status: "IN_USE",
    statusDescription: "사용 중",
    startDate: "2026-07-25",
    endDate: "2026-08-05",
    usagePurpose: "팝업스토어",
    totalPrice: 1500000,
    isPhotoVerified: false,
    space: { spaceId: 4, buildingName: "[목] 사용 중 스페이스", address: "서울시 용산구", thumbnailUrl: "https://placehold.co/300x200?text=IN_USE" },
    guest: { userId: 1, nickname: "테스트유저" },
  },
  {
    reservationId: 9005,
    status: "USAGE_COMPLETED",
    statusDescription: "이용 완료(퇴실 승인 거절됨)",
    startDate: "2026-07-01",
    endDate: "2026-07-10",
    usagePurpose: "팝업스토어",
    totalPrice: 1500000,
    isPhotoVerified: false,
    space: { spaceId: 5, buildingName: "[목] 지난 예약 스페이스", address: "서울시 성동구", thumbnailUrl: "https://placehold.co/300x200?text=PAST" },
    guest: { userId: 1, nickname: "테스트유저" },
  },
];

export const MyReservationList = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reservationList, setReservationList] = useState<Reservation[]>(MOCK_RESERVATIONS);

  useEffect(() => {
    GetReservations()
      .then((data) => data) // TODO(mock-test): 목데이터 확인 중이라 실제 응답으로 덮어쓰지 않음. 확인 끝나면 setReservationList(data?.reservations ?? [])로 원복
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
