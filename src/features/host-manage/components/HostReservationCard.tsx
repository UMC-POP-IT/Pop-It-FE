import type { ApiHostReservation, ReservationStatus } from "@/types";
import iconPerson from "@/assets/icons/icon_person.svg";

interface HostReservationCardProps {
  reservation: ApiHostReservation;
  effectiveStatus?: ReservationStatus;
  onDetail?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPhotoView?: () => void;
  onCheckoutApprove?: () => void;
  onCheckoutReject?: () => void;
}

const STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDING_APPROVAL: "승인 대기",
  APPROVED: "계약 대기",
  CONTRACT_COMPLETED: "계약 대기",
  PAYMENT_COMPLETED: "계약 완료",
  IN_USE: "사용 중",
  USAGE_COMPLETED: "사용 완료",
  CHECKOUT_COMPLETED: "사용 완료",
  CANCELLED: "취소됨",
};

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${days[d.getDay()]})`;
};

export const HostReservationCard = ({
  reservation,
  effectiveStatus,
  onDetail,
  onApprove,
  onReject,
  onPhotoView,
  onCheckoutApprove,
  onCheckoutReject,
}: HostReservationCardProps) => {
  const { status, startDate, endDate, totalPrice, usagePurpose, guest, space, isPhotoVerified } = reservation;
  const displayStatus = effectiveStatus ?? status;

  return (
    <div>
      {/* 예약자 정보 — 연한 파란 배경 */}
      <div className="bg-info-bg flex items-start justify-between gap-3 rounded-xl px-6 py-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
              <img
                src={iconPerson}
                alt=""
                className="h-5 w-5"
              />
            </div>
            <span className="text-text-primary text-[20px] font-bold">
              {guest.nickname}
            </span>
          </div>
          <p className="text-text-tag line-clamp-1 text-[14px] font-medium">
            {usagePurpose}
          </p>
        </div>
      </div>

      {/* 공간 정보 — 모바일·태블릿은 이미지+텍스트 위, 버튼 아래(세로) / 데스크탑(1024~)만 한 줄(가로) */}
      <div className="border-divider flex flex-col gap-5 border-b py-5 min-[1024px]:flex-row min-[1024px]:items-end min-[1024px]:justify-between min-[1024px]:gap-7">
        <div className="flex items-start gap-3 md:gap-7">
          {/* 이미지 — 모바일 150px(정사각), 태블릿 148px, 데스크탑 190px */}
          <div className="bg-thumbnail-bg aspect-square w-[150px] flex-shrink-0 overflow-hidden md:aspect-auto md:h-[190px] md:w-[190px] min-[768px]:max-[1023px]:h-[148px] min-[768px]:max-[1023px]:w-[148px]">
            {space.thumbnailUrl && (
              <img
                src={space.thumbnailUrl}
                alt={space.buildingName}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* 텍스트 */}
          <div className="flex flex-1 min-w-0 flex-col items-start justify-between md:w-[258px] md:flex-none min-[768px]:max-[1023px]:h-[148px] min-[1024px]:h-[190px]">
            <div className="flex flex-col items-start gap-2">
              <span className="text-primary text-base font-bold">
                {STATUS_LABEL[displayStatus]}
              </span>
              <div className="flex flex-col items-start gap-1">
                <p className="w-full truncate text-xl font-bold text-black">{space.buildingName}</p>
                {/* 모바일은 시작일/~/종료일 세 줄, 태블릿+는 한 줄 (Figma 5299:34808 확인) */}
                <div className="text-text-primary flex flex-col items-start text-base font-medium md:flex-row md:items-center md:gap-1">
                  <span>{formatDate(startDate)}</span>
                  <span>~</span>
                  <span>{formatDate(endDate)}</span>
                </div>
              </div>
            </div>
            <div className="text-text-primary flex items-center gap-2 text-base font-medium md:text-lg">
              <span>총 금액:</span>
              <span>
                <span className="font-bold">{totalPrice.toLocaleString()}</span>원
              </span>
            </div>
          </div>
        </div>

        {/* 버튼 — 고정폭(모바일 104px, 태블릿+ 108px), 글씨는 항상 한 줄(whitespace-nowrap) */}
        <div className="flex min-h-[84px] w-full flex-shrink-0 flex-col items-start justify-end gap-2 min-[1024px]:h-[190px] min-[1024px]:min-h-0 min-[1024px]:w-auto min-[1024px]:items-end min-[1024px]:justify-end">
          {status === "PENDING_APPROVAL" && (
            <div className="flex w-full flex-wrap items-center gap-1 md:w-auto">
              <button
                onClick={onDetail}
                className="bg-surface-blue text-text-primary hover:bg-primary-light h-10 w-[104px] rounded-lg px-6 py-1.5 text-base font-bold whitespace-nowrap md:w-auto"
              >
                공간 상세
              </button>
              <button
                onClick={onReject}
                className="hover:bg-danger-light h-10 w-[104px] rounded-lg bg-[#fff3f3] text-base font-bold whitespace-nowrap text-[#f74b4b] md:w-[108px]"
              >
                예약 거절
              </button>
              <button
                onClick={onApprove}
                className="bg-primary-hover hover:bg-primary h-10 w-[104px] rounded-lg text-base font-bold whitespace-nowrap text-white md:w-[108px]"
              >
                예약 승인
              </button>
            </div>
          )}

          {(status === "APPROVED" || status === "CONTRACT_COMPLETED" || status === "PAYMENT_COMPLETED" || status === "IN_USE" || status === "CHECKOUT_COMPLETED") && displayStatus !== "USAGE_COMPLETED" && (
            <button
              onClick={onDetail}
              className="bg-surface-blue text-text-primary hover:bg-primary-light h-10 w-[104px] rounded-lg px-6 py-1.5 text-base font-bold whitespace-nowrap md:w-auto"
            >
              공간 상세
            </button>
          )}

          {(status === "USAGE_COMPLETED" || displayStatus === "USAGE_COMPLETED") && isPhotoVerified && (
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:gap-1">
              <button
                onClick={onDetail}
                className="hover:bg-primary-light h-10 w-[104px] rounded-lg bg-[#f0f6fe] px-6 py-1.5 text-base font-bold whitespace-nowrap text-[#121212] md:w-auto"
              >
                공간 상세
              </button>
              <button
                onClick={onPhotoView}
                className="hover:bg-primary-light flex h-10 w-[104px] items-center justify-center rounded-lg bg-[#f0f6fe] px-2 py-1.5 text-center text-base font-bold whitespace-nowrap text-[#121212] md:w-auto md:px-6"
              >
                퇴실 사진 보기
              </button>
              <button
                onClick={onCheckoutReject}
                className="hover:bg-danger-light h-10 w-[104px] rounded-lg bg-[#fff3f3] px-6 py-1.5 text-base font-bold whitespace-nowrap text-[#f74b4b] md:w-[108px]"
              >
                퇴실 거부
              </button>
              <button
                onClick={onCheckoutApprove}
                className="hover:bg-primary h-10 w-[104px] rounded-lg bg-[#3783f7] px-6 py-1.5 text-base font-bold whitespace-nowrap text-white md:w-[108px]"
              >
                퇴실 승인
              </button>
            </div>
          )}

          {(status === "USAGE_COMPLETED" || displayStatus === "USAGE_COMPLETED") && !isPhotoVerified && (
            <div className="flex w-full flex-col items-start gap-2 min-[1024px]:items-end">
              <span className="w-full text-left text-base font-medium text-[#0564f5] min-[1024px]:text-right">
                퇴실 사진이 아직 등록되지 않았습니다.
              </span>
              <div className="flex w-full flex-wrap items-center gap-1 md:w-auto">
                <button
                  onClick={onDetail}
                  className="bg-surface-blue text-text-primary hover:bg-primary-light h-10 w-[104px] rounded-lg px-6 py-1.5 text-base font-bold whitespace-nowrap md:w-auto"
                >
                  공간 상세
                </button>
                <button
                  disabled
                  className="bg-surface-blue flex h-10 w-auto items-center justify-center rounded-lg px-6 py-1.5 text-center text-base font-bold whitespace-nowrap text-[#8cb8fa]"
                >
                  퇴실 사진 보기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
