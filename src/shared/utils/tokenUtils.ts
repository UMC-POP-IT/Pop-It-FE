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
  const json = await res.json();
  const { accessToken } = json.result ?? json;
  localStorage.setItem("access_token", accessToken);
  return accessToken;
}
