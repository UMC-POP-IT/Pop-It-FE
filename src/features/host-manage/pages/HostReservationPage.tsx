import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Tab from "@/shared/components/Tab";
import Modal from "@/shared/components/Modal";
import { HostReservationCard } from "@/features/host-manage/components/HostReservationCard";
import HostPaymentModal from "@/features/host-manage/components/contract/HostPaymentModal";
import HostContractModal from "@/features/host-manage/components/contract/HostContractModal";
import {
  mockHostReservations,
  mockGuests,
  mockHostSpaces,
  type HostReservation,
} from "@/features/host-manage/api/mock_host_data";

const TAB_STATUS: HostReservation["status"][] = [
  "PENDING",
  "APPROVED",
  "CONTRACTED",
  "IN_USE",
  "COMPLETED",
];

const getEffectiveStatus = (r: HostReservation): HostReservation["status"] => {
  if (r.status === "CONTRACTED") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(r.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(r.endDate);
    end.setHours(0, 0, 0, 0);
    if (start <= today && today <= end) return "IN_USE";
  }
  return r.status;
};

const filterByTab = (list: HostReservation[], tab: number): HostReservation[] =>
  list.filter((r) => getEffectiveStatus(r) === TAB_STATUS[tab]);

export const HostReservationPage = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<HostReservation[]>(mockHostReservations);
  const [activeTab, setActiveTab] = useState(0);

  // 예약 거절
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

  // 예약 승인 → 계약 모달
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [agreedToGuide, setAgreedToGuide] = useState(false);

  // 퇴실 사진 갤러리
  const [photoViewTarget, setPhotoViewTarget] = useState<HostReservation | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  // 퇴실 승인/거부
  const [checkoutApproveTargetId, setCheckoutApproveTargetId] = useState<number | null>(null);
  const [checkoutRejectTargetId, setCheckoutRejectTargetId] = useState<number | null>(null);

  const countByStatus = (status: HostReservation["status"]) =>
    reservations.filter((r) => getEffectiveStatus(r) === status).length;

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

  const checkoutApproveTarget = reservations.find((r) => r.id === checkoutApproveTargetId);
  const checkoutApproveGuest = checkoutApproveTarget
    ? mockGuests[checkoutApproveTarget.guestId]
    : null;

  const checkoutRejectTarget = reservations.find((r) => r.id === checkoutRejectTargetId);
  const checkoutRejectGuest = checkoutRejectTarget
    ? mockGuests[checkoutRejectTarget.guestId]
    : null;

  const handleApproveClick = (id: number) => {
    setApproveTargetId(id);
    setAgreedToGuide(false);
    setIsPaymentModalOpen(true);
  };

  const handleContractComplete = () => {
    if (approveTargetId === null) return;
    setReservations((prev) =>
      prev.map((r) => (r.id === approveTargetId ? { ...r, status: "CONTRACTED" } : r)),
    );
    setIsContractModalOpen(false);
    setApproveTargetId(null);
  };

  const handleReject = () => {
    if (rejectTargetId === null) return;
    setReservations((prev) =>
      prev.map((r) => (r.id === rejectTargetId ? { ...r, status: "CANCELLED" } : r)),
    );
    setRejectTargetId(null);
  };

  const handleCheckoutApprove = () => {
    if (checkoutApproveTargetId === null) return;
    setReservations((prev) => prev.filter((r) => r.id !== checkoutApproveTargetId));
    setCheckoutApproveTargetId(null);
  };

  const handleCheckoutReject = () => {
    if (checkoutRejectTargetId === null) return;
    // 거절 시 게스트에게 재인증 요청 → 목록에서는 그대로 유지 (사진만 초기화)
    setReservations((prev) =>
      prev.map((r) =>
        r.id === checkoutRejectTargetId ? { ...r, checkoutPhotoUrls: [] } : r,
      ),
    );
    setCheckoutRejectTargetId(null);
  };

  const openPhotoView = (reservation: HostReservation) => {
    setPhotoViewTarget(reservation);
    setPhotoIndex(0);
  };

  const photos = photoViewTarget?.checkoutPhotoUrls ?? [];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-primary text-[28px] font-bold">예약 관리</h1>
        <p className="text-lg font-medium text-[#747474]">
          예약 승인 과정을 한 곳에서 관리해 보세요!
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <Tab tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

        {filtered.length > 0 ? (
          <div className="flex flex-col">
            {filtered.map((reservation) => {
              const guest = mockGuests[reservation.guestId];
              const space = mockHostSpaces.find((s) => s.id === reservation.spaceId);
              if (!guest || !space) return null;
              return (
                <HostReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  guest={guest}
                  space={space}
                  onDetail={() => navigate(`/host/spaces/${space.id}`)}
                  onApprove={() => handleApproveClick(reservation.id)}
                  onReject={() => setRejectTargetId(reservation.id)}
                  onPhotoView={() => openPhotoView(reservation)}
                  onCheckoutApprove={() => setCheckoutApproveTargetId(reservation.id)}
                  onCheckoutReject={() => setCheckoutRejectTargetId(reservation.id)}
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

      {/* 예약 거절 모달 */}
      <Modal
        isOpen={rejectTargetId !== null}
        title={`${rejectGuest?.nickname ?? ""}님을\n예약 거절하시겠습니까?`}
        description="예약을 거절하면 승인대기 목록에서 삭제됩니다"
        confirmLabel="예약 거절"
        cancelLabel="돌아가기"
        onConfirm={handleReject}
        onCancel={() => setRejectTargetId(null)}
      />

      {/* 퇴실 승인 모달 */}
      <Modal
        isOpen={checkoutApproveTargetId !== null}
        title={`${checkoutApproveGuest?.nickname ?? ""}님의 퇴실을\n승인하시겠습니까?`}
        description="승인 시 게스트에게 보증금이 전액 환불됩니다"
        confirmLabel="승인하기"
        cancelLabel="돌아가기"
        onConfirm={handleCheckoutApprove}
        onCancel={() => setCheckoutApproveTargetId(null)}
      />

      {/* 퇴실 거부 모달 */}
      <Modal
        isOpen={checkoutRejectTargetId !== null}
        title={`${checkoutRejectGuest?.nickname ?? ""}님의 퇴실 인증을\n거절하시겠습니까?`}
        description={`거절 시 게스트에게 알림이 발송되며,\n재인증 전까지 보증금 환불이 보류됩니다`}
        confirmLabel="거절하기"
        cancelLabel="돌아가기"
        onConfirm={handleCheckoutReject}
        onCancel={() => setCheckoutRejectTargetId(null)}
      />

      {/* 퇴실 사진 갤러리 모달 */}
      {photoViewTarget && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPhotoViewTarget(null)}
        >
          <div
            className="relative flex w-full max-w-[800px] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 */}
            <button
              className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
              onClick={() => setPhotoViewTarget(null)}
              aria-label="닫기"
            >
              ✕
            </button>

            {/* 사진 */}
            <img
              src={photos[photoIndex]}
              alt={`퇴실 사진 ${photoIndex + 1}`}
              className="max-h-[600px] w-full rounded-xl object-contain"
            />

            {/* 인디케이터 */}
            <span className="mt-3 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
              {photoIndex + 1} / {photos.length}
            </span>

            {/* 이전 */}
            {photos.length > 1 && (
              <>
                <button
                  className="absolute top-1/2 left-4 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
                  onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                  aria-label="이전 사진"
                >
                  ‹
                </button>
                <button
                  className="absolute top-1/2 right-4 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
                  onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                  aria-label="다음 사진"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 입금 예정 / 계약서 모달 */}
      {(() => {
        const reservation = reservations.find((r) => r.id === approveTargetId);
        const space = reservation ? mockHostSpaces.find((s) => s.id === reservation.spaceId) : null;
        if (!reservation || !space) return null;
        return (
          <>
            <HostPaymentModal
              isOpen={isPaymentModalOpen}
              reservation={reservation}
              space={space}
              agreedToGuide={agreedToGuide}
              onAgreedToGuideChange={setAgreedToGuide}
              onClose={() => {
                setIsPaymentModalOpen(false);
                setApproveTargetId(null);
              }}
              onSignContract={() => {
                setIsPaymentModalOpen(false);
                setIsContractModalOpen(true);
              }}
            />
            <HostContractModal
              isOpen={isContractModalOpen}
              reservation={reservation}
              space={space}
              onClose={() => {
                setIsContractModalOpen(false);
                setApproveTargetId(null);
              }}
              onComplete={handleContractComplete}
            />
          </>
        );
      })()}
    </div>
  );
};
