import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Tab from "@/shared/components/Tab";
import Modal from "@/shared/components/Modal";
import { HostReservationCard } from "@/features/host-manage/components/HostReservationCard";
import HostPaymentModal from "@/features/host-manage/components/contract/HostPaymentModal";
import HostContractModal from "@/features/host-manage/components/contract/HostContractModal";
import {
  fetchHostReservations,
  approveReservation,
  rejectReservation,
  approveCheckout,
  rejectCheckout,
  fetchCheckoutPhotos,
} from "@/features/host-manage/api/hostApi";
import type { ApiHostReservation, ReservationStatus } from "@/types";

const TAB_STATUS: ReservationStatus[] = [
  "PENDING_APPROVAL",
  "APPROVED",
  "CONTRACT_COMPLETED",
  "IN_USE",
  "CHECKOUT_COMPLETED",
];

const TAB_LABELS = ["승인 대기", "계약 대기", "계약 완료", "사용 중", "사용 완료"];
const EMPTY_MESSAGES = [
  "승인 대기 중인 예약이 없어요",
  "계약 대기 중인 예약이 없어요",
  "계약 완료된 예약이 없어요",
  "현재 사용 중인 예약이 없어요",
  "사용 완료된 예약이 없어요",
];

export const HostReservationPage = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ApiHostReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // 예약 거절
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

  // 예약 승인 → 계약 모달
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [agreedToGuide, setAgreedToGuide] = useState(false);


  const loadReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(false);
      const all: ApiHostReservation[] = [];
      let cursor: string | undefined = undefined;
      while (true) {
        const result = await fetchHostReservations({ size: 50, cursor });
        all.push(...(result.reservations ?? []));
        if (!result.hasNext || result.nextCursor == null) break;
        cursor = result.nextCursor;
      }
      setReservations(all);
    } catch (err) {
      console.error("[HostReservationPage] 예약 로드 실패:", err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const matchesTab = (r: ApiHostReservation, status: ReservationStatus) =>
    status === "CHECKOUT_COMPLETED"
      ? r.status === "USAGE_COMPLETED"
      : r.status === status;

  const getTabCount = (status: ReservationStatus) =>
    reservations.filter((r) => matchesTab(r, status)).length;

  const tabs = TAB_LABELS.map((label, i) => ({
    label,
    count: getTabCount(TAB_STATUS[i]),
  }));

  const filtered = reservations.filter((r) => matchesTab(r, TAB_STATUS[activeTab]));

  // 퇴실 사진 갤러리
  const [photoViewTarget, setPhotoViewTarget] = useState<ApiHostReservation | null>(null);
  const [checkoutPhotos, setCheckoutPhotos] = useState<string[]>([]);
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // 퇴실 승인/거부
  const [checkoutApproveTargetId, setCheckoutApproveTargetId] = useState<number | null>(null);
  const [checkoutRejectTargetId, setCheckoutRejectTargetId] = useState<number | null>(null);

  const rejectTarget = reservations.find((r) => r.reservationId === rejectTargetId);
  const checkoutApproveTarget = reservations.find((r) => r.reservationId === checkoutApproveTargetId);
  const checkoutRejectTarget = reservations.find((r) => r.reservationId === checkoutRejectTargetId);

  const handleApproveClick = (id: number) => {
    setApproveTargetId(id);
    setAgreedToGuide(false);
    setIsPaymentModalOpen(true);
  };

  const handleContractComplete = async () => {
    if (approveTargetId === null) return;
    try {
      const result = await approveReservation(approveTargetId);
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === approveTargetId ? { ...r, status: result.status } : r,
        ),
      );
    } catch {
      await loadReservations();
    }
    setIsContractModalOpen(false);
    setApproveTargetId(null);
  };

  const handleReject = async () => {
    if (rejectTargetId === null) return;
    try {
      const result = await rejectReservation(rejectTargetId);
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === rejectTargetId ? { ...r, status: result.status } : r,
        ),
      );
    } catch {
      await loadReservations();
    }
    setRejectTargetId(null);
  };

  const handleCheckoutApprove = async () => {
    if (checkoutApproveTargetId === null) return;
    try {
      const result = await approveCheckout(checkoutApproveTargetId);
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === checkoutApproveTargetId ? { ...r, status: result.status } : r,
        ),
      );
    } catch {
      await loadReservations();
    }
    setCheckoutApproveTargetId(null);
  };

  const handleCheckoutReject = async () => {
    if (checkoutRejectTargetId === null) return;
    try {
      const result = await rejectCheckout(checkoutRejectTargetId);
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === checkoutRejectTargetId
            ? { ...r, status: result.status, isPhotoVerified: false }
            : r,
        ),
      );
    } catch {
      await loadReservations();
    }
    setCheckoutRejectTargetId(null);
  };

  const openPhotoView = async (reservation: ApiHostReservation) => {
    setPhotoViewTarget(reservation);
    setPhotoIndex(0);
    setCheckoutPhotos([]);
    setIsPhotosLoading(true);
    try {
      const photos = await fetchCheckoutPhotos(reservation.reservationId);
      setCheckoutPhotos(photos);
    } catch {
      setCheckoutPhotos([]);
    } finally {
      setIsPhotosLoading(false);
    }
  };

  const approveTarget = reservations.find((r) => r.reservationId === approveTargetId);

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

        {isLoading ? (
          <div className="bg-tag-bg flex h-[224px] w-full items-center justify-center rounded-xl">
            <p className="text-text-primary text-xl font-medium">불러오는 중...</p>
          </div>
        ) : loadError ? (
          <div className="bg-tag-bg flex h-[224px] w-full flex-col items-center justify-center gap-3 rounded-xl">
            <p className="text-text-primary text-xl font-medium">예약 목록을 불러오지 못했어요</p>
            <button
              onClick={loadReservations}
              className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-medium"
            >
              다시 시도
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col">
            {filtered.map((reservation) => (
              <HostReservationCard
                key={reservation.reservationId}
                reservation={reservation}
                onDetail={() => navigate(`/host/spaces/${reservation.space.spaceId}`)}
                onApprove={() => handleApproveClick(reservation.reservationId)}
                onReject={() => setRejectTargetId(reservation.reservationId)}
                onPhotoView={() => openPhotoView(reservation)}
                onCheckoutApprove={() => setCheckoutApproveTargetId(reservation.reservationId)}
                onCheckoutReject={() => setCheckoutRejectTargetId(reservation.reservationId)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-tag-bg flex h-[224px] w-full items-center justify-center rounded-xl">
            <p className="text-text-primary text-xl font-medium">
              {EMPTY_MESSAGES[activeTab]}
            </p>
          </div>
        )}
      </div>

      {/* 예약 거절 모달 */}
      <Modal
        isOpen={rejectTargetId !== null}
        title={`${rejectTarget?.guest.nickname ?? ""}님을\n예약 거절하시겠습니까?`}
        description="예약을 거절하면 승인대기 목록에서 삭제됩니다"
        confirmLabel="예약 거절"
        cancelLabel="돌아가기"
        onConfirm={handleReject}
        onCancel={() => setRejectTargetId(null)}
      />

      {/* 퇴실 승인 모달 */}
      <Modal
        isOpen={checkoutApproveTargetId !== null}
        title={`${checkoutApproveTarget?.guest.nickname ?? ""}님의 퇴실을\n승인하시겠습니까?`}
        description="승인 시 게스트에게 보증금이 전액 환불됩니다"
        confirmLabel="승인하기"
        cancelLabel="돌아가기"
        onConfirm={handleCheckoutApprove}
        onCancel={() => setCheckoutApproveTargetId(null)}
      />

      {/* 퇴실 거부 모달 */}
      <Modal
        isOpen={checkoutRejectTargetId !== null}
        title={`${checkoutRejectTarget?.guest.nickname ?? ""}님의 퇴실 인증을\n거절하시겠습니까?`}
        description={`거절 시 게스트에게 알림이 발송되며,\n재인증 전까지 보증금 환불이 보류됩니다`}
        confirmLabel="거절하기"
        cancelLabel="돌아가기"
        onConfirm={handleCheckoutReject}
        onCancel={() => setCheckoutRejectTargetId(null)}
      />

      {/* 퇴실 사진 갤러리 모달 */}
      {photoViewTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPhotoViewTarget(null)}
        >
          <div
            className="relative flex w-full max-w-[800px] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
              onClick={() => setPhotoViewTarget(null)}
              aria-label="닫기"
            >
              ✕
            </button>
            {isPhotosLoading ? (
              <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-black/50">
                <span className="text-white">사진 불러오는 중...</span>
              </div>
            ) : checkoutPhotos.length > 0 ? (
              <>
                <img
                  src={checkoutPhotos[photoIndex]}
                  alt={`퇴실 사진 ${photoIndex + 1}`}
                  className="max-h-[600px] w-full rounded-xl object-contain"
                />
                <span className="mt-3 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                  {photoIndex + 1} / {checkoutPhotos.length}
                </span>
                {checkoutPhotos.length > 1 && (
                  <>
                    <button
                      className="absolute top-1/2 left-4 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
                      onClick={() => setPhotoIndex((i) => (i - 1 + checkoutPhotos.length) % checkoutPhotos.length)}
                      aria-label="이전 사진"
                    >
                      ‹
                    </button>
                    <button
                      className="absolute top-1/2 right-4 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
                      onClick={() => setPhotoIndex((i) => (i + 1) % checkoutPhotos.length)}
                      aria-label="다음 사진"
                    >
                      ›
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-black/50">
                <span className="text-white">사진을 불러올 수 없습니다</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 입금 예정 / 계약서 모달 */}
      {approveTarget && (
        <>
          <HostPaymentModal
            isOpen={isPaymentModalOpen}
            reservation={approveTarget}
            space={{
              name: approveTarget.space.buildingName,
              address: approveTarget.space.address,
            }}
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
            reservation={approveTarget}
            space={{
              name: approveTarget.space.buildingName,
              address: approveTarget.space.address,
            }}
            onClose={() => {
              setIsContractModalOpen(false);
              setApproveTargetId(null);
            }}
            onComplete={handleContractComplete}
          />
        </>
      )}
    </div>
  );
};
