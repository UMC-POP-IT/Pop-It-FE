const MyReservationListEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-tag-bg size-full rounded-lg py-8 h-60">
      <span className="text-md">아직 예약한 공간이 없어요</span>
    </div>
  );
};

export default MyReservationListEmptyState;