// PASS 인증 리다이렉트 복귀 후 어떤 예약의 계약서 모달을 다시 열어야 하는지 식별하기 위한 sessionStorage 키.
// Authentication.tsx(저장)와 MyReservationList.tsx(조회)가 함께 참조하므로 문자열을 직접 하드코딩하지 않는다.
export const PENDING_CONTRACT_RESERVATION_KEY = "pendingContractReservationId";
