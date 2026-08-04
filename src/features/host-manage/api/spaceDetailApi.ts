import { apiFetch } from "@/shared/utils/apiClient";

// ============================================================
// GET /api/v1/spaces/{spaceId} — 호스트 공간 상세 조회
// mock_spaces.ts(게스트 파트)에 의존하지 않도록 호스트 측에 독립 정의
// ============================================================

interface SpaceDetailFacility {
  facilityId: number;
  category: string;
  name: string;
}

interface SpaceDetailRes {
  spaceId: number;
  buildingName: string;
  buildingType: string;
  city: string;
  district: string;
  roadAddress: string;
  addressDetail: string;
  latitude: number;
  longitude: number;
  deposit: number;
  pricePerDay: number;
  availableStartDate: string;
  availableEndDate: string;
  spaceCategory: string;
  spaceType: string;
  exclusiveArea: number;
  floorType: string;
  floorNumber: number;
  parkingAvailable: boolean;
  facilities: SpaceDetailFacility[];
  description: string;
  imageUrls: string[];
  isMine: boolean;
  isWishlisted: boolean;
  wishCount: number;
}

/** 호스트 공간 상세 UI에서 사용하는 도메인 타입 */
export interface HostSpaceDetail {
  id: number;
  hostId: number;
  imageUrls: string[];
  heartCount: number;
  name: string;
  address: string;
  cost: { day: number };
  keywords: string[];
  description: string;
  createdAt: string;
  category: string;
  area: number;
  facilities: string[];
  spaceInfo: string[];
  latitude: number;
  longitude: number;
}

const BUILDING_TYPE_LABEL: Record<string, string> = {
  LARGE_OFFICE: "대형 오피스",
};

const SPACE_CATEGORY_LABEL: Record<string, string> = {
  POPUP_STORE: "팝업스토어",
};

const FLOOR_TYPE_LABEL: Record<string, string> = {
  GENERAL_FLOOR: "일반층",
};

const labelOf = (map: Record<string, string>, value: string) =>
  map[value] ?? value;

export const fetchSpaceDetail = (spaceId: number) =>
  apiFetch<SpaceDetailRes>(`/api/v1/spaces/${spaceId}`);

export const toHostSpaceDetail = (detail: SpaceDetailRes): HostSpaceDetail => {
  const address = detail.addressDetail
    ? `${detail.roadAddress} ${detail.addressDetail}`
    : detail.roadAddress;

  const spaceInfo = [
    labelOf(BUILDING_TYPE_LABEL, detail.buildingType),
    `${detail.floorNumber}층 (${labelOf(FLOOR_TYPE_LABEL, detail.floorType)})`,
    detail.parkingAvailable ? "주차 가능" : "주차 불가",
  ];

  return {
    id: detail.spaceId,
    hostId: 0,
    imageUrls: detail.imageUrls,
    heartCount: detail.wishCount,
    name: detail.buildingName,
    address,
    cost: { day: detail.pricePerDay },
    keywords: detail.facilities.map((f) => f.name),
    description: detail.description,
    createdAt: "",
    category: labelOf(SPACE_CATEGORY_LABEL, detail.spaceCategory),
    area: detail.exclusiveArea,
    facilities: detail.facilities.map((f) => f.name),
    spaceInfo,
    latitude: detail.latitude,
    longitude: detail.longitude,
  };
};
