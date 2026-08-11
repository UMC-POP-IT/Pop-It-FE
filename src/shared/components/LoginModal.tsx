import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/shared/components/Logo";
import Button from "@/shared/components/Button";
import { startLogin } from "@/shared/utils/oauth";
import loginIllustration from "@/assets/images/login_illustration.png";
import logoIcon from "@/assets/icons/logo_icon.svg";
import logoText from "@/assets/icons/logo_text.svg";
import iconClose from "@/assets/icons/icon_close.svg";

const KakaoIcon = ({ className = "size-[20px]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.79 1.84 5.25 4.6 6.68-.2.75-.73 2.7-.83 3.12-.13.52.19.51.4.37.17-.11 2.66-1.8 3.74-2.53.68.1 1.38.15 2.09.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
  </svg>
);

const GoogleIcon = ({ className = "size-[20px]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const savePendingAndLogin = (provider: "kakao" | "google", pendingAction: unknown) => {
  if (pendingAction) {
    sessionStorage.setItem("oauth_pending_action", JSON.stringify(pendingAction));
  } else {
    sessionStorage.removeItem("oauth_pending_action");
  }
  startLogin(provider);
};

export const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, pendingAction } = useAuthStore();
  // 모바일/태블릿(lg 미만)과 데스크탑(lg~)은 레이아웃이 달라 닫기 버튼이 DOM에 두 개 존재 — 실제로 보이는(hidden이 아닌) 쪽에 포커스
  const closeButtonRefCompact = useRef<HTMLButtonElement>(null);
  const closeButtonRefDesktop = useRef<HTMLButtonElement>(null);

  // 열릴 때 닫기 버튼으로 포커스 이동
  useEffect(() => {
    if (isLoginModalOpen) {
      const visibleButton = closeButtonRefCompact.current?.offsetParent
        ? closeButtonRefCompact.current
        : closeButtonRefDesktop.current;
      visibleButton?.focus();
    }
  }, [isLoginModalOpen]);

  // Escape 키로 닫기
  useEffect(() => {
    if (!isLoginModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLoginModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isLoginModalOpen, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:px-6">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeLoginModal}
        aria-hidden="true"
      />
      {/* 모바일(~767) · 태블릿(768~1023) 공용 레이아웃 — 세로 스택
          (Figma 5622:55585 모바일 / 5622:55422 태블릿 실측치에서 부담스럽다는 피드백으로 전체 70% 축소 적용) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="로그인"
        className="relative z-10 flex w-full max-w-[230px] flex-col items-center rounded-xl bg-white p-[14px] md:max-w-[504px] md:px-[56px] md:py-[42px] lg:hidden"
      >
        {/* 닫기 버튼 */}
        <div className="flex w-full justify-end">
          <button
            ref={closeButtonRefCompact}
            onClick={closeLoginModal}
            aria-label="닫기"
            className="flex size-[22px] items-center justify-center"
          >
            <img src={iconClose} alt="" className="h-[13px] w-[13px]" />
          </button>
        </div>

        {/* 이미지 + 로고/슬로건 + 버튼 */}
        <div className="flex w-full flex-col items-center gap-[14px]">
          <img
            src={loginIllustration}
            alt=""
            className="h-[189px] w-[161px] object-contain md:h-[194px] md:w-[168px]"
          />

          <div className="flex w-full flex-col items-center gap-[14px]">
            {/* 로고 + 슬로건 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-[11px] p-[7px]">
                <img src={logoIcon} alt="" className="size-[21px]" />
                <img src={logoText} alt="POP-IT" className="h-[18px] w-[95px]" />
              </div>
              <p className="text-primary text-center text-[11px] font-bold leading-[1.4] break-keep">
                빈 공간을 빛나는 기회로
              </p>
            </div>

            {/* 버튼들 */}
            <div className="flex w-full flex-col gap-[8px]">
              <Button
                variant="kakao"
                size="lg"
                className="h-auto! w-full! justify-center! gap-[7px]! rounded-[8px]! px-[11px]! py-[11px]! text-[14px]! font-medium! whitespace-nowrap! text-[rgba(0,0,0,0.85)]! md:px-[28px]!"
                onClick={() => savePendingAndLogin("kakao", pendingAction)}
              >
                <KakaoIcon className="size-[14px]" />
                카카오로 계속하기
              </Button>
              <Button
                variant="google"
                size="lg"
                className="h-auto! w-full! justify-center! gap-[7px]! border-none! px-[11px]! py-[11px]! text-[14px]! font-medium! whitespace-nowrap! text-[#121212]! bg-[#f2f2f2]! hover:bg-[#e8e8e8]! rounded-[6px]! md:px-[28px]!"
                onClick={() => savePendingAndLogin("google", pendingAction)}
              >
                <GoogleIcon className="size-[14px]" />
                구글로 계속하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 데스크탑(1024~) 레이아웃 — 이미지 좌측 배치 (기존 디자인, 이번 작업 범위 아님) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="로그인"
        className="relative z-10 hidden w-full max-w-[840px] items-stretch gap-[67px] rounded-xl bg-white lg:flex lg:px-[84px] lg:py-[67px]"
      >
        {/* 이미지 영역 */}
        <div className="flex h-[310px] w-[264px] shrink-0 items-end justify-center">
          <img src={loginIllustration} alt="" className="h-full w-full object-contain object-bottom" />
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="flex flex-1 flex-col items-end justify-between">
          {/* X 버튼 */}
          <button
            ref={closeButtonRefDesktop}
            onClick={closeLoginModal}
            aria-label="닫기"
            className="text-text-secondary hover:text-text-primary -mt-4 size-[27px] shrink-0 text-xl"
          >
            ✕
          </button>

          {/* 로고 + 슬로건 + 버튼 */}
          <div className="flex w-full flex-col items-center gap-[50px]">
            {/* 로고 + 슬로건 */}
            <div className="flex flex-col items-center">
              <div className="p-[13px]">
                <Logo variant="login" />
              </div>
              <p className="text-primary text-center text-[22px] font-bold leading-[1.4] break-keep">
                빈 공간을 빛나는 기회로
              </p>
            </div>

            {/* 버튼들 */}
            <div className="flex w-full flex-col gap-[10px]">
              <Button
                variant="kakao"
                size="lg"
                className="h-auto! gap-[8px]! rounded-[12px]! px-[34px]! py-[13px]! text-[17px]! font-bold!"
                onClick={() => savePendingAndLogin("kakao", pendingAction)}
              >
                <KakaoIcon />
                카카오로 계속하기
              </Button>
              <Button
                variant="google"
                size="lg"
                className="h-auto! gap-[8px]! border-none! px-[34px]! py-[13px]! text-[17px]! font-bold! text-google-text! bg-[#f2f2f2]! hover:bg-[#e8e8e8]! rounded-[8px]!"
                onClick={() => savePendingAndLogin("google", pendingAction)}
              >
                <GoogleIcon />
                구글로 계속하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
