import { NavLink, useNavigate } from "react-router-dom";
import Logo from "@/shared/components/Logo";
import { useAuthStore } from "@/store/authStore";

const Header = () => {
  const { user, mode, setMode, openLoginModal } = useAuthStore();
  const navigate = useNavigate();

  const handleModeToggle = () => {
    if (mode === "GUEST") {
      setMode("HOST");
      navigate("/host/spaces");
    } else {
      setMode("GUEST");
      navigate("/");
    }
  };

  return (
    <header className="border-border sticky top-0 z-40 w-full border-b bg-white">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-8 px-6">
        <NavLink
          to="/"
          className="flex-shrink-0"
        >
          <Logo variant="header" />
        </NavLink>

        <nav className="flex gap-6">
          {mode === "HOST" ? (
            <>
              <NavLink
                to="/host/spaces"
                className={({ isActive }) =>
                  `pb-0.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary border-primary border-b-2"
                      : "text-text-secondary hover:text-text-primary"
                  }`
                }
              >
                내 공간
              </NavLink>
              <NavLink
                to="/host/reservations"
                className={({ isActive }) =>
                  `pb-0.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary border-primary border-b-2"
                      : "text-text-secondary hover:text-text-primary"
                  }`
                }
              >
                예약 관리
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/explore"
                className={({ isActive }) =>
                  `pb-0.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary border-primary border-b-2"
                      : "text-text-secondary hover:text-text-primary"
                  }`
                }
              >
                공간탐색
              </NavLink>
              <NavLink
                to="/reservations"
                className={({ isActive }) =>
                  `pb-0.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary border-primary border-b-2"
                      : "text-text-secondary hover:text-text-primary"
                  }`
                }
              >
                나의 예약
              </NavLink>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* 모드 전환 버튼 */}
          <button
            onClick={handleModeToggle}
            className="text-text-secondary border-border hover:bg-primary-light rounded-lg border px-3 py-1.5 text-sm transition-colors"
          >
            {mode === "GUEST" ? "호스트 센터 >" : "게스트 홈 >"}
          </button>

          {/* 로그인 상태에 따라 분기 */}
          {user ? (
            <button className="text-text-primary flex items-center gap-2 text-sm">
              <div className="bg-primary-100 h-7 w-7 rounded-full" />
              {user.nickname} 님
            </button>
          ) : (
            <button
              onClick={openLoginModal}
              className="text-primary text-sm font-medium"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
