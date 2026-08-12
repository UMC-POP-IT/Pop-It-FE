import { useEffect, useState } from "react";
import Tab from "@/shared/components/Tab";
import { CancelReservations, GetReservations, RequestVerification, Reservation, Status } from "../api/my_reservation_api";
import { ReservationCard } from "@/features/guest-explore/components/ReservationCard";
import MyReservationListEmptyState from "@/features/guest-explore/components/MyReservationListEmptyState";
import Modal from "@/shared/components/Modal";
import { pollVerificationStatus } from "@/features/guest-explore/utils/verificationPolling";
import { useTossPaymentResultStore } from "@/store/tossPaymentResultStore";

const TAB_STATUSES = ["예약 예정", "승인 완료", "계약 완료", "사용 중", "지난 예약"];

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
  const [autoOpenReservationId, setAutoOpenReservationId] = useState<number | null>(null);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const paymentApprovedAt = useTossPaymentResultStore((s) => s.approvedAt);

  useEffect(() => {
    GetReservations()
      .then((data) => setReservationList(data?.reservations ?? []))
      .catch((error) => console.error("게스트 - 나의 예약 내역 조회 실패", error));
  }, []);

  // Toss 결제 승인이 위 최초 조회보다 늦게 끝나면 목록이 승인 전 상태로 남을 수 있어,
  // 승인이 완료되는 시점에 한 번 더 조회해 최신 상태로 맞춘다.
  useEffect(() => {
    if (paymentApprovedAt == null) return;
    GetReservations()
      .then((data) => setReservationList(data?.reservations ?? []))
      .catch((error) => console.error("게스트 - 나의 예약 내역 재조회 실패", error));
  }, [paymentApprovedAt]);

  // 계약서 모달에서 PASS 인증 중 모바일 리다이렉트로 페이지가 새로고침된 경우,
  // 돌아왔을 때 URL의 identityVerificationId로 서버에 인증을 확정 짓고
  // 원래 인증을 시작했던 예약의 탭·계약서 모달을 다시 열어준다.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const identityVerificationId = params.get("identityVerificationId");
    if (!identityVerificationId) return;

    let cancelled = false;
    const pendingReservationId = sessionStorage.getItem("pendingContractReservationId");

    const finalizeVerification = async () => {
      let verified = false;
      try {
        const result = await RequestVerification({ identityVerificationId });
        verified = result.isVerified;
      } catch (error) {
        console.error("[MyReservationList] 본인인증 확정 실패:", error);
      }

      // PortOne 인증 자체는 성공했지만 서버 반영이 지연됐을 수 있어 재조회로 한 번 더 확인한다.
      if (!verified) verified = await pollVerificationStatus(() => cancelled);
      if (cancelled) return;

      if (!verified) {
        // 서버 반영 지연이 아닌 영구 실패로 판단되는 경우: URL·세션의 식별자는 남겨둬서
        // 재조회 시(새로고침 등) 다시 시도할 수 있게 하고, 모달은 열지 않은 채 실패만 알린다.
        setVerificationFailed(true);
        return;
      }

      sessionStorage.removeItem("pendingContractReservationId");
      params.delete("identityVerificationId");
      params.delete("identityVerificationTxId");
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState(null, "", newUrl);
      if (pendingReservationId) setAutoOpenReservationId(Number(pendingReservationId));
    };

    finalizeVerification();

    return () => {
      cancelled = true;
    };
  }, []);

  // 재오픈 대상 예약이 속한 탭으로 이동해야 ReservationCard가 렌더링되어 모달을 열 수 있다.
  useEffect(() => {
    if (autoOpenReservationId == null || reservationList.length === 0) return;
    const targetIndex = TAB_STATUS_MAP.findIndex((statuses) =>
      reservationList.some((r) => r.reservationId === autoOpenReservationId && statuses.includes(r.status)),
    );
    if (targetIndex !== -1) setActiveIndex(targetIndex);
  }, [autoOpenReservationId, reservationList]);

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
              autoOpenContract={reservation.reservationId === autoOpenReservationId}
              onAutoOpenContractHandled={() => setAutoOpenReservationId(null)}
            />
          ))
        )}
      </div>

      <Modal
        isOpen={verificationFailed}
        title="본인인증 확인에 실패했습니다"
        description={"네트워크 상태를 확인한 후\n계약서 화면에서 다시 시도해주세요"}
        iconVariant="warning"
        singleButton
        confirmLabel="확인"
        onConfirm={() => setVerificationFailed(false)}
      />
    </section>
  );
};
