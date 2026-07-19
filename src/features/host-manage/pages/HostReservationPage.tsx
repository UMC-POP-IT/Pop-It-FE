import { useState } from "react";
import Tab from "@/shared/components/Tab";
import Modal from "@/shared/components/Modal";
import { HostReservationCard } from "@/features/host-manage/components/HostReservationCard";
import {
  mockHostReservations,
  mockGuests,
  mockHostSpaces,
  type HostReservation,
} from "@/features/host-manage/api/mock_host_data";

// 탭 순서와 매칭되는 예약 상태
const TAB_STATUS: HostReservation["status"][] = [
  "PENDING", // 승인 대기
  "APPROVED", // 계약 대기
  "CONTRACTED", // 계약 완료
  "IN_USE", // 사용 중
  "COMPLETED", // 사용 완료
];

const filterByTab = (
  list: HostReservation[],
  tab: number,
): HostReservation[] => list.filter((r) => r.status === TAB_STATUS[tab]);

export const HostReservationPage = () => {
  const [reservations, setReservations] =
    useState<HostReservation[]>(mockHostReservations);
  const [activeTab, setActiveTab] = useState(0);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

  const countByStatus = (status: HostReservation["status"]) =>
    reservations.filter((r) => r.status === status).length;

  const tabs = [
    { label: "승인 대기", count: countByStatus("PENDING") },
    { label: "계약 대기", count: countByStatus("APPROVED") },
    { label: "계약 완료", count: countByStatus("CONTRACTED") },
    { label: "사용 중", count: countByStatus("IN_USE") },
    { label: "사용 완료", count: countByStatus("COMPLETED") },
  ];

  const filtered = filterByTab(reservations, activeTab);

  const rejectTarget = reservations.find((r) => r.id === rejectTargetId);
  const rejectGuest = rejectTarget ? mockGuests[rejectTarget.guestId] : null;

  const handleApprove = (id: number) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)),
    );
  };

  const handleReject = () => {
    if (rejectTargetId === null) return;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === rejectTargetId ? { ...r, status: "CANCELLED" } : r,
      ),
    );
    setRejectTargetId(null);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-text-primary text-[28px] font-bold">예약 관리</h1>
        <p className="text-lg font-medium text-[#747474]">
          예약 승인 과정을 한 곳에서 관리해 보세요!
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* 탭 */}
        <Tab
          tabs={tabs}
          activeIndex={activeTab}
          onChange={setActiveTab}
        />

        {/* 예약 목록 */}
        {filtered.length > 0 ? (
          <div className="flex flex-col">
            {filtered.map((reservation) => {
              const guest = mockGuests[reservation.guestId];
              const space = mockHostSpaces.find(
                (s) => s.id === reservation.spaceId,
              );
              if (!guest || !space) return null;
              return (
                <HostReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  guest={guest}
                  space={space}
                  onGuestDetail={() => {}}
                  onDetail={() => {}}
                  onApprove={() => handleApprove(reservation.id)}
                  onReject={() => setRejectTargetId(reservation.id)}
                  onPhotoView={() => {}}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-tag-bg flex h-[224px] w-full items-center justify-center rounded-xl">
            <p className="text-text-primary text-xl font-medium">
              {activeTab === 0 && "승인 대기 중인 예약이 없어요"}
              {activeTab === 1 && "계약 대기 중인 예약이 없어요"}
              {activeTab === 2 && "계약 완료된 예약이 없어요"}
              {activeTab === 3 && "현재 사용 중인 예약이 없어요"}
              {activeTab === 4 && "사용 완료된 예약이 없어요"}
            </p>
          </div>
        )}
      </div>

      {/* 거절 확인 모달 */}
      <Modal
        isOpen={rejectTargetId !== null}
        title={`${rejectGuest?.nickname ?? ""}님을\n예약 거절하시겠습니까?`}
        description="예약을 거절하면 승인대기 목록에서 삭제됩니다"
        confirmLabel="승인 취소"
        cancelLabel="돌아가기"
        onConfirm={handleReject}
        onCancel={() => setRejectTargetId(null)}
      />
    </div>
  );
};
