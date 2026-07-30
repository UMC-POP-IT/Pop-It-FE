import type { User } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  window.location.href = `${BASE_URL}/api/v1/auth/oauth/${provider}?challenge=${challenge}&origin=${encodeURIComponent(window.location.origin)}`;
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
 *   - refreshToken 갱신: 추후 401 응답 인터셉터에서 POST /api/v1/auth/reissue 호출 예정
 */
async function exchangeTokens(code: string, verifier: string): Promise<{ accessToken: string; refreshToken: string }> {
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
  return json.result ?? json;
}

export async function handleOAuthCallback(code: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const verifier = sessionStorage.getItem("oauth_verifier");
  if (!verifier) throw new Error("OAuth verifier not found");

  const { accessToken, refreshToken } = await exchangeTokens(code, verifier);

  // TODO: XSS 보안 강화를 위해 백엔드와 협의 후 HttpOnly 쿠키 방식으로 전환 필요
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  sessionStorage.removeItem("oauth_verifier");

  const user = await fetchMe(accessToken);
  return { user, accessToken, refreshToken };
}
