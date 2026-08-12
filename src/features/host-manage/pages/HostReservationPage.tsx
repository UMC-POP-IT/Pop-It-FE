import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Tab from "@/shared/components/Tab";
import Modal from "@/shared/components/Modal";
import PhotoGalleryModal from "@/shared/components/PhotoGalleryModal";
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
  verifyIdentity,
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

  // 예약 승인 확인 모달
  const [approveConfirmTargetId, setApproveConfirmTargetId] = useState<number | null>(null);

  // 예약 승인 → 계약 모달
  const [approveTargetId, setApproveTargetId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [agreedToGuide, setAgreedToGuide] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState(false);


  // 모바일 포트원 redirect 복귀 시 URL 파라미터로 본인인증 확정 처리
  // 성공한 경우에만 파라미터를 제거해야 실패 시 페이지 재진입으로 재시도할 수 있다
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const identityVerificationId = params.get("identityVerificationId");
    if (!identityVerificationId) return;
    verifyIdentity(identityVerificationId).then(() => {
      params.delete("identityVerificationId");
      params.delete("identityVerificationTxId");
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    }).catch((err) => {
      console.error("[HostReservationPage] 본인인증 처리 실패:", err);
    });
  }, []);

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

  // PAYMENT_COMPLETED 상태는 날짜 기준으로 실효 status를 계산해 탭/라벨에 반영한다.
  // 백엔드가 IN_USE·USAGE_COMPLETED로 자동 전환하지 않으므로 프론트에서 처리한다.
  const computeEffectiveStatus = (r: ApiHostReservation): ReservationStatus => {
    if (r.status !== "PAYMENT_COMPLETED") return r.status;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [sy, sm, sd] = r.startDate.split("-").map(Number);
    const [ey, em, ed] = r.endDate.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    if (today >= start && today <= end) return "IN_USE";
    if (today > end) return "USAGE_COMPLETED";
    return "PAYMENT_COMPLETED";
  };

  const matchesTab = (r: ApiHostReservation, status: ReservationStatus) => {
    const effective = computeEffectiveStatus(r);
    if (status === "CHECKOUT_COMPLETED") return effective === "USAGE_COMPLETED";
    if (status === "APPROVED") return effective === "APPROVED" || effective === "CONTRACT_COMPLETED";
    if (status === "CONTRACT_COMPLETED") return effective === "PAYMENT_COMPLETED";
    return effective === status;
  };

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

  // 퇴실 승인/거부
  const [checkoutApproveTargetId, setCheckoutApproveTargetId] = useState<number | null>(null);
  const [checkoutRejectTargetId, setCheckoutRejectTargetId] = useState<number | null>(null);

  const approveConfirmTarget = reservations.find((r) => r.reservationId === approveConfirmTargetId);
  const rejectTarget = reservations.find((r) => r.reservationId === rejectTargetId);
  const checkoutApproveTarget = reservations.find((r) => r.reservationId === checkoutApproveTargetId);
  const checkoutRejectTarget = reservations.find((r) => r.reservationId === checkoutRejectTargetId);

  const handleApproveClick = (id: number) => {
    setApproveConfirmTargetId(id);
  };

  const handleApproveConfirm = () => {
    if (approveConfirmTargetId === null) return;
    setApproveTargetId(approveConfirmTargetId);
    setApproveConfirmTargetId(null);
    setAgreedToGuide(false);
    setApproveError(false);
    setIsPaymentModalOpen(true);
  };

  const handleSignContract = () => {
    setIsPaymentModalOpen(false);
    setIsContractModalOpen(true);
  };

  const closeContractModal = () => {
    setIsContractModalOpen(false);
    setApproveTargetId(null);
    // 서명 없이 닫으면 목록을 재조회하지 않는다 — 서버는 APPROVED지만 로컬은 현재 탭에 그대로 유지
  };

  const completeContractModal = () => {
    setIsContractModalOpen(false);
    setApproveTargetId(null);
    loadReservations();
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
        <h1 className="text-text-primary text-[24px] font-bold md:text-[28px]">예약 관리</h1>
        <p className="text-lg font-medium text-[#747474]">
          예약 승인 과정을 한 곳에서 관리해 보세요!
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <Tab tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} scrollOnMobile />

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
          <div className="flex flex-col gap-5">
            {filtered.map((reservation) => (
              <HostReservationCard
                key={reservation.reservationId}
                reservation={reservation}
                effectiveStatus={computeEffectiveStatus(reservation)}
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

      {/* 예약 승인 확인 모달 */}
      <Modal
        isOpen={approveConfirmTargetId !== null}
        title={`${approveConfirmTarget?.guest.nickname ?? ""}님을\n승인하시겠습니까?`}
        description="승인 시 게스트가 계약이 가능한 상태가 됩니다"
        confirmLabel="승인하기"
        cancelLabel="돌아가기"
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveConfirmTargetId(null)}
      />

      {/* 예약 거절 모달 */}
      <Modal
        isOpen={rejectTargetId !== null}
        title={`${rejectTarget?.guest.nickname ?? ""}님을\n예약 거절하시겠습니까?`}
        description={`예약 거절을 누를 시 ${rejectTarget?.guest.nickname ?? ""}님과의 계약이 종료됩니다`}
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
        title={`${checkoutRejectTarget?.guest.nickname ?? ""}님의 퇴실 인증을 거절하시겠습니까?`}
        description={`거절 시 게스트에게 알림이 발송되며,\n재인증 전까지 보증금 환불이 보류됩니다`}
        confirmLabel="거절하기"
        cancelLabel="돌아가기"
        onConfirm={handleCheckoutReject}
        onCancel={() => setCheckoutRejectTargetId(null)}
      />

      {/* 퇴실 사진 갤러리 모달 */}
      <PhotoGalleryModal
        isOpen={photoViewTarget !== null}
        photos={checkoutPhotos}
        isLoading={isPhotosLoading}
        onClose={() => setPhotoViewTarget(null)}
      />

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
            isSubmitting={isApproving}
            submitError={approveError}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setApproveTargetId(null);
              setApproveError(false);
            }}
            onSignContract={handleSignContract}
          />
          <HostContractModal
            isOpen={isContractModalOpen}
            reservation={approveTarget}
            space={{
              name: approveTarget.space.buildingName,
              address: approveTarget.space.address,
            }}
            onClose={closeContractModal}
            onComplete={completeContractModal}
          />
        </>
      )}
    </div>
  );
};
