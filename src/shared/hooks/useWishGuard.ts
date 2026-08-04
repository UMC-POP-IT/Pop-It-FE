import { useAuthStore } from "@/store/authStore";
import { useWishStore } from "@/store/wishStore";
import { wishToggle } from "@/features/guest-explore/api/spaces_api";

// 모듈 스코프로 둬서 useWishGuard를 호출하는 모든 컴포넌트 인스턴스가 공유한다.
// 같은 spaceId로 처리 중인 요청이 있으면 재요청을 막는다 - 그렇지 않으면 같은 카드를
// 빠르게 두 번 눌렀을 때 두 응답이 요청 순서와 다르게 도착하며 로컬 상태가 서버와
// 어긋날 수 있다(늦게 도착한 응답이 이미 반영된 최신 응답을 덮어씀).
const pendingSpaceIds = new Set<number>();

export const useWishGuard = () => {
  const user = useAuthStore((s) => s.user);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const localWishToggle = useWishStore((s) => s.localWishToggle);

  const handleWishToggle = async (spaceId: number) => {
    if (!user) {
      openLoginModal({ type: "wish", spaceId });
      return;
    }

    if (pendingSpaceIds.has(spaceId)) return; // 이전 요청이 처리 중이면 무시
    pendingSpaceIds.add(spaceId);

    localWishToggle(spaceId); // 낙관적 업데이트: 응답을 기다리지 않고 로컬 상태부터 반영

    try {
      const { isWishlisted } = await wishToggle(spaceId);
      // 낙관적으로 가정한 결과와 서버가 확정한 결과가 다르면(멀티탭 등) 다시 토글해서
      // heartCount까지 함께 서버 값에 맞춰 되돌린다.
      const isLocallyWished = useWishStore.getState().wishedIds.includes(spaceId);
      if (isLocallyWished !== isWishlisted) {
        localWishToggle(spaceId);
      }
    } catch (error) {
      localWishToggle(spaceId); // API 실패 시 롤백 (다시 토글해서 이전 상태로 복원)
      throw error; // 호출부(AiRecommendSpace 등)의 자체 롤백이 동작하도록 재전파
    } finally {
      pendingSpaceIds.delete(spaceId);
    }
  };

  return { handleWishToggle };
};
