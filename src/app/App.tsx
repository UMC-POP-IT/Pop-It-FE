import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import PaymentModal from "@/features/guest-explore/components/contract/PaymentModal";

const MOCK_RESERVATION = {
  reservationId: 0,
  status: "APPROVED" as const,
  statusDescription: "",
  startDate: "2026-08-12",
  endDate: "2026-08-14",
  usagePurpose: "",
  totalPrice: 100000,
  isPhotoVerified: false,
  checkoutRejected: false,
  space: {
    spaceId: 0,
    buildingName: "테스트 공간",
    address: "",
    thumbnailUrl: "",
  },
  guest: {
    userId: 0,
    nickname: "",
  },
};

const MOCK_PAYMENT_INFO = {
  contractId: 0,
  contractStatus: "PENDING_PAYMENT" as const,
  spaceName: "테스트 공간",
  startDate: "2026-08-12",
  endDate: "2026-08-14",
  period: "2",
  rentalFee: 80000,
  deposit: 15000,
  insuranceFee: 5000,
  totalPrice: 100000,
};

// staleTime 기본값(0)을 그대로 두면 PASS/토스 앱 전환 후 탭에 포커스가 돌아올 때마다
// (refetchOnWindowFocus) 모든 쿼리가 stale로 간주되어 즉시 재요청된다 - 예약 목록처럼
// 페이지네이션을 순회하는 쿼리에서는 매번 전체 재조회로 이어지므로 기본 staleTime을 둔다.
// 승인/결제 등으로 즉시 반영이 필요한 화면은 invalidateQueries로 개별 갱신한다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export const App = () => {
  const [agreedToGuide, setAgreedToGuide] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <PaymentModal
        isOpen={true}
        reservation={MOCK_RESERVATION}
        agreedToGuide={agreedToGuide}
        onAgreedToGuideChange={setAgreedToGuide}
        onClose={() => {}}
        onSignContract={() => {}}
        paymentInfo={MOCK_PAYMENT_INFO}
      />
    </QueryClientProvider>
  );
};
