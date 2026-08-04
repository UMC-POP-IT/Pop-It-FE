import { apiFetch } from "@/shared/utils/apiClient";
import type { SpaceRequest } from "@/features/host-register/utils/to_space_request";

/** POST /api/v1/spaces 응답 (스웨거 SpaceCreateRes) */
export interface SpaceCreateRes {
  spaceId: number;
  buildingName: string;
}

/** PATCH /api/v1/spaces/{spaceId} 응답 (스웨거 SpaceUpdateRes) */
export interface SpaceUpdateRes {
  spaceId: number;
}

/** 공간 등록 (성공 201) */
export const createSpace = (request: SpaceRequest) =>
  apiFetch<SpaceCreateRes>("/api/v1/spaces", {
    method: "POST",
    body: JSON.stringify(request),
  });

/**
 * 공간 수정 (성공 200)
 * 서버는 "보낸 필드만 반영, 생략하면 기존 값 유지"로 동작한다.
 * 폼이 항상 전체 값을 들고 있으므로 전부 보낸다.
 */
export const updateSpace = (spaceId: number, request: SpaceRequest) =>
  apiFetch<SpaceUpdateRes>(`/api/v1/spaces/${spaceId}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
