import type { ApiHostReservation, ReservationStatus } from "@/types";
import iconPerson from "@/assets/icons/icon_person.svg";

interface HostReservationCardProps {
  reservation: ApiHostReservation;
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
  CONTRACTED: "계약 완료",
  IN_USE: "사용 중",
  COMPLETED: "사용 완료",
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
  onDetail,
  onApprove,
  onReject,
  onPhotoView,
  onCheckoutApprove,
  onCheckoutReject,
}: HostReservationCardProps) => {
  const { status, startDate, endDate, totalPrice, usagePurpose, guest, space } = reservation;
  const hasCheckoutPhoto = reservation.isPhotoVerified;

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
            <span className="text-text-primary text-2xl font-bold">
              {guest.nickname}
            </span>
          </div>
          <p className="text-text-tag line-clamp-1 text-base font-medium">
            {usagePurpose}
          </p>
        </div>
      </div>

      {/* 공간 정보 */}
      <div className="border-divider flex items-end justify-between gap-7 border-b py-5">
        <div className="flex items-start gap-7">
          {/* 이미지 */}
          <div className="bg-thumbnail-bg h-[190px] w-[190px] flex-shrink-0 overflow-hidden">
            {space.thumbnailUrl && (
              <img
                src={space.thumbnailUrl}
                alt={space.buildingName}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* 텍스트 */}
          <div className="flex h-[190px] flex-col items-start justify-between">
            <div className="flex flex-col items-start gap-2">
              <span className="text-primary text-base font-bold">
                {STATUS_LABEL[status]}
              </span>
              <div className="flex flex-col items-start gap-1">
                <p className="text-xl font-bold text-black">{space.buildingName}</p>
                <p className="text-text-primary text-base">
                  {formatDate(startDate)} ~ {formatDate(endDate)}
                </p>
              </div>
            </div>
            <p className="text-text-primary text-lg font-medium">
              총 금액:{" "}
              <span className="font-bold">{totalPrice.toLocaleString()}</span>
              원
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex h-[190px] flex-shrink-0 flex-col items-end justify-end gap-2">
          {status === "COMPLETED" && !hasCheckoutPhoto && (
            <p className="text-primary text-base font-medium">
              퇴실 사진이 아직 등록되지 않았습니다.
            </p>
          )}

          <div className="flex items-center gap-1">
            {status === "PENDING_APPROVAL" && (
              <>
                <button
                  onClick={onDetail}
                  className="bg-surface-blue text-text-primary h-10 rounded-lg px-6 py-1.5 text-base font-bold"
                >
                  공간 상세
                </button>
                <button
                  onClick={onReject}
                  className="text-danger h-10 w-[107px] text-base font-bold"
                >
                  예약 거절
                </button>
                <button
                  onClick={onApprove}
                  className="bg-primary-hover h-10 w-[107px] rounded-lg text-base font-bold text-white"
                >
                  예약 승인
                </button>
              </>
            )}

            {(status === "APPROVED" ||
              status === "CONTRACTED" ||
              status === "IN_USE") && (
              <button
                onClick={onDetail}
                className="bg-surface-blue text-text-primary h-10 rounded-lg px-6 py-1.5 text-base font-bold"
              >
                공간 상세
              </button>
            )}

            {status === "COMPLETED" && (
              <>
                <button
                  onClick={onDetail}
                  className="bg-surface-blue text-text-primary h-10 rounded-lg px-6 py-1.5 text-base font-bold"
                >
                  공간 상세
                </button>
                <button
                  onClick={onPhotoView}
                  disabled={!hasCheckoutPhoto}
                  className={
                    hasCheckoutPhoto
                      ? "bg-primary-hover h-10 rounded-lg px-6 py-1.5 text-base font-bold text-white"
                      : "bg-surface-blue h-10 cursor-not-allowed rounded-lg px-6 py-1.5 text-base font-bold text-[#8cb8fa]"
                  }
                >
                  퇴실 사진 보기
                </button>
                {hasCheckoutPhoto && (
                  <>
                    <button
                      onClick={onCheckoutReject}
                      className="text-danger h-10 px-4 text-base font-bold"
                    >
                      퇴실 거부
                    </button>
                    <button
                      onClick={onCheckoutApprove}
                      className="bg-primary-hover h-10 rounded-lg px-6 py-1.5 text-base font-bold text-white"
                    >
                      퇴실 승인
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
