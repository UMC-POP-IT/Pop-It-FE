import type { User } from "@/types";

const BASE_URL = "https://api.popit.co.kr";

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
  window.location.href = `${BASE_URL}/api/v1/auth/oauth/${provider}?challenge=${challenge}`;
}

async function exchangeTokens(code: string, verifier: string): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, verifier }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const json = await res.json();
  return json.result ?? json;
}

async function fetchMe(accessToken: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
  const json = await res.json();
  return json.result ?? json;
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
