import type { Reservation } from "@/features/guest-explore/api/mock_spaces";
import { formatDate } from "@/features/guest-explore/components/ReservationCard";
import SignatureBoard from "./SignatureBoard";
import TossPayments from "./TossPayments";
import Authentication from "./Authentication";

interface ContractModalProps {
  isOpen: boolean;
  reservation: Reservation;
  onClose: () => void;
  onComplete: () => void;
}

const ContractModal = ({ isOpen, reservation, onClose, onComplete }: ContractModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden={true} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-[590px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true">
        <div className="flex flex-col gap-4 overflow-y-auto p-6">
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
                {formatDate(reservation.start)} ~ {formatDate(reservation.end) + " (3일)"}
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

          <Authentication />
          <SignatureBoard />

          <div className="flex flex-row justify-center gap-5">
            <button
              className="bg-contract-guide-bg w-40 rounded-lg text-text-secondary"
              onClick={() => (window.location.href = "/reservations")}
            >
              취소
            </button>
            <TossPayments
              amount={reservation.total_cost}
              orderId={"pop_it_1"}
              orderName={reservation.space.name}
              customerEmail="popit@gmail.com"
              customerMobilePhone="01012341234"
              customerName="popit"
              onComplete={onComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;
