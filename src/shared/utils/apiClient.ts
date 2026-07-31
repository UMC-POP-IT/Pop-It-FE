import { reissueToken } from "@/shared/utils/tokenUtils";

const BASE_URL = "https://api.popit.co.kr";

interface ApiError extends Error {
  status: number;
  code?: string;
}

function buildHeaders(options: RequestInit): HeadersInit {
  const accessToken = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  const json = JSON.parse(text);
  return json.result ?? json;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  // 401 → 토큰 재발급 후 1회 재시도
  if (res.status === 401) {
    try {
      await reissueToken();
    } catch {
      const err = new Error("Unauthorized") as ApiError;
      err.status = 401;
      throw err;
    }
    const retryRes = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(options),
    });
    if (!retryRes.ok) {
      const json = await retryRes.json().catch(() => null);
      const err = new Error(json?.message ?? `API error: ${retryRes.status}`) as ApiError;
      err.status = retryRes.status;
      err.code = json?.code;
      throw err;
    }
    return parseResponse<T>(retryRes);
  }

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const err = new Error(json?.message ?? `API error: ${res.status}`) as ApiError;
    err.status = res.status;
    err.code = json?.code;
    throw err;
  }

  return parseResponse<T>(res);
}
