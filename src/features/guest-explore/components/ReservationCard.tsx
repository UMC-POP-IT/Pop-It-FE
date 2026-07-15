import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "@/shared/components/Badge";
import Button from "@/shared/components/Button";
import Modal from "@/shared/components/Modal";
import type { DateInfo, Reservation } from "@/features/guest-explore/api/mock_spaces";
import PaymentModal from "@/features/guest-explore/components/contract/PaymentModal";
import ContractModal from "@/features/guest-explore/components/contract/ContractModal";

interface ReservationCardProps {
  reservation: Reservation;
}

interface CardMeta {
  label: string;
  showCancel: boolean;
  showContract: boolean;
  needsPhotoVerification: boolean;
  isPhotoRejected: boolean;
}

// 현재 사용 중인지 체크
const toDate = (d: DateInfo) => new Date(d.year, d.month - 1, d.day);

export const isUsing = (start: DateInfo, end: DateInfo): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= toDate(start) && today <= toDate(end);
};

const getCardMeta = (r: Reservation): CardMeta => {
  if (r.isDone) {
    return {
      label: r.isPhotoVerified ? "퇴실 완료" : "이용 완료",
      showCancel: false,
      showContract: false,
      needsPhotoVerification: !r.isPhotoVerified,
      isPhotoRejected: !r.isPhotoVerified && !!r.isPhotoRejected,
    };
  }
  if (r.isApproved && r.isContracted)
    return { label: isUsing(r.start, r.end) ? "사용 중" : "계약 완료", showCancel: false, showContract: false, needsPhotoVerification: false, isPhotoRejected: false };
  if (r.isApproved) return { label: "승인 완료", showCancel: true, showContract: true, needsPhotoVerification: false, isPhotoRejected: false };
  return { label: "승인 대기", showCancel: true, showContract: false, needsPhotoVerification: false, isPhotoRejected: false };
};

export const formatDate = (d: DateInfo) =>
  `${d.year}.${String(d.month).padStart(2, "0")}.${String(d.day).padStart(2, "0")} (${d.day_type})`;

export const ReservationCard = ({ reservation }: ReservationCardProps) => {
  const { label, showCancel, showContract, needsPhotoVerification, isPhotoRejected } = getCardMeta(reservation);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // 예약 취소 창 open 여부
  const [isPaymentModalOpen, setisPaymentModalOpen] = useState(false); // 계약 전 결제 예정 / 총 결제 금액 창 open 여부
  const [isContractModalOpen, setIsContractModalOpen] = useState(false); // 계약서 확인 & 통합 본인 인증 & 전자서명 창 open 여부
  const [isContractDone, setIsContractDone] = useState(false); // 계약 마무리 여부
  const [agreedToGuide, setAgreedToGuide] = useState(false);

  const navigate = useNavigate();

  const handleCancelReservation = () => {
    // TODO: 예약 취소 창 close
    setIsCancelModalOpen(false);
  };

  const handleSignContract = () => {
    // TODO: 계약 전자 서명 창 open
    setisPaymentModalOpen(false);
    setAgreedToGuide(false);
    setIsContractModalOpen(true);
  };

  return (
    <div className="border-border flex flex-col gap-4 border-b py-4 last:border-none sm:flex-row">
      <img
        src={reservation.space.imageUrls[0]}
        alt={reservation.space.name}
        className="flex items-center justify-center bg-tag-bg h-40 w-full flex-none sm:h-45 sm:w-45"
      />

      {/* Button */}
      <div className="flex flex-1 flex-col gap-1.5">
        <Badge variant="pending" label={label} />
        <span className="ml-2 text-text-primary text-base font-bold">{reservation.space.name}</span>
        <span className="ml-2 text-text-secondary text-sm">
          {formatDate(reservation.start)} ~ {formatDate(reservation.end)}
        </span>

        <div className="ml-2 mt-auto flex flex-col gap-1 pt-2">
          {needsPhotoVerification && (
            (reservation.isPhotoRejected ? 
              <span className="self-end text-red-400 text-sm mr-44 whitespace-pre-wrap">{"호스트가 퇴실 승인을\n거절했습니다 다시 인증해주세요"}</span> :
              <span className="self-end text-primary text-sm mr-14">사진 인증이 필요합니다 (필수)</span>
            )
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-secondary text-sm">
              총 금액:{" "}
              <span className="text-text-primary text-base font-bold">
                {reservation.total_cost.toLocaleString()}원
              </span>
            </span>
            <div className="flex gap-2">
              {reservation.isDone &&
                (needsPhotoVerification ? (
                  <>
                    <Button variant="primary" size="sm">
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
              <Button className="!border-none !bg-gray-200 !text-black" variant="outline" size="sm" onClick={() => navigate(`/spaces/${reservation.space.id}`)}>
                공간 상세
              </Button>
              {showCancel && (
                <Button variant="danger" size="sm" onClick={() => setIsCancelModalOpen(true)}>
                  예약 취소
                </Button>
              )}
              {showContract && (
                <Button variant="primary" size="sm" onClick={() => setisPaymentModalOpen(true)}>
                  계약 하기
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Reservation Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        title={`${reservation.space.name}\n예약을 취소하시겠습니까?`}
        description={'현재 승인 대기 상태로, 취소 시\n별도의 수수료가 발생하지 않습니다'}
        confirmLabel="예약 취소"
        cancelLabel="돌아가기"
        onConfirm={() => setIsCancelModalOpen(false)}
        onCancel={handleCancelReservation}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        reservation={reservation}
        agreedToGuide={agreedToGuide}
        onAgreedToGuideChange={setAgreedToGuide}
        onClose={() => setisPaymentModalOpen(false)}
        onSignContract={handleSignContract}
      />

      {/* Contract Modal */}
      <ContractModal
        isOpen={isContractModalOpen}
        reservation={reservation}
        onClose={() => setIsContractModalOpen(false)}
        onComplete={() => {
          setIsContractDone(true);
          setIsContractModalOpen(false);
        }}
      />

      {/* Complete Contract & Payment Modal */}
      <Modal 
        isOpen={isContractDone} 
        title="계약작성 및 입금이 완료되었습니다" 
        description="계약일부터 바로 이용을 시작하실 수 있습니다" 
        singleButton={true}
        confirmLabel="확인" 
        onConfirm={() => {setIsContractDone(false)}}
      />
    </div>
  );
};
