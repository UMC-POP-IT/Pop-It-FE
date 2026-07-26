import { useAuthStore } from "@/store/authStore";
import Logo from "@/shared/components/Logo";
import Button from "@/shared/components/Button";

const DEV_USER = {
  id: 1,
  email: "dev@pop-it.kr",
  nickname: "개발자",
  role: "GUEST" as const,
};

export const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuthStore();

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeLoginModal}
      />
      <div className="relative z-10 flex w-full max-w-[1200px] items-center gap-5 rounded-xl bg-white px-[102px] py-20">
        <div className="bg-divider h-[505px] w-[488px] shrink-0" />

        <div className="flex w-[488px] flex-col items-end gap-[60px]">
          <button
            onClick={closeLoginModal}
            aria-label="닫기"
            className="text-text-secondary hover:text-text-primary size-12 text-4xl"
          >
            ✕
          </button>

          <div className="flex w-full flex-col items-center gap-[120px]">
            <div className="flex flex-col items-center gap-4 p-5">
              <Logo variant="login" />
              <p className="text-primary text-center text-[32px] font-bold leading-[1.4]">
                빈 공간을 빛나는 기회로
              </p>
            </div>

            <div className="flex w-full flex-col gap-3">
              {import.meta.env.DEV && (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto! border-dashed! px-[40px]! py-[16px]! text-xl! font-bold!"
                  onClick={() => login(DEV_USER)}
                >
                  🛠️ 임시 로그인 (개발용)
                </Button>
              )}
              <Button variant="kakao" size="lg" className="h-auto! gap-3 px-[40px]! py-[16px]! text-xl! font-bold!">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.79 1.84 5.25 4.6 6.68-.2.75-.73 2.7-.83 3.12-.13.52.19.51.4.37.17-.11 2.66-1.8 3.74-2.53.68.1 1.38.15 2.09.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                </svg>
                카카오 로그인/회원가입
              </Button>
              <Button variant="google" size="lg" className="h-auto! gap-3 px-[40px]! py-[16px]! text-xl! font-bold! text-google-text!">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                구글 로그인/회원가입
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
