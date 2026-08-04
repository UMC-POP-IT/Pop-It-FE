/**
 * 호스트 등록 폼 라벨(한글) ↔ 서버 enum 매핑표.
 * 값 출처: 스웨거 HostRegisterReq (/v3/api-docs → Schema 탭)
 * 라벨 출처: features/host-register/api/mock_register.ts
 */

export type TaxationTypeEnum = "SIMPLIFIED" | "GENERAL";

export type BankEnum =
  | "KB"
  | "WOORI"
  | "SHINHAN"
  | "HANA"
  | "NH"
  | "IBK"
  | "KAKAO_BANK"
  | "TOSS_BANK";

/** 과세자 유형 (HostRegisterStep1) — TAXPAYER_OPTIONS의 title이 그대로 저장된다 */
export const TAXATION_TYPE_TO_ENUM: Record<string, TaxationTypeEnum> = {
  "개인사업자 - 간이과세자": "SIMPLIFIED",
  "개인사업자 - 일반과세자": "GENERAL",
};

/** 은행 (HostRegisterStep2) */
export const BANK_TO_ENUM: Record<string, BankEnum> = {
  국민은행: "KB",
  신한은행: "SHINHAN",
  우리은행: "WOORI",
  하나은행: "HANA",
  농협은행: "NH",
  기업은행: "IBK",
  카카오뱅크: "KAKAO_BANK",
  토스뱅크: "TOSS_BANK",
};
