/// <reference types="vite/client" />

declare module "*.css" {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_TOSS_PAYMENTS_CLIENT_KEY: string;
  readonly VITE_PORTONE_STORE_ID: string;
  readonly VITE_PORTONE_CHANNEL_KEY: string;
  /** 카카오 지도 JavaScript SDK 앱 키 (https://developers.kakao.com) */
  readonly VITE_KAKAO_JS_KEY: string;
   // 백엔드 API 서버 주소 (https://api.popit.co.kr)
  readonly VITE_API_BASE_URL: string;
  // 개발용 임시 로그인 accessToken / refreshToken (실제 로그인 API 연동 전까지 사용)
  readonly VITE_DEV_ACCESS_TOKEN: string;
  readonly VITE_DEV_REFRESH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}