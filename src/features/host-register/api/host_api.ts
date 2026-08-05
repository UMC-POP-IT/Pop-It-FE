import { apiFetch } from "@/shared/utils/apiClient";
import type { HostRequest } from "@/features/host-register/utils/to_host_request";

/** POST /api/v1/hosts 응답 (스웨거 HostRegisterRes) */
export interface HostRegisterRes {
  id: number;
  createdAt: string;
}

/**
 * 호스트 등록 (성공 201)
 * 409 → 이미 등록된 호스트 프로필. apiFetch가 status 409로 에러를 던진다.
 */
export const registerHost = (request: HostRequest) =>
  apiFetch<HostRegisterRes>("/api/v1/hosts", {
    method: "POST",
    body: JSON.stringify(request),
  });
