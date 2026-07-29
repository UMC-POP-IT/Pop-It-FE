import axios from "axios";

//팀 공통 API 클라이언트- 서버 주소를 미리 설정해둔 axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
