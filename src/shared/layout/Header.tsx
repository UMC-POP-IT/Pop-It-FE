import { NavLink, useNavigate, useLocation, useMatch } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import Logo from "@/shared/components/Logo";
import iconProfileMobile from "@/assets/icons/icon_profile_mobile.svg";
import { useAuthStore } from "@/store/authStore";
import { logoutApi, switchMode } from "@/shared/utils/oauth";
import { useHostModeSwitch } from "@/shared/hooks/useHostModeSwitch";
import {
  useScrollSearchBarStore,
  type SearchBarSegment,
} from "@/store/scrollSearchBarStore";
import {
  isSearchBarTransitionPending,
  SEARCH_BAR_VIEW_TRANSITION_NAME,
  type MorphTransitionStyle,
} from "@/shared/utils/viewTransition";
import {
  HOST_REGISTER_PATH,
  isHostRegisterPath,
} from "@/shared/constants/routes";

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
  // pill이 세그먼트별 버튼 4개로 나뉘어 있어서(#275 - 세그먼트를 클릭하면 그
  // 세그먼트의 드롭다운까지 함께 열려야 한다), Escape로 오버레이를 닫았을 때
  // 포커스를 되돌릴 단일 버튼이 없다. 마지막으로 클릭된 세그먼트 버튼을
  // 기억해뒀다가 그쪽으로 되돌리고, 키보드로 열었거나(클릭 기록이 없음)
  // 기록된 버튼이 이미 사라졌다면 첫 세그먼트(공간유형)로 대신 되돌린다.
  const categorySegmentRef = useRef<HTMLButtonElement>(null);
  const lastActiveSegmentRef = useRef<HTMLButtonElement | null>(null);
  const pendingFocusRestoreRef = useRef(false);

  // ExplorePage가 오버레이를 닫을 때(Escape 등) 포커스를 되돌릴 수 있도록
  // 등록해둔다 - 스토어를 통해서만 접근 가능하다(ExplorePage는 이 버튼들의
  // DOM을 직접 알 수 없다).
  useEffect(() => {
    setFocusTrigger(() => {
      pendingFocusRestoreRef.current = true;
    });
    return () => setFocusTrigger(null);
  }, [setFocusTrigger]);

  useEffect(() => {
    if (
      !isScrollBarVisible ||
      !scrollBarSummary ||
      !pendingFocusRestoreRef.current
    ) {
      return;
    }
    const frameId = requestAnimationFrame(() => {
      if (!pendingFocusRestoreRef.current) return;
      const target = lastActiveSegmentRef.current?.isConnected
        ? lastActiveSegmentRef.current
        : categorySegmentRef.current;
      target?.focus();
      pendingFocusRestoreRef.current = false;
    });
    return () => cancelAnimationFrame(frameId);
  }, [isScrollBarVisible, scrollBarSummary]);
  // 이 pill이 지금 화면에 실제로 보일 때만 큰 검색바와 같은 view-transition-name을
  // 부여한다 - 그래야 스크롤로 접히거나 pill을 눌러 펼칠 때 브라우저가 둘을 같은
  // 대상으로 보고 모핑 애니메이션을 만들어준다(둘 다 동시에 이 이름을 가지면 안 됨).
  const pillMorphStyle: MorphTransitionStyle | undefined = isScrollBarVisible
    ? { viewTransitionName: SEARCH_BAR_VIEW_TRANSITION_NAME }
    : undefined;
  // 축소 검색바 pill이 실제로 보이는 동안에만 우측 액션(모드 전환/프로필)을 숨긴다.
  // pill을 눌러 원래 검색바를 펼친 상태에서는 pill이 사라지므로 액션도 다시 접근 가능해야 한다.
  const hideHeaderActions = Boolean(scrollBarSummary) && isScrollBarVisible;
  const shouldHideModeToggle = mode === "GUEST" && pathname !== "/";
  // 호스트 등록 흐름에서는 nav 아이템을 감춘다 (#302).
  // RouteModeSync가 /host* 경로를 전부 HOST 모드로 맞추므로 이 화면에서도
  // [내 공간]·[예약 관리]가 뜨는데, 아직 호스트가 아닌 사용자에게는 둘 다 403이다.
  // 다만 결과가 다르다 — [내 공간]은 MySpacePage가 /host/host-register로 되돌려
  // (MySpacePage.tsx의 403 분기) 등록 흐름의 처음으로 밀려나고, [예약 관리]는
  // HostReservationPage가 loadError를 세워 빈 오류 화면에 남긴다. 입력값 자체는
  // registerStore(모듈 스코프)에 남지만 몇 단계까지 왔는지는 잃는다.
  //
  // /host/host-register/complete만은 이미 등록이 끝나 403이 안 나므로 이 근거가
  // 적용되지 않는다. 그래도 감추는 쪽으로 뒀다 — 출구를 [호스트 홈으로] 하나로
  // 모으는 마무리 화면이라 nav가 다시 나타나면 CTA와 목적지가 겹친다.
  //
  // 헤더의 나머지(높이 74·로고·모드 전환·프로필)는 그대로 두므로 이 흐름을 빠져나갈
  // 수단은 남는다. 단 [게스트 전환]은 아래 shouldHideModeToggle이 mode==="GUEST"일 때
  // 감추므로, RouteModeSync가 HOST로 맞추기 전 한 렌더 동안은 없을 수 있다.
  const isHostRegisterFlow = isHostRegisterPath(pathname);
  const spaceDetailMatch = useMatch("/spaces/:spaceId");
  const hostSpaceDetailMatch = useMatch("/host/spaces/:spaceId");
  const isSpaceDetail = Boolean(spaceDetailMatch || hostSpaceDetailMatch);
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
      const navigateTo = mode === "GUEST" ? HOST_REGISTER_PATH : "/";
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
      {/* 공간상세 모바일/태블릿 전용 뒤로가기 헤더 */}
      {isSpaceDetail && (
        <div className="flex h-[74px] w-full items-center px-4 lg:hidden">
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}
            className="flex h-10 w-10 items-center justify-center"
            aria-label="뒤로가기"
          >
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none" aria-hidden="true">
              <path d="M9 1L1 8.5L9 16" stroke="#121212" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
      <div className={`relative mx-auto flex h-[74px] w-full max-w-[1200px] items-center px-4 md:px-6 ${isSpaceDetail ? "hidden lg:flex" : ""}`}>
        {/* 좌측: 로고 + nav (gap-[32px]) */}
        <div className="flex items-center gap-8">
          <NavLink
            to={mode === "HOST" ? "/host/spaces" : "/"}
            className="flex h-[74px] w-auto flex-shrink-0 items-center justify-center lg:w-[180px]"
          >
            <Logo variant="header" />
          </NavLink>

          {/* nav: 아이템 간 gap 없음, 각 아이템 w-[112px] px-[10px] — 작은 화면에서 숨김.
              호스트 등록 흐름에서는 통째로 렌더하지 않는다(위 isHostRegisterFlow 주석).
              빈 <nav>을 남기지 않는 이유: 접근성 트리에 항목 없는 내비게이션 랜드마크가
              남고, 부모의 gap-8이 로고 뒤에 32px 빈칸을 계속 만든다 */}
          {!isHostRegisterFlow && (
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
          )}
        </div>

        {/* 검색 결과 화면 전용: 스크롤을 내리면 우측 액션 자리의 축소 검색바 pill이
            나타난다. 클릭하면 헤더 바로 아래에 원래 검색바가 오버레이로 펼쳐진다. */}
        {scrollBarSummary && isScrollBarVisible && (
          <div
            className={`pointer-events-none ml-auto flex min-w-0 justify-end ${
              isScrollBarVisible ? "" : "opacity-0"
            }`}
          >
            {/* view-transition-name은 모핑 대상 전체(pill 하나)에 딱 하나만
                붙어야 하므로 이 바깥 래퍼에 둔다 - 안의 세그먼트 버튼 각각에
                붙이면 안 된다. 세그먼트별로 나뉘어 있는 이유(#275): pill의
                "서울 전체" 같은 개별 세그먼트를 클릭하면 검색창이 펼쳐짐과
                동시에 그 세그먼트의 드롭다운/캘린더까지 함께 열려야 한다. */}
            <div
              role="group"
              aria-label="현재 검색 조건"
              style={pillMorphStyle}
              className={`border-divider pointer-events-auto flex max-w-[calc(100vw-104px)] items-center gap-1 rounded-full border bg-white px-2.5 py-2 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] md:max-w-[420px] md:gap-3 md:px-5 lg:max-w-[520px]`}
            >
              {(
                [
                  {
                    segment: "category",
                    label: scrollBarSummary.categoryLabel,
                    ariaLabel: "공간 유형 검색창 펼치기",
                    secondary: false,
                  },
                  {
                    segment: "date",
                    label: scrollBarSummary.dateLabel,
                    ariaLabel: "날짜 검색창 펼치기",
                    secondary: false,
                  },
                  {
                    segment: "district",
                    label: scrollBarSummary.districtLabel,
                    ariaLabel: "지역 검색창 펼치기",
                    secondary: false,
                  },
                  {
                    segment: "keyword",
                    label: scrollBarSummary.keywordLabel,
                    ariaLabel: "검색어 검색창 펼치기",
                    secondary: true,
                  },
                ] satisfies {
                  segment: SearchBarSegment;
                  label: string;
                  ariaLabel: string;
                  secondary: boolean;
                }[]
              ).map(({ segment, label, ariaLabel, secondary }, index) => (
                <div
                  key={segment}
                  className="flex min-w-0 items-center gap-1 md:gap-3"
                >
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="bg-divider h-3 w-px shrink-0 md:h-4"
                    />
                  )}
                  <button
                    ref={
                      segment === "category" ? categorySegmentRef : undefined
                    }
                    type="button"
                    onClick={(e) => {
                      if (isSearchBarTransitionPending()) return;
                      lastActiveSegmentRef.current = e.currentTarget;
                      expandScrollBar?.(segment);
                    }}
                    aria-label={ariaLabel}
                    disabled={!isScrollBarVisible}
                    className={`min-w-0 truncate text-[10px] font-medium whitespace-nowrap md:text-sm ${
                      secondary
                        ? "text-text-secondary max-w-[64px] shrink md:max-w-[120px]"
                        : "text-text-primary md:font-bold"
                    } ${isScrollBarVisible ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 우측: 모드전환 + 프로필 (gap-[20px]) */}
        <div
          className={`ml-auto flex items-center gap-4 md:gap-5 md:max-lg:-mr-[32px] ${
            hideHeaderActions ? "hidden" : ""
          }`}
        >
          {/* 모드 전환 버튼 — 게스트 모드 나의 예약 탭에서는 숨김 */}
          {!shouldHideModeToggle && (
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
              {/* 모바일: 텍스트만 있는 작은 pill (Figma 5664:56229 모바일 헤더) */}
              <button
                onClick={handleModeToggle}
                className="bg-primary-light text-text-primary flex items-center rounded px-[8px] py-[6px] text-xs font-medium transition-colors md:hidden"
              >
                {mode === "GUEST" ? "호스트 전환" : "게스트 전환"}
              </button>
            </>
          )}

          {/* 로그인 상태에 따라 분기 */}
          {user ? (
            <div
              className="relative flex items-center"
              ref={profileMenuRef}
            >
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
                aria-controls="profile-menu"
                aria-label={`${user.nickname} 프로필 메뉴`}
                className="text-text-primary flex h-[74px] w-auto items-center justify-center gap-3 py-[14px] text-base md:max-lg:w-[164px] lg:w-[164px]"
              >
                {/* 모바일: 프로필 아이콘만 (Figma 5664:56229) */}
                <img
                  src={iconProfileMobile}
                  alt=""
                  className="h-7 w-7 md:hidden"
                />
                {/* 태블릿/데스크탑: 아이콘 + 이름 */}
                <div className="bg-primary-light hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-full p-[8px] md:flex">
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
                className="flex h-auto w-full items-center justify-center rounded border border-[#3783f7] bg-white px-[8px] py-[6px] text-xs leading-[1.4] font-bold whitespace-nowrap text-[#0564f5] md:h-[40px] md:rounded-[8px] md:px-[24px] md:text-base"
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
