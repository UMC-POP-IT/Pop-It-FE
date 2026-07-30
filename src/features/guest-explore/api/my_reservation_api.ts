import axios from "axios";
import { useAuthStore } from "@/store/authStore";

// 팀 공통 API client => #135 머지되면 없앨거
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { "Content-Type": "application/json"},
});

// 로그인 시 저장된 accessToken을 매 요청에 실어 보냄
api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// accessToken 만료(401) 시 refreshToken으로 재발급받아 원래 요청을 한 번 재시도
let reissuePromise: Promise<string | null> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        const { refreshToken, setAccessToken } = useAuthStore.getState();
        if (!refreshToken) {
            return Promise.reject(error);
        }

        try {
            if (!reissuePromise) {
                reissuePromise = axios
                    .post<PopitResponse<{ accessToken: string }>>(
                        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/reissue`,
                        { refreshToken },
                    )
                    .then(({ data }) => {
                        setAccessToken(data.result.accessToken);
                        return data.result.accessToken;
                    })
                    .finally(() => {
                        reissuePromise = null;
                    });
            }

            const newAccessToken = await reissuePromise;
            if (!newAccessToken) return Promise.reject(error);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (reissueError) {
            return Promise.reject(reissueError);
        }
    },
);

// 차례대로 승인 대기, 승인 완료, 계약 완료(이용 전), 사용 중, 사용 완료, 퇴실 완료, 취소
export type Status = "PENDING_APPROVAL" | "APPROVED" | "CONTRACT_COMPLETED" | "IN_USE" | "USAGE_COMPLETED" | "CHECKOUT_COMPLETED" | "CANCELLED";

export interface PopitResponse<T> {
    isSuccess: boolean;
    code: string;
    message: string;
    result: T;
}

export interface Reservation {
	reservationId: number;
    status: Status;
    statusDescription: string;
    startDate: string;
    endDate: string;
    usagePurpose: string;
	totalPrice: number;
	isPhotoVerified: boolean;
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

export interface RequestReservatonRequest {
    spaceId: number;
    startDate: string;
    endDate: string;
    usagePurpose: string;
}

export interface RequestReservationResponse {
    reservationId: number;
    status: Status;
    statusDescription: string;
    rentalFee: number;
    deposit: number;
    insuranceFee: number;
    totalPrice: number;
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
    photoUrls: string[];
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

// 게스트 - 예약 요청
export const RequestReservation = async (request: RequestReservatonRequest) => {
    try {
        const { data } = await api.post<PopitResponse<RequestReservationResponse>>("/api/v1/reservations", request);
        const { isSuccess, code, message, result } = data;

        if (isSuccess) {
            return result;
        } else {
            console.log(message)
        }

    } catch (error) {
        if ((axios.isAxiosError(error))) {
            console.log("에러 발생; ", error.response?.status);
        }
    }
}

// 게스트 - 예약 목록 조회
// cursor: 마지막으로 조회한 id
// size: 페이지 크기
// status: 상태 필터
export const GetReservations = async (cursor?:number, size?:number, status?:string) => {
    try {
        const { data } = await api.get<PopitResponse<GetReservationsResponse>>(
            "/api/v1/reservations/me",
            {params: {cursor, size, status}}
        );
        const { isSuccess, code, message, result } = data;

        if (isSuccess) {
            return result;
        } else {
            console.log(message)
        }
    } catch (error) {
        if ((axios.isAxiosError(error))) {
            console.log("에러 발생; ", error.response?.status);
        }
    }
}

// 게스트 - 예약 취소
export const CancelReservations = async (reservationId: number) => {
    try {
        const { data } = await api.post<PopitResponse<CancelReservationResponse>>(`/api/v1/reservations/${reservationId}/cancel`);
        const { isSuccess, code, message, result } = data;

        if (isSuccess) {
            return result;
        } else {
            console.log(message)
        }
    } catch (error) {
        if ((axios.isAxiosError(error))) {
            console.log("에러 발생; ", error.response?.status);
        }
    }
}

// 게스트 - 퇴실 증빙 사진 제출
export const SubmitCheckOutPhoto = async (reservationId: number, request: SubmitCheckOutPhotoRequest) => {
    try {
        const { data } = await api.post<PopitResponse<SubmitCheckOutPhotoResponse>>(`/api/v1/reservations/${reservationId}/checkout`, request);
        const { isSuccess, code, message, result } = data;

        if (isSuccess) {
            return result;
        } else {
            console.log(message)
        }
    } catch (error) {
        if ((axios.isAxiosError(error))) {
            console.log("에러 발생; ", error.response?.status);
        }
    }
}

// 게스트 - 예약 상태별 개수 조회
export const GetEachResStateCounts = async (reservationId: number) => {
    try {
        const { data } = await api.get<PopitResponse<GetEachResStateCountsResponse>>(`/api/v1/reservations/${reservationId}/checkout-photos`)
        const { isSuccess, code, message, result } = data;

        if (isSuccess) {
            return result;
        } else {
            console.log(message)
        }
    } catch (error) {
        if ((axios.isAxiosError(error))) {
            console.log("에러 발생; ", error.response?.status);
        }
    }
}

// 게스트 - 퇴실 증빙 사진 조회
export const GetSubmitCheckoutPhotos = async (reservationId: number) => {
    try {
        const { data } = await api.get<PopitResponse<GetSubmitCheckoutPhotosResponse>>(`/api/v1/reservations/${reservationId}/checkout-photos`)
        const { isSuccess, code, message, result } = data;

        if (isSuccess) {
            return result;
        } else {
            console.log(message)
        }
    } catch (error) {
        if ((axios.isAxiosError(error))) {
            console.log("에러 발생; ", error.response?.status);
        }
    }
}

// 퇴실 승인 여부 조회
export const GetCheckOutApproval = async (reservationId: number) => {
    try {
        const { data } = await api.get<PopitResponse<GetCheckOutApprovalResponse>>(`/api/v1/reservations/${reservationId}/checkout-approval`)
        const { isSuccess, code, message, result } = data;

        if (isSuccess) {
            return result;
        } else {
            console.log(message)
        }
    } catch (error) {
        if ((axios.isAxiosError(error))) {
            console.log("에러 발생; ", error.response?.status);
        }
    }
}