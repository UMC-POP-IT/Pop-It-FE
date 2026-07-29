import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { LoginModal } from "@/shared/components/LoginModal";
import { useAuthStore } from "@/store/authStore";
import { useWishStore } from "@/store/wishStore";
import { handleOAuthCallback } from "@/shared/utils/oauth";

const PendingActionExecutor = () => {
  const user = useAuthStore((s) => s.user);
  const pendingAction = useAuthStore((s) => s.pendingAction);
  const clearPendingAction = useAuthStore((s) => s.clearPendingAction);
  const setMode = useAuthStore((s) => s.setMode);
  const toggleWish = useWishStore((s) => s.toggleWish);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !pendingAction) return;
    switch (pendingAction.type) {
      case "wish":
        toggleWish(pendingAction.spaceId);
        break;
      case "navigate":
        navigate(pendingAction.path);
        break;
      case "modeToggle":
        setMode(pendingAction.targetMode);
        navigate(pendingAction.navigateTo);
        break;
    }
    clearPendingAction();
    // navigate·toggleWish·setMode·clearPendingAction은 안정적 참조(stable ref)라 deps 제외
  }, [user, pendingAction]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

const OAuthCallbackHandler = () => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    // URL에서 code 제거 (히스토리 오염 방지)
    const cleanUrl = window.location.pathname;
    window.history.replaceState(null, "", cleanUrl);

    handleOAuthCallback(code)
      .then((user) => {
        login(user);
        navigate("/", { replace: true });
      })
      .catch((err) => {
        console.error("OAuth token exchange failed:", err);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

const RouteModeSync = () => {
  const { pathname } = useLocation();
  const setMode = useAuthStore((s) => s.setMode);

  useEffect(() => {
    // /host/* 직접 접근 시 헤더 모드를 URL에 맞게 동기화
    setMode(pathname.startsWith("/host") ? "HOST" : "GUEST");
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps (setMode는 stable ref)

  return null;
};

export const MainLayout = () => (
  <div className="bg-bg flex min-h-screen flex-col">
    <Header />
    <main className="mx-auto w-full max-w-screen-xl flex-1 px-6 py-8">
      <Outlet />
    </main>
    <Footer />
    <LoginModal />
    <PendingActionExecutor />
    <RouteModeSync />
    <OAuthCallbackHandler />
  </div>
);
