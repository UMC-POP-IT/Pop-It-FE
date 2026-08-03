import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Logo from "@/shared/components/Logo";
import { useAuthStore } from "@/store/authStore";

const Header = () => {
  const { user, mode, setMode, openLoginModal, hostStatus, refreshHostStatus } =
    useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const hideModeToggle = mode === "GUEST" && pathname === "/reservations";
  const [modeError, setModeError] = useState(""); // 모드 전환 실패 사유

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
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white drop-shadow-[0px_4px_5px_rgba(0,0,0,0.12)]">
      <div className="mx-auto flex h-[74px] max-w-screen-xl items-center gap-8 px-10">
        <NavLink
          to={mode === "HOST" ? "/host/spaces" : "/"}
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
                  `pb-0.5 text-base font-bold transition-colors ${
                    isActive
                      ? "text-primary border-primary border-b-2"
                      : "text-text-primary"
                  }`
                }
              >
                내 공간
              </NavLink>
              <NavLink
                to="/host/reservations"
                className={({ isActive }) =>
                  `pb-0.5 text-base font-bold transition-colors ${
                    isActive
                      ? "text-primary border-primary border-b-2"
                      : "text-text-primary"
                  }`
                }
              >
                예약 관리
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `pb-0.5 text-base font-bold transition-colors ${
                    isActive
                      ? "text-primary border-primary border-b-2"
                      : "text-text-primary"
                  }`
                }
              >
                공간탐색
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
                className={`pb-0.5 text-base font-bold transition-colors ${
                  pathname === "/reservations"
                    ? "text-primary border-primary border-b-2"
                    : "text-text-primary"
                }`}
              >
                나의 예약
              </button>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          {/* 모드 전환 버튼 — 게스트 모드 나의 예약 탭에서는 숨김 */}
          {!hideModeToggle && (
            <button
              onClick={handleModeToggle}
              className="bg-primary-light text-text-primary flex items-center gap-1 rounded p-1 pl-1 text-base transition-colors"
            >
              <span className="px-1">
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
            <button className="text-text-primary flex items-center gap-3 text-base">
              <div className="bg-primary-light flex h-9 w-9 items-center justify-center rounded-full p-2">
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
              {user.nickname} 님
            </button>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="text-primary text-sm font-medium"
            >
              로그인
            </button>
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
