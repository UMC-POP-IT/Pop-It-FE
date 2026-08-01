import { useState } from "react";
import Button from "@/shared/components/Button";
import type { ApiHostReservation } from "@/types";
import Authentication from "@/features/guest-explore/components/contract/Authentication";
import SignatureBoard from "@/features/guest-explore/components/contract/SignatureBoard";
import { formatHostDate, getDurationDays } from "@/features/host-manage/utils/dateUtils";

interface SpaceBasicInfo {
  name: string;
  address: string;
}

interface HostContractModalProps {
  isOpen: boolean;
  reservation: ApiHostReservation;
  space: SpaceBasicInfo;
  onClose: () => void;
  onComplete: () => void;
}

const HostContractModal = ({
  isOpen,
  reservation,
  space,
  onClose,
  onComplete,
}: HostContractModalProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  if (!isOpen) return null;

  const { startDate, endDate, totalPrice } = reservation;
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
            {`임대인(이하 "호스트")과 임차인(이하 "게스트")은 공간 중개 플랫폼 '팝잇'을 통하여 다음과 같이 단기 공간 임대차 계약을 체결하며, 본 계약서에 기재된 임대 조건에 상호 합의합니다.`}
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
              <span className="text-text-secondary">보증금(에스크로)</span>
              <span className="text-text-primary font-medium">{Math.round(totalPrice * 0.2).toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">단기 공간 보험료 5% 적용</span>
              <span className="text-text-primary font-medium">{Math.round(totalPrice * 0.05).toLocaleString()}원</span>
            </div>
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
                보증금은 에스크로 계좌에 안전하게 보관되며, 퇴실 시 공간 상태 점검 후 이상이 없을 경우 전액 환불됩니다.
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
            <div className="flex flex-col gap-1">
              <span className="text-primary text-sm font-medium">제 6조(결제 및 정산)</span>
              <span className="text-text-secondary text-sm">
                본 계약에 따른 대금 결제, 에스크로 보관 및 호스트에 대한 최종 정산은 '팝잇'의 플랫폼 이용 약관 및 정책에 따릅니다.
              </span>
            </div>
          </div>

          <Authentication onIsAuthenticated={setIsAuthenticated} />
          <SignatureBoard onIsSigned={setIsSigned} />

          <div className="flex flex-row justify-center gap-5">
            <button
              className="bg-contract-guide-bg w-40 rounded-lg py-3 text-text-secondary"
              onClick={onClose}
            >
              취소
            </button>
            <Button
              variant="primary"
              size="md"
              className="w-40"
              disabled={!(isAuthenticated && isSigned)}
              onClick={onComplete}
            >
              작성 완료
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostContractModal;
