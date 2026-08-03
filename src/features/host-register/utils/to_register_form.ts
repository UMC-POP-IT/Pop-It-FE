import type { SpaceDetailRes } from "@/features/guest-explore/api/space_api";
import type { SpacePhoto, SpaceRegisterForm } from "@/store/registerStore";
import {
  BUILDING_TYPE_FROM_ENUM,
  FLOOR_TYPE_FROM_ENUM,
  SPACE_CATEGORY_FROM_ENUM,
  SPACE_TYPE_FROM_ENUM,
} from "@/features/host-register/constants/space_enums";

/** 서버는 "서울특별시", 폼(카카오 주소검색)은 "서울" */
const CITY_FROM_FULL: Record<string, string> = {
  서울특별시: "서울",
};

/** 원 → 만원 단위 문자열. 만원 미만 금액은 폼이 표현할 수 없어 반올림된다 */
const toManwon = (won: number) => String(Math.round(won / 10_000));

/**
 * 표에 없는 값이 오면 원본을 그대로 둔다.
 * 칩이 선택되지 않은 채 열리지만, 화면이 깨지지 않고 사용자가 다시 고를 수 있다.
 */
const fromEnum = (map: Record<string, string>, value: string) =>
  map[value] ?? value;

/**
 * 공간 상세 조회 응답을 등록 폼 형식으로 바꾼다 (수정 화면 진입용).
 * to_space_request.ts 의 정확히 반대 방향.
 */
export const toRegisterForm = (detail: SpaceDetailRes): SpaceRegisterForm => ({
  // Step1 위치/구조
  ownerType: "소유자",
  buildingType: fromEnum(BUILDING_TYPE_FROM_ENUM, detail.buildingType),
  city: CITY_FROM_FULL[detail.city] ?? detail.city,
  district: detail.district,
  address: detail.roadAddress,
  detailAddress: detail.addressDetail,
  latitude: detail.latitude,
  longitude: detail.longitude,

  // Step2 거래정보
  deposit: toManwon(detail.deposit),
  priceDay: toManwon(detail.pricePerDay),
  startDate: detail.availableStartDate,
  endDate: detail.availableEndDate,

  // Step3 공간정보
  usage: fromEnum(SPACE_CATEGORY_FROM_ENUM, detail.spaceCategory),
  spaceStructure: fromEnum(SPACE_TYPE_FROM_ENUM, detail.spaceType),
  area: String(detail.exclusiveArea),
  floorType: fromEnum(FLOOR_TYPE_FROM_ENUM, detail.floorType),
  // 반지층·옥탑은 층수가 없어 서버가 null을 줄 수 있다
  floor: detail.floorNumber != null ? String(detail.floorNumber) : "",
  hasParking: detail.parkingAvailable,
  facilityIds: detail.facilities.map((f) => f.facilityId),

  // Step4 상세정보
  buildingName: detail.buildingName,
  description: detail.description,

  // Step5 사진 — 서버 사진은 URL만 있고 File이 없다
  photoList: detail.imageUrls.map((url): SpacePhoto => ({
    kind: "existing",
    url,
  })),
});
