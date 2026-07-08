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
      <div className="relative z-10 flex w-full max-w-[1200px] items-center gap-5 rounded-xl bg-white px-6 py-20 md:px-[102px]">
        <div className="bg-divider h-[505px] w-[488px] shrink-0" />

        <div className="flex w-[488px] flex-col items-end gap-15">
          <button
            onClick={closeLoginModal}
            aria-label="닫기"
            className="text-text-secondary hover:text-text-primary size-12 text-2xl"
          >
            ✕
          </button>

          <div className="flex w-full flex-col items-center gap-30">
            <div className="flex flex-col items-center">
              <Logo variant="login" />
              <p className="text-primary text-center text-[32px] font-bold">
                빈 공간을 빛나는 기회로
              </p>
            </div>

            <div className="flex w-full flex-col gap-3">
              <button className="bg-kakao text-kakao-text flex w-full items-center justify-center gap-3 rounded-lg px-10 py-4 text-xl font-bold">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.79 1.84 5.25 4.6 6.68-.2.75-.73 2.7-.83 3.12-.13.52.19.51.4.37.17-.11 2.66-1.8 3.74-2.53.68.1 1.38.15 2.09.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                </svg>
                카카오 로그인/회원가입
              </button>
              <button className="bg-naver text-naver-text flex w-full items-center justify-center gap-3 rounded-lg px-10 py-4 text-xl font-bold">
                <span className="flex size-[18px] items-center justify-center text-sm font-bold">
                  N
                </span>
                네이버 로그인/회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
