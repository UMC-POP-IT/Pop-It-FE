import { useState } from "react";
import Badge from "@/shared/components/Badge";
import Button from "@/shared/components/Button";
import Modal from "@/shared/components/Modal";
import type { DateInfo, Reservation } from "@/features/guest-explore/api/mock_spaces";
import shieldCheckIcon from "@/features/guest-explore/icons/shield-check.svg";

interface ReservationCardProps {
  reservation: Reservation;
}

interface CardMeta {
  label: string;
  showCancel: boolean;
  showContract: boolean;
  needsPhotoVerification: boolean;
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
    };
  }
  if (r.isApproved && r.isContracted)
    return { label: isUsing(r.start, r.end) ? "사용 중" : "계약 완료", showCancel: false, showContract: false, needsPhotoVerification: false};
  if (r.isApproved) return { label: "승인 완료", showCancel: true, showContract: true, needsPhotoVerification: false };
  return { label: "승인 대기", showCancel: true, showContract: false, needsPhotoVerification: false };
};

const formatDate = (d: DateInfo) =>
  `${d.year}.${String(d.month).padStart(2, "0")}.${String(d.day).padStart(2, "0")} (${d.day_type})`;

export const ReservationCard = ({ reservation }: ReservationCardProps) => {
  const { label, showCancel, showContract, needsPhotoVerification } = getCardMeta(reservation);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // 예약 취소 창 open 여부
  const [isContractModalOpen, setIsContractModalOpen] = useState(false); // 계약 전 결제 예정 / 총 결제 금액 창 open 여부
  const [isContractSignModalOpen, setIsContractSignModalOpen] = useState(false); // 계약서 확인 & 통합 본인 인증 & 전자서명 창 open 여부
  const [isContractDone, setIsContractDone] = useState(false); // 계약 마무리 여부
  const [agreedToGuide, setAgreedToGuide] = useState(false);

  const handleCancelReservation = () => {
    // TODO: 예약 취소 창 close
    setIsCancelModalOpen(false);
  };

  const handleSignContract = () => {
    // TODO: 계약 전자 서명 창 open
    setIsContractModalOpen(false);
    setAgreedToGuide(false);
    setIsContractSignModalOpen(true);
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
            <span className="self-end text-primary text-sm mr-14">사진 인증이 필요합니다 (필수)</span>
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
                  <Button variant="primary" size="sm">
                    사진 인증
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    인증 완료
                  </Button>
                ))}
              <Button className="!border-none !bg-gray-200 !text-black" variant="outline" size="sm">
                예약 상세
              </Button>
              {showCancel && (
                <Button variant="danger" size="sm" onClick={() => setIsCancelModalOpen(true)}>
                  예약 취소
                </Button>
              )}
              {showContract && (
                <Button variant="primary" size="sm" onClick={() => setIsContractModalOpen(true)}>
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

      {/* Contract Modal */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsContractModalOpen(false)} />
          <div className="relative z-10 flex w-[420px] flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-text-primary text-lg font-bold">결제 예정</h3>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">공간</span>
                <span className="text-text-primary font-medium">{reservation.space.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">기간</span>
                <span className="text-text-primary font-medium">
                  {formatDate(reservation.start)} ~ {formatDate(reservation.end)}
                </span>
              </div>
            </div>

            <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">임대료</span>
                <span className="text-text-primary font-medium">{reservation.total_cost.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">보증금(에스크로)</span>
                {/* TODO: 보증금 계산 로직 확정 후 반영 */}
                <span className="text-text-primary font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">단기 공간 보험료 5% 적용</span>
                {/* TODO: 보험료 계산 로직 확정 후 반영 */}
                <span className="text-text-primary font-medium">-</span>
              </div>
            </div>

            <div className="border-border flex items-center justify-between border-t pt-4 font-bold">
              <span className="text-text-primary text-base">총 결제 금액</span>
              <span className="text-lg">{reservation.total_cost.toLocaleString()}원</span>
            </div>

            <div className="bg-secure-payment-bg flex gap-2 rounded-lg p-3">
              <div className="flex flex-col gap-1">
                <div className="flex flex-row gap-1">
                  <img src={shieldCheckIcon} alt="보증금 및 보험 안내" className="h-5 w-5" />
                  <span className="text-primary text-sm">안전 결제 안내</span>
                </div>
                <p className="text-text-secondary text-xs">
                  보증금은 에스크로 계좌에서 안전하게 보관되며, 퇴실 시 공간 상태 확인 후 환불됩니다. 보험료는 단기
                  임대 기간 중 발생할 수 있는 우발적 손해를 보장합니다.
                </p>
              </div>
            </div>

            <label className="text-text-secondary flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                className="accent-primary mt-0.5"
                checked={agreedToGuide}
                onChange={(e) => setAgreedToGuide(e.target.checked)}
              />
              이웃 화합가이드에 동의합니다. (소음 관리, 대기열 관리, 쓰레기 처리 등 이웃과의 조화로운 공존을 위한
              가이드라인을 준수합니다.)
            </label>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="font-normal !border-none !bg-secure-payment-bg !text-text-secondary flex-1"
                onClick={() => setIsContractModalOpen(false)}
              >
                돌아가기
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 font-normal"
                disabled={!agreedToGuide}
                onClick={handleSignContract}
              >
                계약서 서명하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Sign Modal */}
      {isContractSignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsContractSignModalOpen(false)} />
          <div className="relative z-10 flex max-h-[85vh] w-[590px] flex-col gap-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-text-primary text-xl font-bold">단기 임대차 계약서</h3>
            <span className="text-text-secondary">
              {`임대인(이하 "호스트")가 임차인(이하 "게스트")은 다음과 같이 단기 공간 임대차 계약을 체결합니다.`}
            </span>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">공간</span>
                <span className="text-text-primary font-medium">{reservation.space.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">주소</span>
                <span className="text-text-primary font-medium">{reservation.space.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">기간</span>
                <span className="text-text-primary font-medium">
                  {formatDate(reservation.start)} ~ {formatDate(reservation.end)}
                </span>
              </div>
            </div>

            <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">임대료</span>
                <span className="text-text-primary font-medium">{reservation.total_cost.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">보증금(에스크로)</span>
                {/* TODO: 보증금 계산 로직 확정 후 반영 */}
                <span className="text-text-primary font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">단기 공간 보험료 5% 적용</span>
                {/* TODO: 보험료 계산 로직 확정 후 반영 */}
                <span className="text-text-primary font-medium">-</span>
              </div>
            </div>

            <div className="border-border flex items-center justify-between border-t pt-4 font-bold">
              <span className="text-text-primary text-xl">총 결제 금액</span>
              <span className="text-xl">{reservation.total_cost.toLocaleString()}원</span>
            </div>

            <div className="bg-contract-guide-bg flex flex-col gap-2 rounded-lg p-3">
              <div className="flex flex-col gap-1">
                <span className="text-primary text-sm font-medium">제 1조(목적)</span>
                <span className="text-text-secondary text-sm">
                  호스트는 상기 공간을 게스트에게 단기 임대하며, 게스트는 약정된 용도로만 사용합니다.
                </span>
              </div>
              <div className="flex flex-col gap-1 font-medium">
                <span className="text-primary text-sm">제 2조(보증금)</span>
                <span className="text-text-secondary text-sm">
                  보증금은 에스크로 계좌에 보관되며, 퇴실 시 공간 상태 점검 후 이상이 없을 경우 전액 환불됩니다.
                </span>
              </div>
              <div className="flex flex-col gap-1 font-medium">
                <span className="text-primary text-sm">제 3조(원상복구)</span>
                <span className="text-text-secondary text-sm">
                  게스트 사용 종료 시 공간을 입주 전 상태로 원상복구해야 합니다.
                </span>
              </div>
              <div className="flex flex-col gap-1 font-medium">
                <span className="text-primary text-sm">제 4조(보험)</span>
                <span className="text-text-secondary text-sm">
                  단기 공간 보험은 임대 기간 중 우발적 사고로 인한 손해를 보장합니다.
                </span>
              </div>
              <div className="flex flex-col gap-1 font-medium">
                <span className="text-primary text-sm">제 5조(이웃 화합)</span>
                <span className="text-text-secondary text-sm">
                  게스트는 소음, 대기열, 쓰레기 관리 등 이웃 화합 가이드를 준수해야 합니다.
                </span>
              </div>
            </div>

            <div className="text-text-primary text-xl font-bold">통합 본인 인증</div>
            <div className="border-border border rounded-md pt-4">
              간편인증하기
            </div>

            <div>
              <div className="text-text-primary text-xl font-bold">계약 전자 서명</div>
              <div className="text-text-secondary">서명란 (아래에 서명해주세요)</div>
            </div>
            <div className="bg-contract-guide-bg h-100 w-full border-border border rounded-md pt-4">
              전자서명
            </div>
            <div className="flex flex-row justify-center gap-5">
              <button className="bg-contract-guide-bg w-40 rounded-lg text-text-secondary" onClick={() => window.location.href = "/reservations"}>취소</button>
              <Button className="w-40" variant="primary" size="md" onClick={() => {setIsContractDone(true); setIsContractSignModalOpen(false)}}>작성 완료</Button>
            </div>
          </div>
        </div>
      )}

      {/*Complete Contract & Payment Modal */}
      {/* Modal 수정 후 수정 필요!! */}
      <Modal 
        isOpen={isContractDone} 
        title="계약작성 및 입금이 완료되었습니다" 
        description="계약일부터 바로 이용을 시작하실 수 있습니다" 
        confirmLabel="확인" 
        onConfirm={() => {setIsContractDone(false)}}
        onCancel={() => setIsContractDone(false)}
      />
    </div>
  );
};
