import axios from "axios";

// 팀 공통 API 클라이언트 — 서버 주소를 미리 설정해둔 axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000, // 10초 안에 응답이 없으면 중단 (무한 로딩 방지)
  headers: { "Content-Type": "application/json" },
});

/**
 * 요청 직전에 로그인 토큰을 자동으로 붙인다.
 * 토큰 저장 위치는 로그인 구현(shared/utils/oauth.ts)과 동일하게 localStorage를 따른다.
 * 토큰이 없으면 그냥 통과 — 인증이 필요 없는 API(예: 시설 목록)도 있기 때문.
 *
 * TODO: 401 응답 시 POST /api/v1/auth/reissue 로 갱신하는 응답 인터셉터 추가
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
