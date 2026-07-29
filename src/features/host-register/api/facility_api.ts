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
  const res =
    await api.get<PopitResponse<FacilityListRes>>("/api/v1/facilities");
  return res.data.result;
};
