import { useAuthStore } from "@/store/authStore";
import { useWishStore } from "@/store/wishStore";
import { wishToggle } from "@/features/guest-explore/api/spaces_api";

export const useWishGuard = () => {
  const user = useAuthStore((s) => s.user);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const localWishToggle = useWishStore((s) => s.localWishToggle);

  const handleWishToggle = async (spaceId: number) => {
    if (!user) {
      openLoginModal({ type: "wish", spaceId });
      return;
    }

    localWishToggle(spaceId); // 낙관적 업데이트: 응답을 기다리지 않고 로컬 상태부터 반영

    try {
      await wishToggle(spaceId);
    } catch (error) {
      localWishToggle(spaceId); // API 실패 시 롤백 (다시 토글해서 이전 상태로 복원)
      throw error; // 호출부(AiRecommendSpace 등)의 자체 롤백이 동작하도록 재전파
    }
  };

  return { handleWishToggle };
};
