import type { TAB_STATUSES } from "@/features/guest-explore/components/MyReservationList";

type Status = (typeof TAB_STATUSES)[number];

interface MyReservationListEmptyStateProps {
    status: Status,
}

const EMPTY_MESSAGE: Record<Status, string> = {
  "예약 예정": "아직 예약한 공간이 없어요",
  "승인 완료": "아직 승인된 공간이 없어요",
  "계약 완료": "아직 계약한 공간이 없어요",
  "사용 중": "사용 중인 공간이 없어요",
  "지난 예약": "아직 사용한 공간이 없어요",
};

const MyReservationListEmptyState = ({status}:MyReservationListEmptyStateProps) => {
  const message = EMPTY_MESSAGE[status];

  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-tag-bg size-full rounded-lg py-8 h-60">
      <span className="text-md">{message}</span>
    </div>
  );
};

export default MyReservationListEmptyState;