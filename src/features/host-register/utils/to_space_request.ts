import type { SpaceRegisterForm } from "@/store/registerStore";
import {
  BUILDING_TYPE_TO_ENUM,
  FLOOR_TYPE_TO_ENUM,
  REGISTRANT_TYPE,
  SPACE_CATEGORY_TO_ENUM,
  SPACE_TYPE_TO_ENUM,
} from "@/features/host-register/constants/space_enums";
import { toEnum } from "@/features/host-register/utils/to_enum";

/** 카카오 주소검색은 "서울"을 주는데 서버는 "서울특별시"를 요구한다 */
const CITY_TO_FULL: Record<string, string> = {
  서울: "서울특별시",
};

/** 층수 입력칸이 없는 유형 — floorNumber를 보내지 않는다 */
const FLOOR_TYPES_WITHOUT_NUMBER = ["반지층", "옥탑"];

/**
 * 숫자 문자열 → number.
 * 비었거나 숫자가 아니면 어느 항목이 문제인지 알리고 멈춘다.
 * (그냥 두면 Number("")가 0이라 0원·0㎡짜리 공간이 조용히 등록된다)
 */
const toNumber = (value: string, fieldName: string): number => {
  if (value.trim() === "") {
    throw new Error(`${fieldName}을(를) 입력해주세요`);
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`${fieldName}은(는) 숫자로 입력해주세요: "${value}"`);
  }
  return num;
};

/** 만원 단위 입력 → 원 단위 정수 */
const toWon = (manwon: string, fieldName: string) =>
  Math.round(toNumber(manwon, fieldName) * 10_000);

/** 보증금은 입력이 선택이라 빈 값을 0원으로 본다 (Step2 유효성 검사가 요구하지 않음) */
const toDeposit = (manwon: string) =>
  manwon.trim() === "" ? 0 : toWon(manwon, "보증금");

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
    deposit: toDeposit(form.deposit),
    pricePerDay: toWon(form.priceDay, "일 대여료"),
    availableStartDate: form.startDate,
    availableEndDate: form.endDate,
    spaceCategory: toEnum(SPACE_CATEGORY_TO_ENUM, form.usage, "공간 용도"),
    spaceType: toEnum(SPACE_TYPE_TO_ENUM, form.spaceStructure, "공간 구조"),
    exclusiveArea: toNumber(form.area, "전용 면적"),
    floorType: toEnum(FLOOR_TYPE_TO_ENUM, form.floorType, "층수 유형"),
    ...(hasFloorNumber ? { floorNumber: toNumber(form.floor, "층수") } : {}),
    parkingAvailable: form.hasParking,
    description: form.description,
    imageUrls,
    facilityIds: form.facilityIds,
  };
};
