import type { HostRegisterForm } from "@/store/registerStore";
import {
  BANK_TO_ENUM,
  TAXATION_TYPE_TO_ENUM,
  type BankEnum,
  type TaxationTypeEnum,
} from "@/features/host-register/constants/host_enum";
import { toEnum } from "@/features/host-register/utils/to_enum";

/** POST /api/v1/hosts 요청 본문 (스웨거 HostRegisterReq) */
export interface HostRequest {
  taxationType: TaxationTypeEnum;
  businessRegistrationNumber: string;
  businessLicenseUrl: string;
  businessName: string;
  businessAddress: string;
  bank: BankEnum;
  settlementAccountNumber: string;
  accountHolder: string;
  bankbookCopyUrl: string;
}

/**
 * 호스트 등록 폼 값을 서버 요청 형식으로 바꾼다.
 * 서류 두 장은 미리 업로드해서 받은 URL을 넘겨야 한다 (api/upload_api.ts)
 */
export const toHostRequest = (
  form: HostRegisterForm,
  businessLicenseUrl: string,
  bankbookCopyUrl: string,
): HostRequest => ({
  taxationType: toEnum(TAXATION_TYPE_TO_ENUM, form.taxpayerType, "과세자 유형"),
  businessRegistrationNumber: form.businessNumber,
  businessLicenseUrl,
  businessName: form.storeName,
  // 서버는 businessAddress 한 필드만 받는다 (스웨거: "기본+상세 병합")
  businessAddress:
    `${form.businessAddress} ${form.businessDetailAddress}`.trim(),
  bank: toEnum(BANK_TO_ENUM, form.bankName, "은행"),
  settlementAccountNumber: form.accountNumber,
  accountHolder: form.accountHolder.trim(),
  bankbookCopyUrl,
});
