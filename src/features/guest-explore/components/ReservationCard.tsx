import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "@/shared/components/Badge";
import Button from "@/shared/components/Button";
import Modal from "@/shared/components/Modal";
import { GetPaymentInfo, GetPaymentInfoResponse, GetPresignedURL, Reservation, Status, SubmitCheckOutPhoto, UploadFileToPresignedURL } from "../api/my_reservation_api";
import PaymentModal from "@/features/guest-explore/components/contract/PaymentModal";
import ContractModal from "@/features/guest-explore/components/contract/ContractModal";
import PhotoVerificationModal from "@/features/guest-explore/components/PhotoVerificationModal";
import { formatDate } from "@/shared/utils/date";

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: () => Promise<void> | void;
}

interface CardMeta {
  label: string;
  showCancel: boolean;
  showContract: boolean;
  needsPhotoVerification: boolean;
  isPhotoRejected: boolean;
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
      // isPhotoVerified(퇴실 사진 인증 완료 여부)가 true이고 checkoutRejected(호스트의 퇴실 거절 여부)가
      // false인 경우에만 "퇴실 완료"로 간주. 둘 중 하나라도 아니면(미인증 또는 거절) "이용 완료" +
      // 사진 인증 UI를 함께 노출한다.
      const isCheckoutApproved = r.isPhotoVerified && !r.checkoutRejected;
      return {
        label: isCheckoutApproved ? "퇴실 완료" : "이용 완료",
        showCancel: false,
        showContract: false,
        needsPhotoVerification: !isCheckoutApproved,
        isPhotoRejected: r.checkoutRejected,
        isDone: true
      };
  }

  if (r.status === "CONTRACT_COMPLETED" || r.status === "IN_USE")
    return {
      label: isUsing(r.startDate, r.endDate) ? "사용 중" : "계약 완료",
      showCancel: false,
      showContract: false,
      needsPhotoVerification: false,
      isPhotoRejected: false,
      isDone: false
    };

  if (r.status === "APPROVED")
    return {
      label: "승인 완료",
      showCancel: true,
      showContract: true,
      needsPhotoVerification: false,
      isPhotoRejected: false,
      isDone: false
    };

  return {
    label: "승인 대기",
    showCancel: true,
    showContract: false,
    needsPhotoVerification: false,
    isPhotoRejected: false,
    isDone: false
  };
};

export const ReservationCard = ({ reservation, onCancel }: ReservationCardProps) => {
  const cardMeta = getCardMeta(reservation);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // 예약 취소 창 open 여부
  const [isCancelling, setIsCancelling] = useState(false); // 예약 취소 진행 중 여부
  const [isPaymentModalOpen, setisPaymentModalOpen] = useState(false); // 계약 전 결제 예정 / 총 결제 금액 창 open 여부
  const [isContractModalOpen, setIsContractModalOpen] = useState(false); // 계약서 확인 & 통합 본인 인증 & 전자서명 창 open 여부
  const [agreedToGuide, setAgreedToGuide] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false); // 퇴실 사진 인증 창 open 여부
  const [isPhotoVerifiedDone, setIsPhotoVerifiedDone] = useState(false); // 사진 인증 완료 여부
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false); // 사진 업로드 진행 중 여부
  const [paymentInfo, setPaymentInfo] = useState<GetPaymentInfoResponse | null>(null); // 결제 정보
  const [isPaymentInfoError, setIsPaymentInfoError] = useState(false); // 결제 정보 조회 실패 여부

  const label = isPhotoVerifiedDone ? "퇴실 완료" : cardMeta.label;
  const needsPhotoVerification = cardMeta.needsPhotoVerification && !isPhotoVerifiedDone;
  const isPhotoRejected = cardMeta.isPhotoRejected && !isPhotoVerifiedDone;
  const { showCancel, showContract, isDone } = cardMeta;

  const navigate = useNavigate();

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
        photoUrls: uploads.map(({ fileUrl }) => fileUrl),
      });

      setIsPhotoModalOpen(false);
      setIsPhotoVerifiedDone(true);
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
  };

  useEffect(() => {
    let ignore = false;

    const loadPaymentInfo = async (status: Status) => {
      if (status !== "APPROVED") return;
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

  return (
    <div className="border-border flex flex-col gap-4 border-b py-4 last:border-none sm:flex-row">
      <img
        src={reservation.space.thumbnailUrl}
        alt={reservation.space.buildingName}
        className="flex items-center justify-center bg-tag-bg h-40 w-full flex-none sm:h-45 sm:w-45"
      />

      {/* Button */}
      <div className="flex flex-1 flex-col gap-1.5">
        <Badge variant="pending" label={label} />
        <span className="ml-2 text-text-primary text-base font-bold">{reservation.space.buildingName}</span>
        <span className="ml-2 text-text-secondary text-sm">
          {formatDate(reservation.startDate)} ~ {formatDate(reservation.endDate)}
        </span>

        <div className="ml-2 mt-auto flex flex-col gap-1 pt-2">
          {needsPhotoVerification && (
            (isPhotoRejected ?
              <span className="self-end text-red-400 text-sm mr-44 whitespace-pre-wrap">{"호스트가 퇴실 승인을\n거절했습니다 다시 인증해주세요"}</span> :
              <span className="self-end text-primary text-sm mr-14">사진 인증이 필요합니다 (필수)</span>
            )
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-secondary text-sm">
              총 금액:{" "}
              <span className="text-text-primary text-base font-bold">
                {reservation.totalPrice.toLocaleString()}원
              </span>
            </span>
            <div className="flex gap-2">
              {isDone &&
                (needsPhotoVerification ? (
                  <>
                    <Button variant="primary" size="sm" onClick={() => setIsPhotoModalOpen(true)}>
                      사진 인증
                    </Button>
                    {isPhotoRejected && (
                      <Button variant="outline" size="sm">
                        거절된 사진
                      </Button>
                    )}
                  </>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    인증 완료
                  </Button>
                ))}
              <Button className="border-none! bg-gray-200! text-black!" variant="outline" size="sm" onClick={() => navigate(`/spaces/${reservation.space.spaceId}`)}>
                공간 상세
              </Button>
              {showCancel && (
                <Button variant="danger" size="sm" onClick={() => setIsCancelModalOpen(true)}>
                  예약 취소
                </Button>
              )}
              {showContract && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!paymentInfo}
                  onClick={() => setisPaymentModalOpen(true)}
                >
                  계약 하기
                </Button>
              )}
              {showContract && isPaymentInfoError && (
                <span className="self-center text-red-400 text-sm">결제 정보를 불러오지 못했습니다</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
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
          onClose={() => setIsContractModalOpen(false)}
        />
      )}

      {/* Photo Verification Modal */}
      <PhotoVerificationModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onComplete={handlePhotoVerificationComplete}
      />
    </div>
  );
};
