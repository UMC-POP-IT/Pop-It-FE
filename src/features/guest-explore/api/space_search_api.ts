import { apiFetch } from "@/shared/utils/apiClient";
import type { Space } from "@/types";
import { SPACE_CATEGORY_OPTIONS } from "@/shared/utils/spaceCategory";
import type { SpaceCategory } from "@/shared/utils/spaceCategory";
import { normalizeKeywords } from "@/shared/utils/keyword";

// ============================================================
// GET /api/v1/spaces - 공간 탐색 (검색/필터)
// (#145) 게스트 메인 화면의 공간 탐색 목록 - 통합 검색 + 필터 + 페이지네이션
// ============================================================

export type { SpaceCategory };
/** 용도(카테고리) 필터 드롭다운 옵션 */
export { SPACE_CATEGORY_OPTIONS };

/** 서울 25개 자치구 - 지역 필터 드롭다운 옵션 */
export const SEOUL_DISTRICTS = [
  "종로구",
  "중구",
  "용산구",
  "성동구",
  "광진구",
  "동대문구",
  "중랑구",
  "성북구",
  "강북구",
  "도봉구",
  "노원구",
  "은평구",
  "서대문구",
  "마포구",
  "양천구",
  "강서구",
  "구로구",
  "금천구",
  "영등포구",
  "동작구",
  "관악구",
  "서초구",
  "강남구",
  "송파구",
  "강동구",
] as const;

/** 그리드 4x7 = 한 페이지당 28개 (백엔드 기본값과 동일) */
export const DEFAULT_PAGE_SIZE = 28;

export interface SpaceSearchParams {
  keyword?: string;
  spaceCategory?: SpaceCategory | "";
  district?: string;
  /** 0부터 시작 */
  page?: number;
  /** 1~50, 기본 28 */
  size?: number;
}

/** 서버 응답(result.spaces[i]) 원본 스펙 */
export interface SpaceSearchItemRes {
  spaceId: number;
  buildingName: string;
  district: string;
  roadAddress: string;
  spaceCategory: string;
  /** "#지역동", "#공간유형" 순서, 동 정보 없으면 공간유형 하나만 내려옴 */
  keywords: string[];
  displayPrice: number;
  thumbnailUrl: string | null;
  isWishlisted: boolean;
  wishCount: number;
  latitude: number;
  longitude: number;
}

export interface SpaceSearchRes {
  spaces: SpaceSearchItemRes[];
  totalCount: number;
  currentPage: number;
  hasNext: boolean;
}

/**
 * 공간 탐색(검색/필터) 목록을 조회한다.
 * 비로그인 상태에서도 호출 가능 (이 경우 isWishlisted는 항상 false).
 * page는 0부터 시작(백엔드 기준), size는 1~50 (기본 28 = 4x7 그리드).
 * 빈 문자열 필터는 "전체"를 의미하므로 요청에서 아예 생략한다.
 */
export const getSpaces = async (params: SpaceSearchParams = {}) => {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.spaceCategory) query.set("spaceCategory", params.spaceCategory);
  if (params.district) query.set("district", params.district);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? DEFAULT_PAGE_SIZE));

  return apiFetch<SpaceSearchRes>(`/api/v1/spaces?${query.toString()}`);
};

/**
 * 공간 탐색(목록) 카드/지도 UI에서 바로 쓸 수 있는 형태.
 * 상세 조회 전용 필드(area/facilities/spaceInfo/description 등)는
 * 이 API 응답에 없으므로, 목록/지도 화면이 실제로 쓰는 필드만 정의한다.
 */
export interface SpaceSummary extends Space {
  spaceId: number;
  // 카드 하단 카테고리 뱃지용 원본 enum 문자열(ex. "POPUP_STORE").
  // SpaceCard가 categoryTag로 받아 내부에서 라벨로 변환하므로 여기서는 변환하지 않는다.
  category: string;
  district: string;
  isWishlisted: boolean;
  latitude: number;
  longitude: number;
}

export const toSpaceSummary = (item: SpaceSearchItemRes): SpaceSummary => ({
  id: item.spaceId,
  spaceId: item.spaceId,
  hostId: 0, // 탐색 응답에는 hostId가 내려오지 않음 (카드/지도에서 사용하지 않음)
  imageUrls: item.thumbnailUrl ? [item.thumbnailUrl] : [],
  heartCount: item.wishCount,
  name: item.buildingName,
  address: item.roadAddress,
  district: item.district,
  cost: { day: item.displayPrice },
  keywords: normalizeKeywords(item.keywords ?? []),
  description: "",
  createdAt: "",
  category: item.spaceCategory,
  isWishlisted: item.isWishlisted,
  latitude: item.latitude,
  longitude: item.longitude,
});
