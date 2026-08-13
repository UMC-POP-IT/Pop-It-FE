import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpaceCard from "@/shared/components/SpaceCard";
import LoadingSparkles from "@/shared/components/LoadingSparkles";
import Spinner from "@/shared/components/Spinner";
import ExplorePagination from "./ExplorePagination";
import ExploreSpaceMap from "./ExploreSpaceMap";
import ExploreSpaceEmptyState from "./ExploreSpaceEmptyState";
import {
  getSpaces,
  toSpaceSummary,
  DEFAULT_PAGE_SIZE,
  type ExploreSearchFilters,
  type SpaceSummary,
} from "@/features/guest-explore/api/space_search_api";
import { useWishStore } from "@/store/wishStore";
import { useAuthStore } from "@/store/authStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useDelayedLoading } from "@/shared/hooks/useDelayedLoading";

type FetchStatus = "loading" | "success" | "error";

/**
 * 새로 받아온 목록(summaries)에 로컬 찜 상태로 인한 낙관적 heartCount 보정을
 * 다시 적용한다. 찜 API가 아직 연동되지 않아 서버는 항상 예전 wishCount를
 * 내려주는데, setSpaces(summaries)로 그대로 덮어쓰면 onWishToggle에서 반영한
 * ±1 낙관적 갱신이 필터/페이지 변경 재조회 때마다 사라진다(wishedIds 자체는
 * wishStore의 syncedSpaceIds/syncedButLocallyToggled 가드로 보존되지만,
 * heartCount는 이 컴포넌트가 직접 들고 있어 별도로 지켜줘야 한다).
 */
const reconcileHeartCounts = (
  summaries: SpaceSummary[],
  prevSpaces: SpaceSummary[],
  wishedIds: number[],
): SpaceSummary[] => {
  const prevById = new Map(prevSpaces.map((space) => [space.spaceId, space]));

  return summaries.map((summary) => {
    const isLocallyWished = wishedIds.includes(summary.spaceId);
    if (isLocallyWished === summary.isWishlisted) {
      // 로컬/서버가 일치하면 낙관적 보정이 필요 없다 - 서버 값을 그대로 신뢰한다.
      return summary;
    }

    const prev = prevById.get(summary.spaceId);
    if (prev) {
      // 직전까지 이 화면에 떠 있던 카드면, 이미 반영해둔 개수를 그대로 유지한다.
      return { ...summary, heartCount: prev.heartCount };
    }

    // 이 화면에서는 처음 보는 카드인데 로컬 상태가 서버와 다르면(다른 화면/
    // 이전 검색에서 토글한 경우) 서버 값에 ±1 보정만 적용한다.
    const correction = isLocallyWished ? 1 : -1;
    return {
      ...summary,
      heartCount: Math.max(summary.heartCount + correction, 0),
    };
  });
};

interface ExploreSpaceProps {
  /** HeroSearchBar(히어로 검색바)에서 확정한 검색 조건. */
  filters: ExploreSearchFilters;
  /** empty state의 [조건 초기화] CTA - 상위(ExplorePage)의 필터 상태를 초기화한다. */
  onResetFilters: () => void;
  /**
   * 검색을 실제로 실행한 뒤의 결과 전용 화면인지 여부.
   * true면 "공간 탐색" 제목을 숨기고, 페이지네이션 대신 무한스크롤로 동작한다.
   */
  resultsMode?: boolean;
  /**
   * 실제로 보여줄 공간이 있는지(status === "success" && spaces.length > 0)가
   * 바뀔 때마다 호출된다. ExplorePage가 이걸로 "검색 결과가 실제로 있을 때만"
   * 스크롤-축소(헤더 pill 모핑) 기능을 켠다 - 빈 결과 화면은 카드가 없어서
   * 스크롤할 내용 자체가 없으니 굳이 필요 없다.
   */
  onHasResultsChange?: (hasResults: boolean) => void;
}

const ExploreSpace = ({
  filters,
  onResetFilters,
  resultsMode = false,
  onHasResultsChange,
}: ExploreSpaceProps) => {
  const navigate = useNavigate();
  const [isMapView, setIsMapView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // 페이지네이션 모드에서만 사용(화면 표기는 1부터)

  // 무한스크롤 모드 전용: 다음에 불러올 페이지(0부터)와, 더 불러올 페이지가
  // 있는지/지금 다음 페이지를 불러오는 중인지.
  const [infinitePage, setInfinitePage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // 무한스크롤 중(2페이지 이후) 추가 로드가 실패했을 때만 쓴다. 최초 로드
  // 실패(status="error")와 달리, 이미 화면에 떠 있는 카드들은 그대로 두고
  // 그리드 하단에 작은 재시도 UI만 보여준다 - 전체를 에러 화면으로 바꾸면
  // 이미 스크롤해서 본 카드들이 통째로 사라진다.
  const [hasLoadMoreError, setHasLoadMoreError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<FetchStatus>("loading");
  const [spaces, setSpaces] = useState<SpaceSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  // 최초 조회 성공 이후에는 페이지/필터가 바뀌어도 전체 로딩 화면으로 목록을
  // 가리지 않고, 기존 목록을 유지한 채 배경에서 갱신한다(깜빡임 방지).
  const [isRefetching, setIsRefetching] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  const wishedIds = useWishStore((state) => state.wishedIds);
  const syncWished = useWishStore((state) => state.syncWished);
  const user = useAuthStore((state) => state.user);
  const { handleWishToggle } = useWishGuard();

  const { keyword, spaceCategory, district } = filters;

  // 상위(HeroSearchBar)에서 새 검색 조건이 확정되거나(검색 실행 등) 결과 화면
  // 모드가 바뀌면 처음부터 다시 불러와야 한다. 이걸 별도 useEffect로 하면(예전
  // 코드) 그 리셋 effect와 아래 조회 effect가 같은 커밋에서 함께 실행될 때,
  // 조회 effect가 리셋이 반영되기 전의 오래된 currentPage/infinitePage 값을
  // 그대로 읽어서 잘못된 페이지로 먼저 한 번 요청을 보내버리는 문제가 있었다
  // (setState는 다음 렌더에 반영되지 같은 effect flush 안에서 즉시 반영되지
  // 않기 때문). 그래서 effect 대신 렌더 도중에 바로 리셋해서(React가 안내하는
  // "prop이 바뀌면 렌더 중에 state를 조정하는" 패턴) 아래 조회 effect가 항상
  // 리셋이 끝난 값으로만 실행되게 한다.
  const filterKey = `${keyword}|${spaceCategory}|${district}|${resultsMode}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
    setInfinitePage(0);
    setSpaces([]);
    // 이전 검색에서 무한스크롤 추가 로드가 실패한 채로 남아있으면(true), 새
    // 검색은 infinitePage가 0부터 다시 시작하므로 isLoadMore가 false가 되어
    // "다시 시도" 버튼을 눌러도 이 값을 false로 되돌릴 기회가 영영 없다 -
    // 그 결과 새로 불러온 성공한 결과에도 에러 UI가 계속 뜨고, IntersectionObserver의
    // !hasLoadMoreError 가드에 걸려 무한스크롤 자체가 막혀버린다. 여기서 같이 리셋한다.
    setHasLoadMoreError(false);
  }

  // hasLoadedOnceRef 갱신은 렌더 중이 아니라 여기서만 한다 - ref를 렌더 도중에
  // mutate하는 건 impure해서(StrictMode 이중 렌더/버려지는 렌더에서 부작용이
  // 생길 수 있음) 지양해야 한다는 지적을 반영했다. 아래 조회 effect보다 먼저
  // 선언돼 있어야 같은 커밋에서 먼저 실행되어, 조회 effect가 항상 리셋된 값을
  // 보게 된다(effect는 선언 순서대로 실행된다).
  useEffect(() => {
    hasLoadedOnceRef.current = false;
  }, [prevFilterKey]);

  useEffect(() => {
    let ignore = false;
    const pageToFetch = resultsMode ? infinitePage : currentPage - 1;
    const isLoadMore = resultsMode && infinitePage > 0;

    const load = async () => {
      // 최초 조회일 때만 전체 로딩 화면을 띄운다. 그 다음부터는 무한스크롤로
      // 다음 페이지를 이어붙이는 중(하단 로딩 표시)이거나, 배경에서 다시
      // 조회하는 중(기존 목록 유지)으로 나눠서 처리한다.
      if (!hasLoadedOnceRef.current) {
        setStatus("loading");
      } else if (isLoadMore) {
        setIsLoadingMore(true);
        setHasLoadMoreError(false); // 재시도 시작 - 이전 실패 표시를 지운다
      } else {
        setIsRefetching(true);
      }

      try {
        const result = await getSpaces({
          keyword: keyword || undefined,
          spaceCategory: spaceCategory || undefined,
          district: district || undefined,
          page: pageToFetch,
          size: DEFAULT_PAGE_SIZE,
        });
        if (ignore) return;

        const summaries = result.spaces.map(toSpaceSummary);
        // 최초 진입/재조회 시에만 서버의 찜 여부로 로컬 상태를 맞춘다.
        summaries.forEach((space) =>
          syncWished(space.spaceId, space.isWishlisted),
        );

        // syncWished 직후의 최신 wishedIds를 기준으로, 로컬 찜 상태가 서버와
        // 다른 카드는 heartCount를 그대로 덮어쓰지 않고 보정해서 병합한다.
        const freshWishedIds = useWishStore.getState().wishedIds;
        setSpaces((prev) => {
          const base = isLoadMore ? prev : [];
          return [
            ...base,
            ...reconcileHeartCounts(summaries, prev, freshWishedIds),
          ];
        });
        setTotalCount(result.totalCount);
        setHasNextPage(result.hasNext);
        setStatus("success");
        hasLoadedOnceRef.current = true;
      } catch (error) {
        if (ignore) return;

        // 상태 코드와 무관하게 항상 콘솔에 남긴다 - 화면에는 재시도 버튼이 뜨지만
        // 500/네트워크 오류처럼 사용자가 재현하기 어려운 문제는 로그가 없으면
        // 원인 파악이 안 된다.
        console.error("공간 탐색 요청 실패:", error);
        // 무한스크롤 추가 로드 실패는 status를 "error"로 바꾸지 않는다 -
        // 그러면 이미 불러온 카드 그리드 전체가 "공간 목록을 불러오지
        // 못했어요" 화면으로 대체돼버린다. status는 "success"로 유지하고
        // hasLoadMoreError만 세워서 그리드 하단에 작은 재시도 UI만 보여준다.
        if (isLoadMore) {
          setHasLoadMoreError(true);
        } else {
          setStatus("error");
        }
      } finally {
        if (!ignore) {
          setIsRefetching(false);
          setIsLoadingMore(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    keyword,
    spaceCategory,
    district,
    currentPage,
    infinitePage,
    resultsMode,
    retryKey,
  ]);

  // 무한스크롤 모드: 그리드 맨 아래 sentinel이 화면에 보이면 다음 페이지를 이어붙인다.
  useEffect(() => {
    if (!resultsMode) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isLoadingMore &&
          !isRefetching &&
          !hasLoadMoreError && // 실패한 페이지는 자동으로 건너뛰지 않는다 - "다시 시도" 버튼으로만 재시도한다
          status === "success"
        ) {
          setInfinitePage((p) => p + 1);
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    resultsMode,
    hasNextPage,
    isLoadingMore,
    isRefetching,
    hasLoadMoreError,
    status,
  ]);

  const hasResults = status === "success" && spaces.length > 0;

  // 실제로 짧게 끝나는 요청(대부분의 경우)에는 최초 로딩 화면조차 노출하지
  // 않는다 - 일반적인 화면 전환에서 로딩 UI가 잠깐 반짝이는 현상을 없앤다
  // (#275). 무한스크롤 추가 로딩(isLoadingMore)과 배경 재조회(isRefetching)는
  // 이미 기존 목록을 가리지 않는 별도 UI라 여기 대상이 아니다.
  const showInitialLoading = useDelayedLoading(status === "loading");

  useEffect(() => {
    onHasResultsChange?.(hasResults);
    // onHasResultsChange는 상위에서 매 렌더 새로 만들어질 수 있어 deps에 넣지
    // 않는다(onSummaryChange와 같은 이유 - HeroSearchBar.tsx 참고).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasResults]);

  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));

  const onWishToggle = (space: SpaceSummary) => {
    const wasWished = wishedIds.includes(space.spaceId);
    handleWishToggle(space.spaceId);

    // 비로그인 상태면 handleWishToggle이 로그인 모달만 띄우고 실제로는 토글되지
    // 않으므로, 로그인 상태일 때만 카드에 보이는 찜 수를 낙관적으로 갱신한다.
    if (user) {
      setSpaces((prev) =>
        prev.map((s) =>
          s.spaceId === space.spaceId
            ? {
                ...s,
                heartCount: Math.max(s.heartCount + (wasWished ? -1 : 1), 0),
              }
            : s,
        ),
      );
    }
  };

  return (
    // <main>(MainLayout.tsx)의 padding(px-4 md:px-6, max-w-[1200px])과
    // Banner/HeroSearchBar가 쓰는 padding(px-4 md:px-10 lg:px-[76px],
    // max-w-screen-xl)이 서로 달라서, 이 섹션을 그냥 <main> 안에 두면 검색
    // 결과가 없을 때 뜨는 회색 박스나 지도 버튼의 오른쪽 끝이 검색창보다 살짝
    // 더 바깥으로 삐져나와 어긋나 보인다(디자인 QA 지적). Banner와 똑같은
    // full-bleed 트릭(-mx-[50vw] w-screen)으로 <main>의 padding을 무시하고
    // Banner가 쓰는 것과 정확히 같은 공식(max-w-screen-xl, px-4 md:px-10
    // lg:px-[76px], 그 안에 다시 max-w-[1200px])을 그대로 재현해서 뷰포트
    // 폭과 무관하게 검색창과 항상 픽셀 단위로 같은 폭/오른쪽 끝을 갖도록 맞춘다.
    <div className="relative right-1/2 left-1/2 -mx-[50vw] w-screen">
      <div className="mx-auto w-full max-w-screen-xl px-4 md:px-10 lg:px-[76px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <section className="mt-6 w-full md:mt-14">
            <div
              className={`mb-4 flex items-center md:mb-6 ${resultsMode ? "justify-end" : "justify-between"}`}
            >
              {!resultsMode && (
                <h2 className="text-text-primary text-2xl font-bold">
                  공간 탐색
                </h2>
              )}

              <button
                type="button"
                aria-pressed={isMapView}
                onClick={() => setIsMapView((prev) => !prev)}
                className={`flex cursor-pointer items-center justify-center gap-[6px] rounded-full px-4 py-[10px] text-lg transition-colors ${
                  isMapView
                    ? "bg-primary text-white"
                    : "bg-primary-light text-text-primary hover:bg-primary-light/80"
                }`}
              >
                {isMapView ? (
                  <>
                    <span>지도</span>
                    {/* 지도가 열려있을 때는 같은 버튼이 닫기(X) 역할도 겸한다 - 피그마
                  node 5019:73566의 btn_close 스타일(흰 원 배경 + 파란 X)과 동일. */}
                    <span className="flex shrink-0 items-center justify-center rounded-full bg-white p-[2px]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5"
                          stroke="#3783F7"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </>
                ) : (
                  // 켜짐 상태(지도 텍스트 → 닫기 아이콘)와 순서를 통일한다 - 텍스트가
                  // 항상 아이콘보다 먼저 오도록(#275 디자인 QA).
                  <>
                    <span>지도</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 28 28"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M11.5334 5.26611C11.6648 5.23524 11.8043 5.25006 11.9276 5.31169L17.5 8.09733L23.0724 5.31169C23.2531 5.22134 23.4679 5.23069 23.6398 5.33675C23.8118 5.44304 23.9167 5.63133 23.9167 5.8335V20.4168C23.9167 20.6378 23.7919 20.8398 23.5942 20.9386L17.7609 23.8553C17.5967 23.9374 17.4033 23.9374 17.2391 23.8553L11.6667 21.0685L6.09424 23.8553C5.91355 23.9457 5.69877 23.9363 5.52686 23.8302C5.35488 23.724 5.25 23.5357 5.25 23.3335V8.75016C5.25 8.52921 5.3748 8.32717 5.57243 8.22835L11.4058 5.31169L11.5334 5.26611ZM6.41667 9.11019V22.389L11.0833 20.0557V6.77686L6.41667 9.11019ZM12.25 20.0557L16.9167 22.389V9.11019L12.25 6.77686V20.0557ZM18.0833 9.11019V22.389L22.75 20.0557V6.77686L18.0833 9.11019Z"
                        fill="currentColor"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* 검색(최초 로딩) 중에는 회색 박스나 안내 문구 없이 400ms 넘게 걸릴 때만
          작은 스피너만 보여준다 - 무한스크롤 "더 불러오는 중" 상태(LoadingSparkles,
          아래 isLoadingMore)와는 별개로, 최초 로딩에서는 회색 박스·문구 노출 자체를
          없애 달라는 요청에 따른 처리(#275). */}
            {status === "loading" && showInitialLoading && (
              <div className="mt-6 flex h-[400px] w-full items-center justify-center">
                <Spinner aria-label="공간 목록을 불러오는 중" />
              </div>
            )}

            {status === "error" && (
              <div className="mt-6 flex flex-col items-center gap-4 py-20">
                <p className="text-text-secondary text-sm">
                  공간 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
                </p>
                <button
                  type="button"
                  onClick={() => setRetryKey((k) => k + 1)}
                  className="text-primary cursor-pointer text-sm font-medium"
                >
                  다시 시도
                </button>
              </div>
            )}

            {status === "success" && isMapView && spaces.length === 0 && (
              <ExploreSpaceEmptyState onResetFilters={onResetFilters} />
            )}

            {status === "success" && isMapView && spaces.length > 0 && (
              <ExploreSpaceMap
                spaces={spaces}
                onSelectSpace={(spaceId) => navigate(`/spaces/${spaceId}`)}
                onWishToggle={onWishToggle}
              />
            )}

            {status === "success" && !isMapView && spaces.length === 0 && (
              <ExploreSpaceEmptyState onResetFilters={onResetFilters} />
            )}

            {status === "success" && !isMapView && spaces.length > 0 && (
              <>
                <div
                  className={`mt-4 grid grid-cols-1 gap-x-6 gap-y-8 transition-opacity md:mt-6 md:grid-cols-2 md:gap-y-10 lg:grid-cols-4 ${
                    isRefetching ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  {spaces.map((space) => (
                    <SpaceCard
                      key={space.spaceId}
                      space={space}
                      categoryTag={space.category}
                      onClick={() => navigate(`/spaces/${space.spaceId}`)}
                      isWished={wishedIds.includes(space.spaceId)}
                      onWishToggle={() => onWishToggle(space)}
                      hoverEffect="dim"
                    />
                  ))}
                </div>

                {resultsMode ? (
                  <>
                    {/* IntersectionObserver가 관찰하는 빈 sentinel - 화면에 보이면 다음 페이지를 이어붙인다 */}
                    <div
                      ref={sentinelRef}
                      aria-hidden="true"
                      className="h-px w-full"
                    />
                    {/* 피그마 스펙(node 5299:32782) - 별 5개가 웨이브로 밝아지는 애니메이션 +
                  "새로운 공간을 불러오고 있습니다." 문구(LoadingSparkles 참고). */}
                    {isLoadingMore && (
                      <div className="py-8">
                        <LoadingSparkles />
                      </div>
                    )}
                    {hasLoadMoreError && (
                      <div className="flex flex-col items-center gap-2 py-8">
                        <p className="text-text-secondary text-sm">
                          추가 공간을 불러오지 못했어요.
                        </p>
                        <button
                          type="button"
                          onClick={() => setRetryKey((k) => k + 1)}
                          className="text-primary cursor-pointer text-sm font-medium"
                        >
                          다시 시도
                        </button>
                      </div>
                    )}
                    {!hasNextPage && !hasLoadMoreError && (
                      <p className="text-text-secondary py-8 text-center text-sm">
                        모든 공간을 다 보여드렸어요
                      </p>
                    )}
                  </>
                ) : (
                  <ExplorePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ExploreSpace;
