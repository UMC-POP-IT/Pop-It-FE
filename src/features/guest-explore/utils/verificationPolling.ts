import { GetVerificationStatus } from "@/features/guest-explore/api/my_reservation_api";

const RETRY_INTERVAL_MS = 1500;
const MAX_RETRIES = 3;

// PortOne 인증 완료 직후 서버 확정 반영이 약간 지연될 수 있어, 실패 시 잠시 뒤 상태를 재조회해 확인한다.
export const pollVerificationStatus = async (
  isCancelled: () => boolean,
  retries = MAX_RETRIES,
  delayMs = RETRY_INTERVAL_MS,
): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    if (isCancelled()) return false;
    try {
      const { isVerified } = await GetVerificationStatus();
      if (isVerified) return true;
    } catch {
      // 재조회 실패는 무시하고 다음 시도로 넘어간다.
    }
  }
  return false;
};
