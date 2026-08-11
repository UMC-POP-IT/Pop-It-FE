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
  // 넘어갔을 때 그 자리에 대신 뜨는 축소된 pill.
  // - 오버레이를 열고 닫을 때(pill 클릭 ↔ Escape/바깥클릭)는 summary는 그대로
  //   둔 채 isVisible만 토글하므로(ExplorePage 참고) wrapper가 계속
  //   마운트된 채 opacity만 바뀐다.
  // - 스크롤을 다시 올려 pill 자체가 필요 없어지면 ExplorePage가
  //   resetScrollSearchBar()로 summary까지 null로 밀어버려 wrapper가 통째로
  //   언마운트된다 - 아래 opacity-0 분기는 이 경로에선 안 거친다.
  //   view-transition-name 매칭은 이 언마운트 여부와 무관하다: 그 시점엔
  //   이미 HeroSearchBar 쪽(isMorphTarget)이 새 스냅샷에서 이름을 넘겨받으므로
  //   (양쪽 스냅샷에 이름을 가진 엘리먼트가 정확히 하나씩만 있으면 되고, 같은
  //   DOM 노드가 유지될 필요는 없다), wrapper가 마운트돼 있든 아니든 모핑
  //   결과는 동일하다.
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
  // 모바일/태블릿(md~xl 미만): 헤더에 뜨는 축소 검색바 pill은 좌우 그룹
  // 너비와 무관하게 항상 헤더 정가운데에 오도록 absolute + justify-center로
  // 배치돼 있다(위 pillMorphStyle 주석 참고) - 화면이 아주 넓을 때(xl, 1280↑)는
  // 여유가 충분해 문제가 없지만, 그보다 좁으면(1024~1279 같은 좁은 데스크톱
  // 폭 포함) pill 콘텐츠 폭 + nav/우측 버튼 폭을 합치면 실제로 겹칠 수 있다
  // (1163px 등에서 재현됨 - lg만 기준으로 나눴던 첫 시도가 이 좁은 데스크톱
  // 폭을 놓쳤었다). pill이 실제로 보이는 동안(isScrollBarVisible)만 xl 미만
  // 전체 구간에서 우측 버튼 그룹을 통째로 숨기고, pill이 사라지면(스크롤을
  // 올려 큰 검색바로 돌아가거나 pill을 눌러 오버레이를 펼치면) 다시 원래
  // 자리(우측)에 그대로 나타나게 한다 - xl 이상은 그대로 항상 노출.
  const hidePillOverlappingActions = Boolean(scrollBarSummary) && isScrollBarVisible;
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
      <div className="relative flex h-[74px] w-full items-center px-4 md:px-10 xl:px-24">
        {/* 좌측: 로고 + nav (gap-[32px]) */}
        <div className="flex items-center gap-8">
          <NavLink
            to={mode === "HOST" ? "/host/spaces" : "/"}
            className="flex h-[74px] w-auto flex-shrink-0 items-center justify-center xl:w-[180px]"
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
            (Banner의 searchBarPosition="pinned-open"). 모바일에서는 우측
            호스트 전환 버튼 자리에 짧은 pill 형태로 보여준다.
            좌/우 그룹(로고+nav, 모드전환+프로필)의 너비가 서로 달라서 그 사이의
            남는 공간만 flex-1로 채우면 헤더 전체 기준으로는 중앙에서 벗어난다.
            그래서 아주 넓은 화면(xl, 1280↑)에서는 이 wrapper를 일반 flex
            흐름에서 빼고 부모(relative)를 기준으로 absolute + inset-x-0 +
            justify-center로 항상 헤더 정중앙에 오게 한다.
            그보다 좁으면(md~xl 미만 - 1024~1279 같은 좁은 데스크톱 폭도 포함)
            이 전체-폭 기준 중앙 정렬을 그대로 쓰면 pill이 왼쪽 nav(공간탐색/
            나의예약)와 겹쳐 보이는 문제가 있었다(1163px 등에서 재현 - 처음엔
            lg만 기준으로 나눴다가 이 좁은 데스크톱 폭을 놓쳤었다) - 그 구간
            에서는 대신 absolute를 relative로 바꿔서 일반 flex 흐름에 그대로
            끼워 넣는다(같은 행의 다른 두 형제 사이에서 flex-1로 남는 공간만
            차지) - 이러면 nav 폭과 무관하게 자동으로 nav 다음부터 시작해
            겹치지 않고, 오른쪽 그룹은 pill이 보이는 동안 통째로 숨기므로
            (hidePillOverlappingActions) 남는 공간을 그대로 다 쓸 수 있다.
            wrapper는 pointer-events-none으로 두고, 실제 버튼만 pointer-events-auto로
            켜서 숨겨진 상태에서도 다른 영역(nav, 프로필 등) 클릭을 막지 않는다. */}
        {scrollBarSummary && (
          <div
            className={`pointer-events-none absolute top-1/2 right-3 left-[92px] flex -translate-y-1/2 justify-end md:inset-x-0 md:justify-center md:max-xl:relative md:max-xl:inset-x-auto md:max-xl:top-auto md:max-xl:min-w-0 md:max-xl:flex-1 md:max-xl:translate-y-0 ${
              isScrollBarVisible ? "" : "opacity-0"
            }`}
          >
            <button
              ref={pillButtonRef}
              type="button"
              onClick={() => expandScrollBar?.()}
              aria-label="검색 조건 펼치기"
              disabled={!isScrollBarVisible}
              style={pillMorphStyle}
              className={`border-divider pointer-events-auto flex max-w-full items-center gap-1.5 rounded-full border bg-white px-2.5 py-2 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] md:gap-3 md:py-2 md:pr-2 md:pl-5 ${
                isScrollBarVisible ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span className="text-text-primary text-[10px] font-medium whitespace-nowrap md:text-sm md:font-bold">
                {scrollBarSummary.categoryLabel}
              </span>
              <span aria-hidden="true" className="bg-divider h-3 w-px shrink-0 md:h-4" />
              <span className="text-text-primary text-[10px] font-medium whitespace-nowrap md:text-sm md:font-bold">
                {scrollBarSummary.dateLabel}
              </span>
              <span aria-hidden="true" className="bg-divider h-3 w-px shrink-0 md:h-4" />
              <span className="text-text-primary text-[10px] font-medium whitespace-nowrap md:text-sm md:font-bold">
                {scrollBarSummary.districtLabel}
              </span>
              <span aria-hidden="true" className="bg-divider h-3 w-px shrink-0 md:h-4" />
              <span className="text-text-secondary min-w-0 max-w-[64px] shrink truncate text-[10px] whitespace-nowrap md:max-w-[120px] md:text-sm">
                {scrollBarSummary.keywordLabel}
              </span>
              <span className="bg-primary-hover hidden size-8 shrink-0 items-center justify-center rounded-full text-white md:flex">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          </div>
        )}

        {/* 우측: 모드전환 + 프로필 (gap-[20px]) */}
        <div
          className={`ml-auto flex items-center gap-5 md:max-lg:-mr-[32px] ${
            hidePillOverlappingActions ? "hidden md:max-xl:hidden xl:flex" : ""
          }`}
        >
          {/* 모드 전환 버튼 — 게스트 모드 나의 예약 탭에서는 숨김 */}
          {!hideModeToggle && (
            <>
              {/* 태블릿/데스크탑: 아이콘 포함 pill */}
              <button
                onClick={handleModeToggle}
                className="bg-primary-light text-text-primary hidden items-center rounded p-[4px] text-base transition-colors md:flex"
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
              {/* 모바일: 텍스트만 있는 작은 pill (Figma 모바일 헤더 — nav/로그인/프로필 없음) */}
              <button
                onClick={handleModeToggle}
                className="bg-primary-light text-text-primary flex items-center rounded px-[8px] py-[6px] text-xs font-medium transition-colors md:hidden"
              >
                {mode === "GUEST" ? "호스트 전환" : "게스트 전환"}
              </button>
            </>
          )}

          {/* 로그인 상태에 따라 분기 — 모바일에서는 Figma에 없어서 숨김 */}
          {user ? (
            <div
              className="relative hidden md:flex md:items-center"
              ref={profileMenuRef}
            >
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                aria-controls="profile-menu"
                className="text-text-primary flex h-[74px] w-auto items-center justify-center gap-3 py-[14px] text-base md:max-lg:w-[164px] xl:w-[164px]"
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
            <div className="hidden h-[74px] w-auto items-center justify-center md:flex md:w-[164px]">
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
