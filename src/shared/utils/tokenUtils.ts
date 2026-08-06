const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) throw new Error("VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.");

export async function reissueToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/api/v1/auth/reissue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error(`Reissue failed: ${res.status}`);
  const data: unknown = await res.json();
  const json = data as Record<string, unknown>;
  // apiClient.ts의 parseResponse와 동일하게 result로 감싸진 응답을 우선 사용한다.
  const result = (json.result ?? json) as Record<string, unknown>;
  const token = typeof result.accessToken === "string" ? result.accessToken.trim() : "";
  if (!token) throw new Error("Invalid reissue response: accessToken missing");
  localStorage.setItem("access_token", token);
  return token;
}
