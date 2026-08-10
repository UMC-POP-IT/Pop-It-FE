import { apiFetch } from "@/shared/utils/apiClient";

// 차례대로 승인 대기, 승인 완료, 계약 완료(결제 전/실패), 결제 완료(이용 전), 사용 중, 사용 완료, 퇴실 완료, 취소
export type Status = "PENDING_APPROVAL" | "APPROVED" | "CONTRACT_COMPLETED" | "PAYMENT_COMPLETED" | "IN_USE" | "USAGE_COMPLETED" | "CHECKOUT_COMPLETED" | "CANCELLED";
export type ContractStatus = "HOST_SIGNATURE_PENDING" | "GUEST_SIGNATURE_PENDING" | "PENDING_PAYMENT" | "COMPLETED"
export interface Reservation {
	reservationId: number;
    status: Status;
    statusDescription: string;
    startDate: string;
    endDate: string;
    usagePurpose: string;
	totalPrice: number;
	isPhotoVerified: boolean;
    checkoutRejected: boolean;
	space: {
		spaceId: number;
		buildingName: string;
		address: string;
		thumbnailUrl: string;
	},
	guest: {
		userId: number;
		nickname: string;
    }
}

export interface GetReservationsResponse {
    reservations: Reservation[];
    hasNext: boolean;
    nextCursor: number | null;
}

export interface CancelReservationResponse {
    reservationId: number;
    status: Status;
}

export interface SubmitCheckOutPhotoRequest {
    imageUrls: string[];
}

export interface SubmitCheckOutPhotoResponse {
	reservationId: number;
	status: Status;
	statusDescription: string;
}

export interface GetEachResStateCountsResponse {
    countsByStatus: {
      PENDING_APPROVAL: number;
      APPROVED: number;
      CONTRACT_COMPLETED: number;
      PAYMENT_COMPLETED: number;
      IN_USE: number;
      USAGE_COMPLETED: number;
      CHECKOUT_COMPLETED: number;
      CANCELLED: number;
    }
}

export interface GetSubmitCheckoutPhotosResponse {
    checkoutRejected: boolean;
    photoUrls: string[];
}

export interface GetCheckOutApprovalResponse {
    reservationId: number;
    status: Status,
    statusDescription: string;
    checkoutRejected: boolean;
    checkoutSubmittedAt: string | null;
    checkoutRejectedAt: string | null;
}

interface Upload {
    presignedUrl: string;
    fileUrl: string;
}

interface PresignedURLFile {
    contentType: string;
}

export interface GetPresignedURLRequest {
    uploadType: "SPACE_IMAGE" | "HOST_DOCUMENT" | "CONTRACT_SIGNATURE" | "SCENE_IMAGE" | "CHECKOUT_IMAGE";
    files: PresignedURLFile[];
}
export interface GetPresignedURLResponse {
    uploads: Upload[];
}

export interface SubmitSignatureRequest {
    signatureUrl: string;
}

export interface SubmitSignatureResponse {
    contractId: number;
    contractStatus: ContractStatus;
    bothSigned: boolean;
}

// startDate/endDate는 시간대 정보가 없는 순수 날짜 문자열("YYYY-MM-DD")이다.
// new Date(str)로 바로 파싱하면 UTC 자정으로 해석되어 로컬 타임존에 따라 하루가
// 밀릴 수 있으므로, 사용하는 쪽(예: ExploreReservationCard의 parseDateString)에서
// 반드시 연/월/일을 직접 분해해 로컬 Date로 만들어 비교해야 한다.
export interface UnavailablePeriod {
    startDate: string; // "YYYY-MM-DD" (타임존 없는 날짜, 양 끝 포함하는 예약 불가 기간의 시작일)
    endDate: string;   // "YYYY-MM-DD" (타임존 없는 날짜, 양 끝 포함하는 예약 불가 기간의 종료일)
}

interface GetUnavailableDatesResult {
    unavailableDates: UnavailablePeriod[];
}

export interface CreateReservationRequest {
    spaceId: number;
    startDate: string;
    endDate: string;
    usagePurpose: string;
}

export interface CreateReservationResponse {
    reservationId: number;
    status: Status;
    statusDescription: string;
    rentalFee: number;
    deposit: number;
    insuranceFee: number;
    totalPrice: number;
}

export interface GetPaymentInfoResponse {
    contractId: number;
    contractStatus: ContractStatus;
    spaceName: string;
    startDate: string;
    endDate: string;
    period: string;
    rentalFee: number;
    deposit: number;
    insuranceFee: number;
    totalPrice: number;
}

export interface PaymentRequestResponse {
    paymentId: number;
    orderId: string;
    orderName: string;
    amount: number;
    rentFee: number;
    deposit: number;
    insuranceFee: number;
    status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
}

export interface PaymentApprovalRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentApprovalResponse {
    paymentId: number;
    orderId: string;
    method: string;
    status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
    paidAt: string;
}

export interface GetVerificationStatusResponse {
    isVerified: boolean;
    verifiedAt: string;
}

export interface RequestVerificationRequest {
    identityVerificationId: string;
}

export interface RequestVerificationResponse {
    isVerified: boolean;
    verifiedAt: string;
}

// 업로드 - 발급받은 presigned url 로 파일 직접 업로드 (S3 등 외부 스토리지로 전송되므로 apiFetch 미사용)
export const UploadFileToPresignedURL = async (presignedUrl: string, file: File) => {
    const res = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    });
    if (!res.ok) {
        throw new Error(`파일 업로드에 실패했습니다: ${res.status}`);
    }
};

// 업로드 - presigned url 발급 ~ DONE
export const GetPresignedURL = (request: GetPresignedURLRequest) =>
    apiFetch<GetPresignedURLResponse>("/api/v1/uploads/presigned-url", {
        method: "POST",
        body: JSON.stringify(request),
});

// 게스트 - 공간별 예약 불가 날짜 조회 (이미 선점(승인대기~진행 중)된 기간 목록. 지난 날짜는 응답에서 제외됨) ~ DONE
export const getUnavailableDates = async (spaceId: number): Promise<UnavailablePeriod[]> => {
    const result = await apiFetch<GetUnavailableDatesResult>(`/api/v1/reservations/unavailable-dates?spaceId=${spaceId}`);
    return result.unavailableDates ?? [];
};

// 게스트 - 예약 요청 (spaceId/기간/사업 설명을 전달하면 대여료·보험료(대여료의 5%)·보증금을 서버가 계산해 총 결제 금액과 함께 PENDING_APPROVAL 상태의 예약을 생성) ~ DONE
export const createReservation = (request: CreateReservationRequest) =>
    apiFetch<CreateReservationResponse>(`/api/v1/reservations`, {
        method: "POST",
        body: JSON.stringify(request),
});

// 게스트 - 예약 목록 조회 (cursor: 마지막으로 조회한 id, size: 페이지 크기, status: 상태 필터) ~ DONE
export const GetReservations = (cursor?: number, size?: number, status?: string) => {
    const query = new URLSearchParams();
    if (cursor != null) query.set("cursor", String(cursor));
    if (size != null) query.set("size", String(size));
    if (status) query.set("status", status);
    const qs = query.toString();
    return apiFetch<GetReservationsResponse>(`/api/v1/reservations/me${qs ? `?${qs}` : ""}`);
};

// 게스트 - 예약 취소 ~ DONE
export const CancelReservations = (reservationId: number) =>
    apiFetch<CancelReservationResponse>(`/api/v1/reservations/${reservationId}/cancel`, {
        method: "POST",
});

// 게스트 - 퇴실 증빙 사진 제출 ~ DONE
export const SubmitCheckOutPhoto = (reservationId: number, request: SubmitCheckOutPhotoRequest) =>
    apiFetch<SubmitCheckOutPhotoResponse>(`/api/v1/reservations/${reservationId}/checkout`, {
        method: "POST",
        body: JSON.stringify(request),
});

// 게스트 - 예약 상태별 개수 조회 ~ 딱히 필요 없을 듯
export const GetEachResStateCounts = (reservationId: number) =>
    apiFetch<GetEachResStateCountsResponse>(`/api/v1/reservations/${reservationId}/status-counts`);

// 게스트 - 퇴실 증빙 사진 조회 ~ DONE
export const GetSubmitCheckoutPhotos = (reservationId: number) =>
    apiFetch<GetSubmitCheckoutPhotosResponse>(`/api/v1/reservations/${reservationId}/checkout-photos`);

// 호스트/게스트 공통 - 퇴실 승인 여부 조회 ~ 얘도 필요 없을 듯
export const GetCheckOutApproval = (reservationId: number) =>
    apiFetch<GetCheckOutApprovalResponse>(`/api/v1/reservations/${reservationId}/checkout-approval`);

// 계약 - 전자 서명 제출 ~ DONE
export const SubmitSignature = (reservationId: number, request: SubmitSignatureRequest) => 
    apiFetch<SubmitSignatureResponse>(`/api/v1/reservations/${reservationId}/contracts/signatures`, {
        method: "POST",
        body: JSON.stringify(request),
});

// 결제 - 결제 예정 정보 조회 ~ DONE + contractId 추가해야 됨
export const GetPaymentInfo = (reservationId: number) => 
    apiFetch<GetPaymentInfoResponse>(`/api/v1/reservations/${reservationId}/contracts/payment-preview`);

// 결제 - 결제(요청)준비 ~ DONE
export const PaymentRequest = (contractId: number, idempotencyKey: string) =>
    apiFetch<PaymentRequestResponse>(`/api/v1/contracts/${contractId}/payments`, {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
});

// 결제 - 결제 승인
export const PaymentApproval = (paymentId: number, request: PaymentApprovalRequest) => 
    apiFetch<PaymentApprovalResponse>(`/api/v1/payments/${paymentId}/confirm`, {
        method: "POST",
        body: JSON.stringify(request),
});

// 본인 인증 -  본인 인증 여부 조회
export const GetVerificationStatus = () => 
    apiFetch<GetVerificationStatusResponse>(`/api/v1/users/me/verifications`);

// 본인 인증 - 본인인증 요청
export const RequestVerification = (request: RequestVerificationRequest) => 
    apiFetch<RequestVerificationResponse>(`/api/v1/users/me/verifications`, {
        method: "POST",
        body: JSON.stringify(request), 
});
