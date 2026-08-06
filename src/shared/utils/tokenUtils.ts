const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) throw new Error("VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.");

export async function reissueToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error(`Reissue failed: ${res.status}`);
  const data: unknown = await res.json();
  const raw = data as Record<string, unknown>;
  const token =
    typeof raw?.accessToken === "string" && raw.accessToken.trim()
      ? raw.accessToken
      : typeof (raw?.result as Record<string, unknown>)?.accessToken === "string" &&
          ((raw?.result as Record<string, unknown>).accessToken as string).trim()
        ? ((raw?.result as Record<string, unknown>).accessToken as string)
        : null;
  if (!token) throw new Error("Invalid reissue response: accessToken missing");
  localStorage.setItem("access_token", token);
  return token;
}
