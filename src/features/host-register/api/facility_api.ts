import { api } from "@/shared/api/axios_instance";
import type { PopitResponse } from "@/types/api";

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
  const { data } =
    await api.get<PopitResponse<FacilityListRes>>("/api/v1/facilities");

  // HTTP 200이어도 서버가 처리 실패로 답할 수 있어 isSuccess를 확인한다
  if (!data.isSuccess) {
    throw new Error(`[${data.code}] ${data.message}`);
  }

  return data.result;
};
