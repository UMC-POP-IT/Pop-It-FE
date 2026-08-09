import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import Logo from "@/shared/components/Logo";
import { useAuthStore } from "@/store/authStore";
import { logoutApi, switchMode } from "@/shared/utils/oauth";
import { useHostModeSwitch } from "@/shared/hooks/useHostModeSwitch";
import { useScrollSearchBarStore } from "@/store/scrollSearchBarStore";
import {
  SEARCH_BAR_VIEW_TRANSITION_NAME,
  type MorphTransitionStyle,
} from "@/shared/utils/viewTransition";

/**
 * sticky 헤더의 실제 높이(아래 h-[74px]과 반드시 같아야 한다). Banner.tsx의
 * 고정 오버레이 top 위치, ExplorePage.tsx의 스크롤 감지 rootMargin/오버레이
 * top이 전부 이 값을 그대로 가져다 쓴다 - 값이 파일마다 따로 하드코딩돼
 * 있으면 여기(Header.tsx)의 실제 높이가 바뀔 때 조용히 어긋날 수 있어서, 한
 * 곳에서만 정의하고 export한다(Banner.tsx의 RESULTS_MODE_TOP_OFFSET_PX와
 * 같은 이유).
 */
export const HEADER_HEIGHT_PX = 74;

const Header = () => {
  const { user, mode, setMode, openLoginModal, logout } = useAuthStore();
  const switchToHost = useHostModeSwitch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // 검색 결과 화면(ExplorePage)에서 스크롤을 내려 원래 검색바가 헤더 뒤로
  // 넘어갔을 때 그 자리에 대신 뜨는 축소된 pill. summary가 있으면(=그 화면에
  // 있었던 적이 있으면) wrapper는 계속 마운트해두고 opacity만 토글해서 보이거나
  // 숨긴다(마운트/언마운트로 하면 아래 view-transition-name 매칭이 끊긴다).
  // 실제로 "부드럽게 나타나고 사라지는" 느낌은 이제 CSS transition이 아니라
  // View Transitions API가 만든다 - 아래 pillMorphStyle 참고.
  const isScrollBarVisible = useScrollSearchBarStore((s) => s.isVisible);
  const scrollBarSummary = useScrollSearchBarStore((s) => s.summary);
  const expandScrollBar = useScrollSearchBarStore((s) => s.onExpand);
  const setFocusTrigger = useScrollSearchBarStore((s) => s.setFocusTrigger);
  const pillButtonRef = useRef<HTMLButtonElement>(null);

  // ExplorePage가 오버레이를 닫을 때(Escape 등) 포커스를 이 버튼으로 되돌릴 수
  // 있도록 등록해둔다 - 스토어를 통해서만 접근 가능하다(ExplorePage는 이 버튼의
  // DOM을 직접 알 수 없다).
  useEffect(() => {
    setFocusTrigger(() => pillButtonRef.current?.focus());
    return () => setFocusTrigger(null);
  }, [setFocusTrigger]);
  // 이 pill이 지금 화면에 실제로 보일 때만 큰 검색바와 같은 view-transition-name을
  // 부여한다 - 그래야 스크롤로 접히거나 pill을 눌러 펼칠 때 브라우저가 둘을 같은
  // 대상으로 보고 모핑 애니메이션을 만들어준다(둘 다 동시에 이 이름을 가지면 안 됨).
  const pillMorphStyle: MorphTransitionStyle | undefined = isScrollBarVisible
    ? { viewTransitionName: SEARCH_BAR_VIEW_TRANSITION_NAME }
    : undefined;
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
    logoutApi().catch((err) =>
      console.error("[Header] 로그아웃 서버 요청 실패:", err),
    );
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

    // 게스트 → 호스트: 조회·모드 변경·이동·서버 동기화는 훅이 처리한다.
    // 조회에 실패하면(unknown) 훅이 이동하지 않고 돌려주므로 여기서 안내만 띄운다.
    if ((await switchToHost()) === "unknown") {
      setModeError(
        "호스트 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요",
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white drop-shadow-[0px_4px_5px_rgba(0,0,0,0.12)]">
      {/* 피그마: 전체 px-[40px], 좌측 gap-[32px](로고↔nav), 우측 gap-[20px] */}
      <div className="relative flex h-[74px] w-full items-center px-[10px] md:px-[40px]">
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
                  <span className="flex h-full w-[72px] items-center justify-center">
                    내 공간
                  </span>
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
                  <span className="flex h-full w-[72px] items-center justify-center">
                    예약 관리
                  </span>
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
                  <span className="flex h-full w-[72px] items-center justify-center">
                    공간탐색
                  </span>
                </NavLink>
                <button
                  onClick={() => {
                    if (!user) {
                      openLoginModal({
                        type: "navigate",
                        path: "/reservations",
                      });
                      return;
                    }
                    navigate("/reservations");
                  }}
                  aria-current={
                    pathname === "/reservations" ? "page" : undefined
                  }
                  className={`flex h-full w-[112px] items-center justify-center px-[10px] text-base font-bold transition-colors ${
                    pathname === "/reservations"
                      ? "text-primary [&>span]:border-b-2 [&>span]:border-[#0564f5]"
                      : "text-text-primary"
                  }`}
                >
                  <span className="flex h-full w-[72px] items-center justify-center">
                    나의 예약
                  </span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* 검색 결과 화면 전용: 스크롤을 내리면 헤더 정중앙에 축소된 검색바 pill이
            나타난다. 클릭하면 헤더 바로 아래에 원래 검색바가 오버레이로 펼쳐진다
            (Banner의 searchBarPosition="pinned-open"). 좁은 화면에서는 넣을
            공간이 부족해 숨긴다.
            좌/우 그룹(로고+nav, 모드전환+프로필)의 너비가 서로 달라서 그 사이의
            남는 공간만 flex-1로 채우면 헤더 전체 기준으로는 중앙에서 벗어난다.
            그래서 이 wrapper는 일반 flex 흐름에서 빼고 부모(relative)를 기준으로
            absolute + inset-x-0 + justify-center로 항상 헤더 정중앙에 오게 한다.
            wrapper는 pointer-events-none으로 두고, 실제 버튼만 pointer-events-auto로
            켜서 숨겨진 상태에서도 다른 영역(nav, 프로필 등) 클릭을 막지 않는다. */}
        {scrollBarSummary && (
          <div
            className={`absolute inset-x-0 top-1/2 hidden -translate-y-1/2 justify-center md:flex ${
              isScrollBarVisible ? "" : "pointer-events-none opacity-0"
            }`}
          >
            <button
              ref={pillButtonRef}
              type="button"
              onClick={() => expandScrollBar?.()}
              aria-label="검색 조건 펼치기"
              disabled={!isScrollBarVisible}
              style={pillMorphStyle}
              className={`border-divider pointer-events-auto flex items-center gap-3 rounded-full border bg-white py-2 pr-2 pl-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] ${
                isScrollBarVisible ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span className="text-text-primary text-sm font-bold whitespace-nowrap">
                {scrollBarSummary.categoryLabel}
              </span>
              <span aria-hidden="true" className="bg-divider h-4 w-px shrink-0" />
              <span className="text-text-primary text-sm font-bold whitespace-nowrap">
                {scrollBarSummary.dateLabel}
              </span>
              <span aria-hidden="true" className="bg-divider h-4 w-px shrink-0" />
              <span className="text-text-primary text-sm font-bold whitespace-nowrap">
                {scrollBarSummary.districtLabel}
              </span>
              <span aria-hidden="true" className="bg-divider h-4 w-px shrink-0" />
              <span className="text-text-secondary max-w-[120px] truncate text-sm">
                {scrollBarSummary.keywordLabel}
              </span>
              <span className="bg-primary-hover flex size-8 shrink-0 items-center justify-center rounded-full text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          </div>
        )}

        {/* 우측: 모드전환 + 프로필 (gap-[20px]) */}
        <div className="ml-auto flex items-center gap-5">
          {/* 모드 전환 버튼 — 게스트 모드 나의 예약 탭에서는 숨김 */}
          {!hideModeToggle && (
            <button
              onClick={handleModeToggle}
              className="bg-primary-light text-text-primary flex items-center rounded p-[4px] text-base transition-colors"
            >
              <span className="hidden px-[4px] md:inline">
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
            <div className="flex h-[74px] w-auto items-center justify-center md:w-[164px]">
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
