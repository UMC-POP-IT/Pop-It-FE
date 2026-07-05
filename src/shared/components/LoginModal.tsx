import { useAuthStore } from "@/store/authStore";
import Logo from "@/shared/components/Logo";

export const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal } = useAuthStore();

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeLoginModal}
      />
      <div className="relative z-10 w-[400px] rounded-2xl bg-white shadow-xl">
        {/* X 버튼 */}
        <button
          onClick={closeLoginModal}
          className="text-text-secondary hover:text-text-primary absolute top-4 right-4 text-xl"
        >
          ✕
        </button>

        {/* 디자인 나오면 여기 채우기 */}
        <div className="flex flex-col items-center gap-4 p-8">
          <Logo variant="login" />
          <p className="text-text-secondary text-sm">
            로그인 디자인 나오면 채울 예정
          </p>
        </div>
      </div>
    </div>
  );
};
