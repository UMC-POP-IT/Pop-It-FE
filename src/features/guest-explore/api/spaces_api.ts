import axios from "axios";

//팀 공통 API 클라이언트- 서버 주소를 미리 설정해둔 axios, 이거는 #135 merge되면 없애기
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export interface Space {
    "spaceId": number;
    "buildingName": string;
    "tag": string;
    "district": string;
    "roadAddress": string;
    "exclusiveArea": number;
    "basicInfo": string;
    "pricePerDay": string;
    "pricePerWeek": string;
    "pricePerMonth": string;
    "thumbnailUrl": string;
    "parkingAvailable": boolean;
    "isWishlisted": boolean;
    "title"?: string; // 실시간 추천 공간에서만 사용
    "subtitle"?: string; // 실시간 추천 공간에서만 사용

    // 일단 임시로 추가했음
    // "wishCount": number;
    // "cost": {
    //     day: number;
    //     month: number;
    //     year: number;
    // }
}

export interface AiRecommend {
  "isSuccess": boolean;
  "code": string;
  "message": string;
  "result": {
    "spaces": Space[];
    "hasNext": boolean;
    "nextCursor": number | null;
    "hasActivityHistory": boolean;
  }
}

export interface RealTimeRecommend {
  "isSuccess": boolean;
  "code": string;
  "message": string;
  "result": {
    "spaces": Space[];
  }
}

export interface AiRecommendRes {
    "spaces": Space[]; 
    "hasNext": boolean; // 다음 페이지 있는지
    "nextCursor": number | null; // 다음 커서
    "hasActivityHistory": boolean; // 신규 유저 여부 반환
}

export interface RealTimeRecommendRes {
    "spaces": Space[];
}

export const getAiRecommend = async (): Promise<AiRecommendRes | null> => {
    try {
        const { data } = await api.get<AiRecommend>(`/api/v1/spaces/ai-recommended?size=10`);
        console.log(data.result)
        return data.result;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response)
            console.log('에러 발생')
        return null;
    }
}

export const getRealTimeRecommend = async ():  Promise<RealTimeRecommendRes | null> => {
    try {
        const { data } = await api.get<RealTimeRecommend>("/api/v1/spaces/realtime-recommended");
        return data.result;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response)
            console.log('에러 발생')
        return null;
    }
}
