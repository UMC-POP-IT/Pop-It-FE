import { apiFetch } from "@/shared/utils/apiClient";

// 시설 카테고리 (서버 enum)
export type FacilityCategory = "HEATING_COOLING" | "SECURITY" | "ETC";

export interface FacilityItem {
  facilityId: number;
  name: string;
}

export interface FacilityCategoryGroup {
  category: FacilityCategory;
  items: FacilityItem[];
}

export interface FacilityListRes {
  facilities: FacilityCategoryGroup[];
}

export const getFacilities = async () => {
  const data = await apiFetch<FacilityListRes>("/api/v1/facilities");

  // apiFetch가 봉투를 벗겨주지만, 서버가 200 + isSuccess:false로 답하면
  // result가 null이라 봉투 객체가 그대로 넘어온다. 그 경우 facilities가 없다.
  if (!data.facilities) {
    throw new Error("시설 목록 응답 형식이 올바르지 않습니다");
  }

  return data;
};
