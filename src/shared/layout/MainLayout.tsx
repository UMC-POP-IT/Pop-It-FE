import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { LoginModal } from "@/shared/components/LoginModal";
import { useAuthStore } from "@/store/authStore";
import { useWishStore } from "@/store/wishStore";

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
  }, [user, pendingAction]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

const RouteModeSync = () => {
  const { pathname } = useLocation();
  const setMode = useAuthStore((s) => s.setMode);

  useEffect(() => {
    setMode(pathname.startsWith("/host") ? "HOST" : "GUEST");
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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
  </div>
);
