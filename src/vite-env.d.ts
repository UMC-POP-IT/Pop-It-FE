/// <reference types="vite/client" />

declare module "*.css" {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_TOSS_PAYMENTS_CLIENT_KEY: string;
  readonly VITE_PORTONE_STORE_ID: string;
  readonly VITE_PORTONE_CHANNEL_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}