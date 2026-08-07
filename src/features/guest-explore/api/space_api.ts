import { apiFetch } from "@/shared/utils/apiClient";
import { formatFloorLabel } from "@/shared/utils/floorLabel";
import { mapSpaceCategoryTag } from "@/shared/utils/spaceCategory";
import type { ExploreSpaceDetail } from "./mock_spaces";

// ============================================================
// GET /api/v1/spaces/{spaceId} - 공간 상세 조회
// ============================================================

export type RegistrantType = "OWNER" | "TENANT";

export interface SpaceDetailFacility {
  facilityId: number;
  category: string;
  name: string;
}

/** 서버 응답(result) 원본 스펙 */
export interface SpaceDetailRes {
  spaceId: number;
  buildingName: string;
  registrantType: RegistrantType;
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
  floorNumber: number | null;
  parkingAvailable: boolean;
  facilities: SpaceDetailFacility[];
  description: string;
  imageUrls: string[];
  // 비로그인 상태에서는 항상 false로 내려온다.
  isMine: boolean;
  isWishlisted: boolean;
  // 로그인 여부와 무관하게 항상 내려오는 총 찜 수
  wishCount: number;
}

/**
 * 공간 상세 페이지에 필요한 정보를 조회한다.
 * 비로그인 상태에서도 호출 가능 (이 경우 isMine/isWishlisted는 항상 false).
 *
 * 404(존재하지 않거나 삭제된 공간)는 apiFetch가 그대로 throw하므로,
 * 호출부에서 error.status === 404 로 구분해 처리한다.
 */
export const getSpaceDetail = (spaceId: number) =>
  apiFetch<SpaceDetailRes>(`/api/v1/spaces/${spaceId}`);

// ------------------------------------------------------------
// enum → 화면 표기 라벨
// TODO: 백엔드 enum 사전이 확정되면 누락된 값 채우기. 목록에 없는 값은
// 원본 문자열을 그대로 노출해 최소한 화면이 깨지지는 않게 한다.
// spaceCategory는 SpaceCard 등과 같은 공용 매핑(@/shared/utils/spaceCategory)을 사용한다.
// ------------------------------------------------------------

const BUILDING_TYPE_LABEL: Record<string, string> = {
  LARGE_OFFICE: "대형 오피스",
};

const SPACE_TYPE_LABEL: Record<string, string> = {
  OPEN_HALL: "오픈홀",
};

const labelOf = (map: Record<string, string>, value: string) =>
  map[value] ?? value;

/**
 * 서버 응답(SpaceDetailRes)을 기존 게스트 상세 UI 컴포넌트
 * (ExploreDetailGallery / ExploreDetailInfo / ExploreReservationCard / SpaceLocationMapModal)가
 * 그대로 재사용하는 ExploreSpaceDetail 형태로 변환한다.
 */
export const toExploreSpaceDetail = (
  detail: SpaceDetailRes,
): ExploreSpaceDetail => {
  const address = detail.addressDetail
    ? `${detail.roadAddress} ${detail.addressDetail}`
    : detail.roadAddress;

  // "공간정보" 섹션 - 상세 조회 API에는 별도 태그 목록이 없어
  // 건물/층/주차 관련 필드를 조합해 태그로 구성한다.
  const spaceInfo = [
    labelOf(BUILDING_TYPE_LABEL, detail.buildingType),
    formatFloorLabel(detail.floorType, detail.floorNumber),
    detail.parkingAvailable ? "주차 가능" : "주차 불가",
  ];

  return {
    id: detail.spaceId,
    hostId: 0, // 상세 조회 응답에는 hostId가 내려오지 않음 (필요 시 별도 API 연동 필요)
    imageUrls: detail.imageUrls,
    heartCount: detail.wishCount,
    name: detail.buildingName,
    address,
    cost: { day: detail.pricePerDay },
    keywords: detail.facilities.map((facility) => facility.name),
    description: detail.description,
    createdAt: "", // 상세 조회 응답에는 등록일이 내려오지 않음
    category: mapSpaceCategoryTag(detail.spaceCategory),
    area: detail.exclusiveArea,
    facilities: detail.facilities.map((facility) => facility.name),
    spaceInfo,
    latitude: detail.latitude,
    longitude: detail.longitude,
    availableStartDate: detail.availableStartDate,
    availableEndDate: detail.availableEndDate,
  };
};

// spaceType 라벨은 현재 UI에서 노출하는 곳이 없어 변환 함수에서는 사용하지 않지만,
// 추후 상세 화면에 공간 유형을 표시할 때 재사용할 수 있도록 export 해둔다.
export const getSpaceTypeLabel = (spaceType: string) =>
  labelOf(SPACE_TYPE_LABEL, spaceType);
