import { apiFetch } from "@/shared/utils/apiClient";

export interface Space {
    spaceId: number;
    buildingName: string;
    tag: string;
    district: string;
    roadAddress: string;
    exclusiveArea: number;
    spaceCategory: string;
    keywords: string[];
    pricePerDay: number;
    pricePerWeek: number;
    pricePerMonth: number;
    thumbnailUrl: string;
    parkingAvailable: boolean;
    isWishlisted: boolean;
    wishCount: number;
    title?: string; // 실시간 추천 공간에서만 사용
    subtitle?: string; // 실시간 추천 공간에서만 사용
}

export interface recommendSpace {
    spaceId: number;
    title: string;
    subtitle: string;
    thumbnailUrl: string;
}

export interface AiRecommendResponse {
    spaces: Space[];
    hasNext: boolean; // 다음 페이지 있는지
    nextCursor: number | null; // 다음 커서
    hasActivityHistory: boolean; // 신규 유저 여부 반환
}

export interface RealTimeRecommendResponse {
    spaces: recommendSpace[]
}

// 게스트 - AI 맞춤형 공간 추천 조회
export const getAiRecommend = () =>
    apiFetch<AiRecommendResponse>("/api/v1/spaces/ai-recommended?size=10");

// 게스트 - 실시간 추천 공간 조회
export const getRealTimeRecommend = () =>
    apiFetch<RealTimeRecommendResponse>("/api/v1/spaces/realtime-recommended");
