import type { SpaceRegisterForm } from "@/store/registerStore";
import {
  BUILDING_TYPE_TO_ENUM,
  FLOOR_TYPE_TO_ENUM,
  REGISTRANT_TYPE,
  SPACE_CATEGORY_TO_ENUM,
  SPACE_TYPE_TO_ENUM,
} from "@/features/host-register/constants/space_enums";

/** 카카오 주소검색은 "서울"을 주는데 서버는 "서울특별시"를 요구한다 */
const CITY_TO_FULL: Record<string, string> = {
  서울: "서울특별시",
};

/** 층수 입력칸이 없는 유형 — floorNumber를 보내지 않는다 */
const FLOOR_TYPES_WITHOUT_NUMBER = ["반지층", "옥탑"];

/** 만원 단위 입력 → 원 단위 정수 */
const toWon = (manwon: string) => Number(manwon) * 10_000;

/**
 * 매핑표에서 서버 값을 찾는다.
 * 표에 없으면 빈 값을 보내 400을 맞는 대신, 어느 항목이 문제인지 즉시 알린다.
 */
const toEnum = <T extends string>(
  map: Record<string, T>,
  label: string,
  fieldName: string,
): T => {
  const value = map[label];
  if (!value) {
    throw new Error(`${fieldName}을(를) 변환하지 못했습니다: "${label}"`);
  }
  return value;
};

/** POST /api/v1/spaces · PATCH /api/v1/spaces/{spaceId} 요청 본문 (스웨거 SpaceCreateReq) */
export interface SpaceRequest {
  buildingName: string;
  registrantType: string;
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
  floorNumber?: number;
  parkingAvailable: boolean;
  description: string;
  facilityIds?: number[];
  imageUrls: string[];
}

/**
 * 등록 폼 값을 서버 요청 형식으로 바꾼다.
 * 사진은 미리 업로드해서 받은 URL 배열을 넘겨야 한다 (api/upload_api.ts)
 */
export const toSpaceRequest = (
  form: SpaceRegisterForm,
  imageUrls: string[],
): SpaceRequest => {
  // 폼 유효성 검사를 통과했다면 값이 있어야 하지만, 서버에 null을 보낼 수는 없어 여기서 막는다
  if (form.latitude === null || form.longitude === null) {
    throw new Error("주소 좌표가 없습니다. 주소를 다시 검색해주세요");
  }
  if (form.hasParking === null) {
    throw new Error("주차 가능 여부를 선택해주세요");
  }

  const hasFloorNumber = !FLOOR_TYPES_WITHOUT_NUMBER.includes(form.floorType);

  return {
    buildingName: form.buildingName,
    registrantType: REGISTRANT_TYPE,
    buildingType: toEnum(BUILDING_TYPE_TO_ENUM, form.buildingType, "건물 유형"),
    city: CITY_TO_FULL[form.city] ?? form.city,
    district: form.district,
    roadAddress: form.address,
    addressDetail: form.detailAddress,
    latitude: form.latitude,
    longitude: form.longitude,
    deposit: toWon(form.deposit),
    pricePerDay: toWon(form.priceDay),
    availableStartDate: form.startDate,
    availableEndDate: form.endDate,
    spaceCategory: toEnum(SPACE_CATEGORY_TO_ENUM, form.usage, "공간 용도"),
    spaceType: toEnum(SPACE_TYPE_TO_ENUM, form.spaceStructure, "공간 구조"),
    exclusiveArea: Number(form.area),
    floorType: toEnum(FLOOR_TYPE_TO_ENUM, form.floorType, "층수 유형"),
    ...(hasFloorNumber ? { floorNumber: Number(form.floor) } : {}),
    parkingAvailable: form.hasParking,
    description: form.description,
    imageUrls,
    facilityIds: form.facilityIds,
  };
};
