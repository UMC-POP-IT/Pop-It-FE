interface MyReservationListyEmptyStateProps {
    status: "예약 예정" | "승인 완료" | "계약 완료" | "사용 중" | "지난 예약",
}

const MyReservationListEmptyState = ({status}:MyReservationListyEmptyStateProps) => {
  let message = "";
  if (status === "예약 예정") {
    message = "아직 예약한 공간이 없어요";
  } else if (status === "승인 완료") {
    message = "아직 승인된 공간이 없어요";
  } else if (status === "계약 완료") {
    message = "아직 계약한 공간이 없어요";
  } else if (status === "사용 중") {
    message = "사용 중인 공간이 없어요";
  } else if (status === "지난 예약") {
    message = "아직 사용한 공간이 없어요";
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-tag-bg size-full rounded-lg py-8 h-60">
      <span className="text-md">{message}</span>
    </div>
  );
};

export default MyReservationListEmptyState;