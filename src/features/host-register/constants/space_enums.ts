/**
 * 화면 라벨(한글) ↔ 서버 enum 매핑표.
 * 값 출처: 스웨거 SpaceCreateReq (/v3/api-docs → Schema 탭)
 * 라벨 출처: features/host-register/api/mock_register.ts
 */

/** 등록자 유형 — 기획상 소유자만. 서버 enum도 OWNER 하나뿐 */
export const REGISTRANT_TYPE = "OWNER";

export type BuildingTypeEnum =
  | "LARGE_OFFICE"
  | "SMALL_MEDIUM_OFFICE"
  | "OFFICETEL"
  | "COMPLEX_COMMERCIAL"
  | "GENERAL_COMMERCIAL"
  | "MIXED_USE_COMMERCIAL";

export type SpaceCategoryEnum =
  | "POPUP_STORE"
  | "EXHIBITION_GALLERY"
  | "COMPLEX_SPACE"
  | "SHOWROOM"
  | "CAFE_FNB";

export type SpaceTypeEnum = "OPEN_HALL" | "PARTITION_WALL" | "ROOM_SEPARATED";

export type FloorTypeEnum =
  "GENERAL_FLOOR" | "SEMI_BASEMENT" | "BASEMENT" | "ROOFTOP";

/** 건물 유형 (Step1) */
export const BUILDING_TYPE_TO_ENUM: Record<string, BuildingTypeEnum> = {
  "대형 사무실": "LARGE_OFFICE",
  "중소형 사무실": "SMALL_MEDIUM_OFFICE",
  "오피스텔 형": "OFFICETEL",
  "단지내 상가": "COMPLEX_COMMERCIAL",
  "일반 상가": "GENERAL_COMMERCIAL",
  "복합 상가": "MIXED_USE_COMMERCIAL",
};

/** 공간 용도 (Step3 기본 정보) */
export const SPACE_CATEGORY_TO_ENUM: Record<string, SpaceCategoryEnum> = {
  팝업스토어: "POPUP_STORE",
  "전시/갤러리": "EXHIBITION_GALLERY",
  복합공간: "COMPLEX_SPACE",
  쇼룸: "SHOWROOM",
  "카페/F&B": "CAFE_FNB",
};

/** 공간 구조 (Step3 공간 정보) */
export const SPACE_TYPE_TO_ENUM: Record<string, SpaceTypeEnum> = {
  "오픈형 홀": "OPEN_HALL",
  "가벽 분리형": "PARTITION_WALL",
  "룸 분리형": "ROOM_SEPARATED",
};

/** 층수 유형 (Step3) */
export const FLOOR_TYPE_TO_ENUM: Record<string, FloorTypeEnum> = {
  "일반 층": "GENERAL_FLOOR",
  반지층: "SEMI_BASEMENT",
  지하: "BASEMENT",
  옥탑: "ROOFTOP",
};

/** 표를 뒤집어 역방향 매핑을 만든다 (수정 화면에서 서버 값 → 화면 라벨) */
const invert = (map: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(map).map(([label, value]) => [value, label]),
  );

export const BUILDING_TYPE_FROM_ENUM = invert(BUILDING_TYPE_TO_ENUM);
export const SPACE_CATEGORY_FROM_ENUM = invert(SPACE_CATEGORY_TO_ENUM);
export const SPACE_TYPE_FROM_ENUM = invert(SPACE_TYPE_TO_ENUM);
export const FLOOR_TYPE_FROM_ENUM = invert(FLOOR_TYPE_TO_ENUM);
