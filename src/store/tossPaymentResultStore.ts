import { create } from "zustand";

// TossPaymentResultHandler(MainLayout)와 MyReservationList는 형제 컴포넌트라 서로의 상태를
// 직접 알 수 없다. 결제 승인이 예약 목록 최초 조회보다 늦게 끝나면 목록이 승인 전 상태로
// 남을 수 있어, 승인 완료 시점을 알려 예약 목록이 다시 조회하도록 연결한다.
interface TossPaymentResultState {
  approvedAt: number | null;
  notifyPaymentApproved: () => void;
}

export const useTossPaymentResultStore = create<TossPaymentResultState>((set) => ({
  approvedAt: null,
  notifyPaymentApproved: () => set({ approvedAt: Date.now() }),
}));
