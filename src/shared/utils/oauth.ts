import type { User } from "@/types";
import { apiFetch } from "@/shared/utils/apiClient";
export { reissueToken } from "@/shared/utils/tokenUtils";

// 서버 응답 전용 타입 (/api/v1/users/me 실제 응답 스펙)
interface UserApi {
  userId: number;
  nickname: string;
  currentMode: "HOST" | "GUEST";
  hasHostProfile: boolean;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL)
  throw new Error("VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.");

function generateVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function startLogin(provider: "kakao" | "google"): Promise<void> {
  const verifier = generateVerifier();
  const challenge = await generateChallenge(verifier);
  sessionStorage.setItem("oauth_verifier", verifier);
  const params = new URLSearchParams({
    challenge,
    origin: window.location.origin,
  });
  window.location.href = `${BASE_URL}/api/v1/auth/oauth/${provider}?${params.toString()}`;
}

/*
 * POST /api/v1/auth/exchange
 * Request:  { code: string, verifier: string }
 * Response: { isSuccess: boolean, code: string, message: string,
 *             result: { accessToken: string, refreshToken: string } }
 *
 * 토큰 저장 전략:
 *   - accessToken / refreshToken → 현재 localStorage 임시 저장
 *   - TODO: XSS 보안 강화를 위해 백엔드와 협의 후 HttpOnly 쿠키 방식으로 전환 필요
 *   - refreshToken 갱신: 401 응답 인터셉터에서 POST /api/v1/auth/refresh 호출 (apiClient.ts)
 */
async function exchangeTokens(
  code: string,
  verifier: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, verifier }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
    const json = await res.json();
    return json.result ?? json;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchMe(accessToken: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
  const json = await res.json();
  const api: UserApi = json.result ?? json;
  // TODO: User 타입과 서버 응답(UserApi) 불일치 — #150 팀 논의 후 User 타입 수정 필요
  return { id: api.userId, nickname: api.nickname, currentMode: api.currentMode } as User;
}

/*
 * POST /api/v1/auth/logout
 * Request body 없음 — Authorization 헤더로 식별
 * 실패해도 로컬 토큰은 반드시 삭제
 */
export async function logoutApi(): Promise<void> {
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {});
  }
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

/*
 * PATCH /api/v1/users/me/mode
 * Request:  { mode: "HOST" | "GUEST" }
 * Response: UserInfoRes { userId, nickname, currentMode, hasHostProfile }
 * 400: 필수값 누락/형식 오류
 * 403: 호스트 미등록 상태에서 HOST로 전환 시도 → /host/host-register 로 라우팅
 */
export async function switchMode(
  targetMode: "HOST" | "GUEST",
): Promise<User> {
  const accessToken = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/api/v1/users/me/mode`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ mode: targetMode }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const err = Object.assign(
      new Error(json?.message ?? `Mode switch failed: ${res.status}`),
      { status: res.status },
    );
    throw err;
  }
  const json = await res.json();
  return json.result ?? json;
}

/*
 * GET /api/v1/users/me — 새로고침 등으로 앱이 다시 시작될 때
 * localStorage에 남아있는 토큰으로 로그인 상태를 복원하기 위해 사용.
 * apiFetch를 통해 호출하므로 accessToken이 만료됐어도 401 시 자동으로 재발급 후 재시도한다.
 */
export async function getCurrentUser(): Promise<User> {
  const res = await apiFetch<UserApi>("/api/v1/users/me");
  // TODO: User 타입과 서버 응답(UserApi) 불일치 — #150 팀 논의 후 User 타입 수정 필요
  return { id: res.userId, nickname: res.nickname, currentMode: res.currentMode } as User;
}

export async function handleOAuthCallback(code: string): Promise<User> {
  const verifier = sessionStorage.getItem("oauth_verifier");
  if (!verifier) throw new Error("OAuth verifier not found");

  const { accessToken, refreshToken } = await exchangeTokens(code, verifier);

  // TODO: XSS 보안 강화를 위해 백엔드와 협의 후 HttpOnly 쿠키 방식으로 전환 필요
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  sessionStorage.removeItem("oauth_verifier");

  return fetchMe(accessToken);
}

/*
 * GET /api/v1/hosts/me
 * 200 → 호스트로 등록됨 / 404 → 아직 미등록 (오류가 아니라 정상 상태)
 * 그 외(401·500 등)는 진짜 오류라 그대로 던진다.
 */
export interface HostProfileRes {
  id: number;
  userId: number;
  taxationType: string;
  businessRegistrationNumber: string;
  businessLicenseUrl: string;
  businessName: string;
  businessAddress: string;
  bank: string;
  settlementAccountNumber: string;
  accountHolder: string;
  bankbookCopyUrl: string;
  createdAt: string;
}

export const getMyHost = async (): Promise<HostProfileRes | null> => {
  try {
    return await apiFetch<HostProfileRes>("/api/v1/hosts/me");
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
};
