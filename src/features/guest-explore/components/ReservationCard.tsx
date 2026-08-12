import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/shared/components/Modal";
import { GetPaymentInfo, GetPaymentInfoResponse, GetPresignedURL, Reservation, Status, SubmitCheckOutPhoto, UploadFileToPresignedURL } from "../api/my_reservation_api";
import PaymentModal from "@/features/guest-explore/components/contract/PaymentModal";
import ContractModal from "@/features/guest-explore/components/contract/ContractModal";
import PhotoVerificationModal from "@/features/guest-explore/components/PhotoVerificationModal";
import RejectedPhotoModal from "@/features/guest-explore/components/RejectedPhotoModal";
import { ReservationCardButtons } from "@/features/guest-explore/components/ReservationCardButtons";
import { formatDate } from "@/shared/utils/date";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: () => Promise<void> | void;
  autoOpenContract?: boolean;
  onAutoOpenContractHandled?: () => void;
}

interface CardMeta {
  label: string;
  showCancel: boolean;
  showContract: boolean;
  needsPhotoVerification: boolean;
  isPhotoRejected: boolean;
  isAwaitingHostApproval: boolean;
  isDone: boolean;
}

// 현재 사용 중인지 체크
// dateStr: "YYYY-MM-DD"
const toDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const isUsing = (start: string, end: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= toDate(start) && today <= toDate(end);
};

const getCardMeta = (r: Reservation): CardMeta => {
  if (r.status === "USAGE_COMPLETED" || r.status === "CHECKOUT_COMPLETED") {
      // 호스트가 퇴실 사진을 승인하는 순간 status가 CHECKOUT_COMPLETED로 확정되므로,
      // checkoutRejected(과거 거절 이력)와 무관하게 status만으로 "퇴실 완료" 여부를 판단한다.
      const isCheckoutApproved = r.status === "CHECKOUT_COMPLETED";
      // 게스트가 퇴실 사진을 이미 제출했지만(isPhotoVerified) 거절되지도 않은 채
      // 호스트의 승인만 기다리고 있는 상태
      const isAwaitingHostApproval = !isCheckoutApproved && r.isPhotoVerified && !r.checkoutRejected;
      return {
        label: isCheckoutApproved ? "퇴실 완료" : "이용 완료",
        showCancel: false,
        showContract: false,
        needsPhotoVerification: !isCheckoutApproved && !isAwaitingHostApproval,
        // status와 무관하게 서버 값을 그대로 담는 raw 필드. 현재는 아래 needsPhotoVerification이
        // isCheckoutApproved일 때 항상 false라 화면에 영향이 없지만, 이 필드를 gating 없이
        // 재사용하면 승인된 예약에서도 거절 UI가 뜨는 버그가 재발할 수 있으니 주의.
        isPhotoRejected: r.checkoutRejected,
        isAwaitingHostApproval,
        isDone: true
      };
  }

  if (r.status === "PAYMENT_COMPLETED" || r.status === "IN_USE")
    return {
      label: isUsing(r.startDate, r.endDate) ? "사용 중" : "계약 완료",
      showCancel: false,
      showContract: false,
      needsPhotoVerification: false,
      isPhotoRejected: false,
      isAwaitingHostApproval: false,
      isDone: false
    };

  // 승인은 됐지만 계약(서명)·결제 중 하나라도 안 끝난 상태 (결제 취소/실패 후 재시도 포함)
  if (r.status === "APPROVED" || r.status === "CONTRACT_COMPLETED")
    return {
      label: "승인 완료",
      showCancel: true,
      showContract: true,
      needsPhotoVerification: false,
      isPhotoRejected: false,
      isAwaitingHostApproval: false,
      isDone: false
    };

  return {
    label: "승인 대기",
    showCancel: true,
    showContract: false,
    needsPhotoVerification: false,
    isPhotoRejected: false,
    isAwaitingHostApproval: false,
    isDone: false
  };
};

export const ReservationCard = ({ reservation, onCancel, autoOpenContract, onAutoOpenContractHandled }: ReservationCardProps) => {
  const cardMeta = getCardMeta(reservation);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // 예약 취소 창 open 여부
  const [isCancelling, setIsCancelling] = useState(false); // 예약 취소 진행 중 여부
  const [isPaymentModalOpen, setisPaymentModalOpen] = useState(false); // 계약 전 결제 예정 / 총 결제 금액 창 open 여부
  const [isContractModalOpen, setIsContractModalOpen] = useState(false); // 계약서 확인 & 통합 본인 인증 & 전자서명 창 open 여부
  const [agreedToGuide, setAgreedToGuide] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false); // 퇴실 사진 인증 창 open 여부
  const [isRejectedPhotoModalOpen, setIsRejectedPhotoModalOpen] = useState(false); // 거절된 퇴실 사진 확인 창 open 여부
  const [isPhotoSubmitted, setIsPhotoSubmitted] = useState(false); // 이번 세션에서 사진 제출 완료(재조회 전까지 호스트 승인 대기로 표시) 여부
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false); // 사진 업로드 진행 중 여부
  const [paymentInfo, setPaymentInfo] = useState<GetPaymentInfoResponse | null>(null); // 결제 정보
  const [isPaymentInfoError, setIsPaymentInfoError] = useState(false); // 결제 정보 조회 실패 여부
  const [contractModalFocusAuth, setContractModalFocusAuth] = useState(false); // 인증 리다이렉트 복귀로 재오픈된 경우, 본인 인증/서명란이 보이도록 스크롤할지 여부
  const [isAutoOpenPaymentInfoErrorModalOpen, setIsAutoOpenPaymentInfoErrorModalOpen] = useState(false); // 인증 리다이렉트 복귀 시 결제 정보 조회가 실패해 계약서 모달을 못 연 경우 안내
  const [pendingPaymentModalOpen, setPendingPaymentModalOpen] = useState(false); // 결제 정보 없이 "계약 하기"를 눌러 재조회 중인 상태 - 도착하면 자동으로 결제 모달을 연다
  // paymentInfo 로딩 대기 중 사용자가 이 카드에서 다른 모달을 직접 연 적이 있는지 여부.
  // true면 뒤늦게 도착한 응답으로 계약서 모달을 강제로 띄우지 않는다(사용자가 이미 다른 액션을 시작했으므로).
  const userInteractedRef = useRef(false);

  const label = cardMeta.label;
  const needsPhotoVerification = cardMeta.needsPhotoVerification && !isPhotoSubmitted;
  const isPhotoRejected = cardMeta.isPhotoRejected && !isPhotoSubmitted;
  const isAwaitingHostApproval = cardMeta.isAwaitingHostApproval || isPhotoSubmitted;
  const { showCancel, showContract, isDone } = cardMeta;

  const navigate = useNavigate();

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleCancelReservation = async () => {
    if (isCancelling) return;
    try {
      setIsCancelling(true);
      await onCancel?.();
      setIsCancelModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("예약 취소에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePhotoVerificationComplete = async (files: File[]) => {
    if (isUploadingPhotos) return;
    try {
      setIsUploadingPhotos(true);
      const { uploads } = await GetPresignedURL({
        uploadType: "CHECKOUT_IMAGE",
        files: files.map((file) => ({ contentType: file.type })),
      });
      if (uploads.length !== files.length) throw new Error("업로드 URL 개수가 파일 개수와 일치하지 않습니다.");

      await Promise.all(uploads.map(({ presignedUrl }, index) => UploadFileToPresignedURL(presignedUrl, files[index])));

      await SubmitCheckOutPhoto(reservation.reservationId, {
        imageUrls: uploads.map(({ fileUrl }) => fileUrl),
      });

      setIsPhotoModalOpen(false);
      setIsPhotoSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("사진 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleSignContract = () => {
    setisPaymentModalOpen(false);
    setAgreedToGuide(false);
    setIsContractModalOpen(true);
    setContractModalFocusAuth(false);
  };

  const handleOpenCancelModal = () => {
    userInteractedRef.current = true;
    setIsCancelModalOpen(true);
  };

  const handleOpenPaymentModal = () => {
    userInteractedRef.current = true;
    if (paymentInfo) {
      setisPaymentModalOpen(true);
      return;
    }
    // 이미 재조회가 진행 중인데 버튼을 연타한 경우 - GetPaymentInfo가 중복으로 나가지 않도록 막는다.
    // (최초 로딩 중에 눌러 재조회가 시작되는 것 자체는 의도된 동작이라 여기서 막지 않는다)
    if (pendingPaymentModalOpen) return;
    // 결제 정보가 아직 없는 상태(로딩 중이거나 이전 조회가 실패한 경우) - 화면엔 티 내지 않고
    // 조용히 재조회만 하고, 도착하면 아래 effect가 결제 모달을 대신 열어준다.
    setPendingPaymentModalOpen(true);
    GetPaymentInfo(reservation.reservationId)
      .then((data) => {
        setPaymentInfo(data);
        setIsPaymentInfoError(false);
      })
      .catch((error) => {
        console.error(error);
        setIsPaymentInfoError(true);
        setPendingPaymentModalOpen(false);
        // 재조회까지 실패하면 화면에 아무 변화가 없어 버튼이 고장난 것처럼 보이므로 이때만 알린다.
        alert("결제 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      });
  };

  const handleOpenPhotoModal = () => {
    userInteractedRef.current = true;
    setIsPhotoModalOpen(true);
  };

  const handleOpenRejectedPhotoModal = () => {
    userInteractedRef.current = true;
    setIsRejectedPhotoModalOpen(true);
  };

  useEffect(() => {
    let ignore = false;

    const loadPaymentInfo = async (status: Status) => {
      if (status !== "APPROVED" && status !== "CONTRACT_COMPLETED") return;
      setIsPaymentInfoError(false);
      try {
        const data = await GetPaymentInfo(reservation.reservationId);
        if (!ignore) setPaymentInfo(data);
      } catch (error) {
        if (!ignore) {
          console.error(error);
          setIsPaymentInfoError(true);
        }
      }
    };

    setPaymentInfo(null);
    loadPaymentInfo(reservation.status);

    return () => {
      ignore = true;
    };
  }, [reservation.reservationId, reservation.status]);

  // "계약 하기" 클릭 시점엔 결제 정보가 없어 재조회만 하고 대기시켜둔 상태(pendingPaymentModalOpen)를,
  // 정보가 도착하면 이어서 결제 모달로 열어준다.
  useEffect(() => {
    if (!pendingPaymentModalOpen || !paymentInfo) return;
    setisPaymentModalOpen(true);
    setPendingPaymentModalOpen(false);
  }, [pendingPaymentModalOpen, paymentInfo]);

  // 계약서 모달에서 PASS 인증 중 모바일 리다이렉트로 페이지가 새로고침되어 모달이 닫혔던 경우,
  // 결제 정보가 다시 로드되는 시점에 원래 열려있던 계약서 모달을 자동으로 재오픈한다.
  // 결제 정보 조회 자체가 실패하면 paymentInfo가 계속 null로 남아 이 효과가 영원히 대기하고
  // 사용자는 인증을 마치고 돌아왔는데도 아무 반응이 없는 것처럼 보이므로, 실패 시에는 별도로 알린다.
  useEffect(() => {
    if (!autoOpenContract) return;
    if (isPaymentInfoError) {
      setIsAutoOpenPaymentInfoErrorModalOpen(true);
      onAutoOpenContractHandled?.();
      return;
    }
    if (!paymentInfo) return;
    if (userInteractedRef.current) {
      // 로딩 대기 중 사용자가 이미 다른 모달을 직접 열었다면, 뒤늦게 계약서 모달을 강제로 띄우지 않는다.
      onAutoOpenContractHandled?.();
      return;
    }
    setIsContractModalOpen(true);
    setContractModalFocusAuth(true);
    onAutoOpenContractHandled?.();
  }, [autoOpenContract, paymentInfo, isPaymentInfoError, onAutoOpenContractHandled]);

  return (
    <div className="border-divider flex items-start justify-between gap-7 border-b py-5 last:border-none">
      <div className="flex gap-7">
        {/* 이미지 — 360~767px(모바일)은 태블릿(277) 배치를 유지한 채 767에서 277로 자연스럽게 수렴, 768~1023px(태블릿) 277 고정, 1024px 이상 190*190 고정 */}
        <div className="bg-thumbnail-bg h-[clamp(140px,_19px_+_33.6vw,_277px)] w-[clamp(140px,_19px_+_33.6vw,_277px)] flex-shrink-0 overflow-hidden min-[1024px]:h-[190px] min-[1024px]:w-[190px]">
          <img
            src={reservation.space.thumbnailUrl}
            alt={reservation.space.buildingName}
            className="h-full w-full object-cover"
          />
        </div>

        {/* 텍스트 — min-h(고정 h 아님): 좁은 화면에서 줄바꿈 등으로 내용이 길어져도 박스가 함께 늘어나 아래 카드를 침범하지 않는다 */}
        <div className="flex min-h-[clamp(140px,_19px_+_33.6vw,_277px)] flex-col items-start justify-start gap-1 min-[1024px]:min-h-[190px] min-[1024px]:justify-between">
          <div className="flex flex-col items-start gap-2">
            <span className="text-primary text-[clamp(13px,_10.35px_+_0.735vw,_16px)] font-bold">{label}</span>
            <div className="flex flex-col items-start min-[1024px]:gap-1 max-[1024px]:gap-5">
              <p className="text-[clamp(17px,_14.35px_+_0.735vw,_20px)] font-bold text-black">{reservation.space.buildingName}</p>
              <p className="text-text-primary text-[clamp(13px,_10.35px_+_0.735vw,_16px)] font-medium">
                {formatDate(reservation.startDate)} ~ {formatDate(reservation.endDate)}
              </p>
            </div>
          </div>
          <p className="text-text-primary text-[clamp(15px,_12.35px_+_0.735vw,_18px)] font-medium">
            총 금액: <span className="font-bold">{reservation.totalPrice.toLocaleString()}</span>원
          </p>
          {!isDesktop && <div className="mt-auto w-full">
            <ReservationCardButtons
              spaceId={reservation.space.spaceId}
              isDone={isDone}
              needsPhotoVerification={needsPhotoVerification}
              isPhotoRejected={isPhotoRejected}
              isAwaitingHostApproval={isAwaitingHostApproval}
              showCancel={showCancel}
              showContract={showContract}
              onSpaceDetail={() => navigate(`/spaces/${reservation.space.spaceId}`)}
              onPhotoVerify={handleOpenPhotoModal}
              onShowRejectedPhoto={handleOpenRejectedPhotoModal}
              onCancelReservation={handleOpenCancelModal}
              onSignPayment={handleOpenPaymentModal}
            />
          </div>}
        </div>
      </div>

      {/* 데스크톱일 때 버튼 위치 — 이미지+텍스트 줄 오른쪽에 별도 칼럼 */}
      {isDesktop && <ReservationCardButtons
        spaceId={reservation.space.spaceId}
        isDone={isDone}
        needsPhotoVerification={needsPhotoVerification}
        isPhotoRejected={isPhotoRejected}
        isAwaitingHostApproval={isAwaitingHostApproval}
        showCancel={showCancel}
        showContract={showContract}
        onSpaceDetail={() => navigate(`/spaces/${reservation.space.spaceId}`)}
        onPhotoVerify={handleOpenPhotoModal}
        onShowRejectedPhoto={handleOpenRejectedPhotoModal}
        onCancelReservation={handleOpenCancelModal}
        onSignPayment={handleOpenPaymentModal}
      />}

      {/* Reservation Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        title={`${reservation.space.buildingName}\n예약을 취소하시겠습니까?`}
        description={'현재 승인 대기 상태로, 취소 시\n별도의 수수료가 발생하지 않습니다'}
        confirmLabel={isCancelling ? "취소 중..." : "예약 취소"}
        cancelLabel="돌아가기"
        confirmDisabled={isCancelling}
        onConfirm={handleCancelReservation}
        onCancel={() => setIsCancelModalOpen(false)}
      />

      {/* 인증 리다이렉트 복귀 후 결제 정보 조회 실패 안내 Modal */}
      <Modal
        isOpen={isAutoOpenPaymentInfoErrorModalOpen}
        title="결제 정보를 불러오지 못했습니다"
        description={"네트워크 상태를 확인한 후\n계약서 화면에서 다시 시도해주세요"}
        iconVariant="warning"
        singleButton
        confirmLabel="확인"
        onConfirm={() => setIsAutoOpenPaymentInfoErrorModalOpen(false)}
      />

      {/* Payment Modal */}
      {paymentInfo && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          reservation={reservation}
          agreedToGuide={agreedToGuide}
          onAgreedToGuideChange={setAgreedToGuide}
          onClose={() => setisPaymentModalOpen(false)}
          onSignContract={handleSignContract}
          paymentInfo={paymentInfo}
        />
      )}

      {/* Contract Modal */}
      {paymentInfo && (
        <ContractModal
          isOpen={isContractModalOpen}
          reservation={reservation}
          paymentInfo={paymentInfo}
          onClose={() => {
            setIsContractModalOpen(false);
            setContractModalFocusAuth(false);
          }}
          scrollToAuthOnOpen={contractModalFocusAuth}
        />
      )}

      {/* Photo Verification Modal */}
      <PhotoVerificationModal
        isOpen={isPhotoModalOpen}
        isSubmitting={isUploadingPhotos}
        onClose={() => setIsPhotoModalOpen(false)}
        onComplete={handlePhotoVerificationComplete}
      />

      {/* Rejected Photo Modal */}
      <RejectedPhotoModal
        isOpen={isRejectedPhotoModalOpen}
        reservationId={reservation.reservationId}
        onClose={() => setIsRejectedPhotoModalOpen(false)}
      />
    </div>
  );
};
