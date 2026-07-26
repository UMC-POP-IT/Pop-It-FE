import { useAuthStore } from "@/store/authStore";
import { useWishStore } from "@/store/wishStore";

export const useWishGuard = () => {
  const user = useAuthStore((s) => s.user);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const toggleWish = useWishStore((s) => s.toggleWish);

  const handleWishToggle = (spaceId: number) => {
    if (!user) {
      openLoginModal({ type: "wish", spaceId });
      return;
    }
    toggleWish(spaceId);
  };

  return { handleWishToggle };
};
