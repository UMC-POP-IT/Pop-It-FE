/**
 * 공간 카테고리 enum ↔ 화면 표기 라벨의 단일 출처.
 * SpaceCard 뱃지, 공간 탐색 필터 등에서 공용으로 쓴다.
 */

export type SpaceCategory =
  | "POPUP_STORE"
  | "EXHIBITION_GALLERY"
  | "COMPLEX_SPACE"
  | "SHOWROOM"
  | "CAFE_FNB";

export const SPACE_CATEGORY_OPTIONS: { value: SpaceCategory; label: string }[] =
  [
    { value: "POPUP_STORE", label: "팝업스토어" },
    { value: "EXHIBITION_GALLERY", label: "전시/갤러리" },
    { value: "COMPLEX_SPACE", label: "복합공간" },
    { value: "SHOWROOM", label: "쇼룸" },
    { value: "CAFE_FNB", label: "카페/식음료" },
  ];

export const SPACE_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  SPACE_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
);

/** 원본 enum 문자열(ex. "POPUP_STORE")을 화면 라벨(ex. "팝업스토어")로 변환한다. */
export const mapSpaceCategoryTag = (categoryTag: string): string =>
  SPACE_CATEGORY_LABEL[categoryTag] ?? "";
