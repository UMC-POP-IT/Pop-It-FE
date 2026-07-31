const BASE_URL = "https://api.popit.co.kr";

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
