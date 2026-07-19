import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  HostReservation,
  MockHostSpace,
} from "@/features/host-manage/api/mock_host_data";
import Authentication from "@/features/guest-explore/components/contract/Authentication";
import SignatureBoard from "@/features/guest-explore/components/contract/SignatureBoard";

interface HostContractModalProps {
  isOpen: boolean;
  reservation: HostReservation;
  space: MockHostSpace;
  onClose: () => void;
  onComplete: () => void;
}

const formatHostDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${dayNames[d.getDay()]})`;
};

const getDurationDays = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

const HostContractModal = ({
  isOpen,
  reservation,
  space,
  onClose,
  onComplete,
}: HostContractModalProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  if (!isOpen) return null;

  const { startDate, endDate, totalPrice } = reservation;
  const platformFee = Math.round(totalPrice * 0.1);
  const netAmount = totalPrice - platformFee;
  const days = getDurationDays(startDate, endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden={true} />
      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-[590px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col gap-4 overflow-y-auto p-6">
          <h3 className="text-text-primary text-xl font-bold">단기 임대차 계약서</h3>
          <span className="text-text-secondary text-sm">
            {`임대인(이하 "호스트")가 임차인(이하 "게스트")은 다음과 같이 단기 공간 임대차 계약을 체결합니다.`}
          </span>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">공간</span>
              <span className="text-text-primary font-medium">{space.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">주소</span>
              <span className="text-text-primary font-medium">{space.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">기간</span>
              <span className="text-text-primary font-medium">
                {formatHostDate(startDate)} ~ {formatHostDate(endDate)} ({days}일)
              </span>
            </div>
          </div>

          <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">임대료</span>
              <span className="text-text-primary font-medium">{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">플랫폼 수수료 10%</span>
              <span className="text-text-primary font-medium">-{platformFee.toLocaleString()}원</span>
            </div>
          </div>

          <div className="border-border flex items-center justify-between border-t pt-4 font-bold">
            <span className="text-text-primary text-xl">총 수령 금액</span>
            <span className="text-xl">{netAmount.toLocaleString()}원</span>
          </div>

          <div className="bg-contract-guide-bg flex flex-col gap-2 rounded-lg p-3">
            <div className="flex flex-col gap-1">
              <span className="text-primary text-sm font-medium">제 1조(목적)</span>
              <span className="text-text-secondary text-sm">
                호스트는 상기 공간을 게스트에게 단기 임대하며, 게스트는 약정된 용도로만 사용합니다.
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-primary text-sm font-medium">제 2조(보증금)</span>
              <span className="text-text-secondary text-sm">
                보증금은 에스크로 계좌에 보관되며, 퇴실 시 공간 상태 점검 후 이상이 없을 경우 전액 환불됩니다.
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-primary text-sm font-medium">제 3조(원상복구)</span>
              <span className="text-text-secondary text-sm">
                게스트 사용 종료 시 공간을 입주 전 상태로 원상복구해야 합니다.
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-primary text-sm font-medium">제 4조(보험)</span>
              <span className="text-text-secondary text-sm">
                단기 공간 보험은 임대 기간 중 우발적 사고로 인한 손해를 보장합니다.
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-primary text-sm font-medium">제 5조(이웃 화합)</span>
              <span className="text-text-secondary text-sm">
                게스트는 소음, 대기열, 쓰레기 관리 등 이웃 화합 가이드를 준수해야 합니다.
              </span>
            </div>
          </div>

          <Authentication onIsAuthenticated={setIsAuthenticated} />
          <SignatureBoard onIsSigned={setIsSigned} />

          <div className="flex flex-row justify-center gap-5">
            <button
              className="bg-contract-guide-bg w-40 rounded-lg py-3 text-text-secondary"
              onClick={() => navigate("/host/reservations")}
            >
              취소
            </button>
            <button
              disabled={!(isAuthenticated && isSigned)}
              onClick={onComplete}
              className="bg-primary-hover flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  fill="currentColor"
                />
              </svg>
              전자 계약서 서명하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostContractModal;
