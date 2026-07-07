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

const filterByTab = (
  list: HostReservation[],
  tab: number,
): HostReservation[] => {
  if (tab === 0) return list.filter((r) => r.status === "PENDING");
  if (tab === 1)
    return list.filter(
      (r) => r.status === "IN_USE" || r.status === "CONFIRMED",
    );
  if (tab === 2)
    return list.filter(
      (r) => r.status === "COMPLETED" || r.status === "REJECTED",
    );
  return [];
};

export const HostReservationPage = () => {
  const [reservations, setReservations] =
    useState<HostReservation[]>(mockHostReservations);
  const [activeTab, setActiveTab] = useState(0);
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

  const pendingCount = reservations.filter(
    (r) => r.status === "PENDING",
  ).length;
  const inUseCount = reservations.filter(
    (r) => r.status === "IN_USE" || r.status === "CONFIRMED",
  ).length;
  const completedCount = reservations.filter(
    (r) => r.status === "COMPLETED" || r.status === "REJECTED",
  ).length;

  const tabs = [
    { label: "승인 대기", count: pendingCount },
    { label: "사용중", count: inUseCount },
    { label: "사용 완료", count: completedCount },
  ];

  const filtered = filterByTab(reservations, activeTab);

  const approveTarget = reservations.find((r) => r.id === approveTargetId);
  const approveGuest = approveTarget ? mockGuests[approveTarget.guestId] : null;

  const rejectTarget = reservations.find((r) => r.id === rejectTargetId);
  const rejectGuest = rejectTarget ? mockGuests[rejectTarget.guestId] : null;

  const handleApprove = () => {
    if (!approveTargetId) return;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === approveTargetId ? { ...r, status: "CONFIRMED" } : r,
      ),
    );
    setApproveTargetId(null);
  };

  const handleReject = () => {
    if (!rejectTargetId) return;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === rejectTargetId ? { ...r, status: "REJECTED" } : r,
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
                  onApprove={() => setApproveTargetId(reservation.id)}
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
              {activeTab === 1 && "현재 사용 중인 예약이 없어요"}
              {activeTab === 2 && "완료된 예약이 없어요"}
            </p>
          </div>
        )}
      </div>

      {/* 승인 확인 모달 */}
      <Modal
        isOpen={approveTargetId !== null}
        title={`${approveGuest?.nickname ?? ""}님을\n승인하시겠습니까?`}
        description="승인 시 게스트가 계약이 가능한 상태가 됩니다"
        confirmLabel="승인하기"
        cancelLabel="돌아가기"
        onConfirm={handleApprove}
        onCancel={() => setApproveTargetId(null)}
      />

      {/* 거절 확인 모달 */}
      <Modal
        isOpen={rejectTargetId !== null}
        title={`${rejectGuest?.nickname ?? ""}님을\n승인 취소하시겠습니까?`}
        description="승인을 취소하면 승인대기 목록에서 삭제됩니다"
        confirmLabel="승인 취소"
        cancelLabel="돌아가기"
        onConfirm={handleReject}
        onCancel={() => setRejectTargetId(null)}
      />
    </div>
  );
};
