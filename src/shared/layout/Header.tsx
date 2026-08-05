import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import Logo from "@/shared/components/Logo";
import { useAuthStore } from "@/store/authStore";
import { logoutApi, switchMode } from "@/shared/utils/oauth";

const Header = () => {
  const { user, mode, setMode, openLoginModal, hostStatus, refreshHostStatus, logout } =
    useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const hideModeToggle = mode === "GUEST" && pathname === "/reservations";
  const [modeError, setModeError] = useState(""); // 모드 전환 실패 사유
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const closeProfileMenu = useCallback(() => setIsProfileMenuOpen(false), []);

  // 프로필 메뉴 외부 클릭 시 닫기 — 메뉴가 열려있을 때만 등록
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        e.target instanceof Node &&
        !profileMenuRef.current.contains(e.target)
      ) {
        closeProfileMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen, closeProfileMenu]);

  // 프로필 메뉴 Escape 닫기
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeProfileMenu();
        profileButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isProfileMenuOpen, closeProfileMenu]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate("/");
    logoutApi().catch((err) => console.error("[Header] 로그아웃 서버 요청 실패:", err));
  };

  const handleModeToggle = async () => {
    setModeError(""); // 이전 실패 문구 지우기

    // 비로그인: 호스트 여부를 조회할 수 없으므로(401) 등록 화면을 기본값으로 둔다
    if (!user) {
      const targetMode = mode === "GUEST" ? "HOST" : "GUEST";
      const navigateTo = mode === "GUEST" ? "/host/host-register" : "/";
      openLoginModal({ type: "modeToggle", targetMode, navigateTo });
      return;
    }

    // 호스트 → 게스트: 호스트 여부와 무관하므로 조회하지 않는다
    if (mode === "HOST") {
      setMode("GUEST");
      navigate("/");
      // 서버 쪽 currentMode도 동기화 (실패해도 화면 전환은 이미 끝났으니 막지 않는다)
      switchMode("GUEST").catch((err) => {
        console.error("[Header] 게스트 모드 전환 서버 동기화 실패:", err);
      });
      return;
    }

    // 게스트 → 호스트: 아직 안 물어봤으면 지금 물어보고 결과를 기다린다
    const status =
      hostStatus === "unknown" ? await refreshHostStatus() : hostStatus;

    // 조회에 실패하면 등록/미등록을 알 수 없다.
    // 미등록으로 단정하면 이미 등록한 호스트를 등록 화면으로 보내게 되므로 여기서 멈춘다.
    if (status === "unknown") {
      setModeError(
        "호스트 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요",
      );
      return;
    }

    setMode("HOST");
    navigate(status === "registered" ? "/host/spaces" : "/host/host-register");
    if (status === "registered") {
      // 서버 쪽 currentMode도 동기화 (실패해도 화면 전환은 이미 끝났으니 막지 않는다)
      switchMode("HOST").catch((err) => {
        console.error("[Header] 호스트 모드 전환 서버 동기화 실패:", err);
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white drop-shadow-[0px_4px_5px_rgba(0,0,0,0.12)]">
      {/* 피그마: 전체 px-[40px], 좌측 gap-[32px](로고↔nav), 우측 gap-[20px] */}
      <div className="flex h-[74px] w-full items-center px-[10px] md:px-[40px]">
        {/* 좌측: 로고 + nav (gap-[32px]) */}
        <div className="flex items-center gap-8">
          <NavLink
            to={mode === "HOST" ? "/host/spaces" : "/"}
            className="flex h-[74px] w-[120px] flex-shrink-0 items-center justify-center xl:w-[180px]"
          >
            <Logo variant="header" />
          </NavLink>

          {/* nav: 아이템 간 gap 없음, 각 아이템 w-[112px] px-[10px] — 작은 화면에서 숨김 */}
          <nav className="hidden h-[74px] md:flex">
            {mode === "HOST" ? (
              <>
                <NavLink
                  to="/host/spaces"
                  className={({ isActive }) =>
                    `flex h-full w-[112px] items-center justify-center px-[10px] text-base font-bold transition-colors ${
                      isActive
                        ? "text-primary [&>span]:border-b-2 [&>span]:border-[#0564f5]"
                        : "text-text-primary"
                    }`
                  }
                >
                  <span className="flex h-full w-[72px] items-center justify-center">내 공간</span>
                </NavLink>
                <NavLink
                  to="/host/reservations"
                  className={({ isActive }) =>
                    `flex h-full w-[112px] items-center justify-center px-[10px] text-base font-bold transition-colors ${
                      isActive
                        ? "text-primary [&>span]:border-b-2 [&>span]:border-[#0564f5]"
                        : "text-text-primary"
                    }`
                  }
                >
                  <span className="flex h-full w-[72px] items-center justify-center">예약 관리</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex h-full w-[112px] items-center justify-center px-[10px] text-base font-bold transition-colors ${
                      isActive
                        ? "text-primary [&>span]:border-b-2 [&>span]:border-[#0564f5]"
                        : "text-text-primary"
                    }`
                  }
                >
                  <span className="flex h-full w-[72px] items-center justify-center">공간탐색</span>
                </NavLink>
                <button
                  onClick={() => {
                    if (!user) {
                      openLoginModal({ type: "navigate", path: "/reservations" });
                      return;
                    }
                    navigate("/reservations");
                  }}
                  aria-current={pathname === "/reservations" ? "page" : undefined}
                  className={`flex h-full w-[112px] items-center justify-center px-[10px] text-base font-bold transition-colors ${
                    pathname === "/reservations"
                      ? "text-primary [&>span]:border-b-2 [&>span]:border-[#0564f5]"
                      : "text-text-primary"
                  }`}
                >
                  <span className="flex h-full w-[72px] items-center justify-center">나의 예약</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* 우측: 모드전환 + 프로필 (gap-[20px]) */}
        <div className="ml-auto flex items-center gap-5">
          {/* 모드 전환 버튼 — 게스트 모드 나의 예약 탭에서는 숨김 */}
          {!hideModeToggle && (
            <button
              onClick={handleModeToggle}
              className="bg-primary-light text-text-primary flex items-center rounded p-[4px] text-base transition-colors"
            >
              <span className="px-[4px]">
                {mode === "GUEST" ? "호스트 전환" : "게스트 전환"}
              </span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {/* 로그인 상태에 따라 분기 */}
          {user ? (
            <div
              className="relative"
              ref={profileMenuRef}
            >
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                aria-controls="profile-menu"
                className="text-text-primary flex h-[74px] w-auto items-center justify-center gap-3 py-[14px] text-base xl:w-[164px]"
              >
                <div className="bg-primary-light flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full p-[8px]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M4 20c0-4 4-6 8-6s8 2 8 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="hidden md:inline">{user.nickname} 님</span>
              </button>
              {isProfileMenuOpen && (
                <div
                  id="profile-menu"
                  role="menu"
                  className="absolute top-[64px] right-0 z-10 flex flex-col overflow-hidden rounded-[8px] border border-[#f2f2f2] bg-white px-[6px] py-2 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]"
                >
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="text-text-primary rounded-[4px] px-8 py-2 text-center text-base font-bold whitespace-nowrap hover:bg-[#f2f2f2]"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-[74px] w-[164px] items-center justify-center">
              <button
                onClick={() => openLoginModal()}
                className="flex h-[40px] w-full items-center justify-center rounded-[8px] border border-[#3783f7] bg-white px-[24px] py-[6px] text-base leading-[1.4] font-bold text-[#0564f5] whitespace-nowrap"
              >
                로그인/회원가입
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 모드 전환 실패 안내 — 나타나는 순간 스크린 리더가 읽도록 role="alert" */}
      {modeError && (
        <div
          role="alert"
          className="border-danger text-danger mx-auto max-w-screen-xl border-t px-10 py-2 text-sm"
        >
          {modeError}
        </div>
      )}
    </header>
  );
};

export default Header;
