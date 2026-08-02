import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpaceCard from "@/shared/components/SpaceCard";
import ExploreSearchFilterBar from "./ExploreSearchFilterBar";
import ExplorePagination from "./ExplorePagination";
import ExploreSpaceMap from "./ExploreSpaceMap";
import {
  getSpaces,
  toSpaceSummary,
  DEFAULT_PAGE_SIZE,
  type SpaceCategory,
  type SpaceSummary,
} from "@/features/guest-explore/api/space_search_api";
import { useWishStore } from "@/store/wishStore";
import { useAuthStore } from "@/store/authStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";

type FetchStatus = "loading" | "success" | "error";

const KEYWORD_DEBOUNCE_MS = 400;

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

const ExploreSpace = () => {
  const navigate = useNavigate();
  const [isMapView, setIsMapView] = useState(false);

  // 검색창은 즉시 반영(입력값 표시), 실제 API 호출은 디바운스된 keyword로 나간다.
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<SpaceCategory | "">("");
  const [district, setDistrict] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // 화면 표기는 1부터, API 요청 시 -1

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

  // 검색어 디바운스: 타이핑이 멈춘 뒤 400ms 후에만 실제 조회 조건에 반영하고,
  // 동시에 1페이지로 리셋한다(같은 시점에 상태를 함께 바꿔 불필요한 재조회를 막는다).
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(keywordInput.trim());
      setCurrentPage(1);
    }, KEYWORD_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  const handleCategoryChange = (value: SpaceCategory | "") => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handleDistrictChange = (value: string) => {
    setDistrict(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      // 최초 조회일 때만 전체 로딩 화면을 띄운다. 이미 한 번 성공한 뒤라면
      // 기존 목록은 그대로 두고 배경에서만 다시 조회한다.
      if (hasLoadedOnceRef.current) {
        setIsRefetching(true);
      } else {
        setStatus("loading");
      }

      try {
        const result = await getSpaces({
          keyword: keyword || undefined,
          spaceCategory: category || undefined,
          district: district || undefined,
          page: currentPage - 1,
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
        setSpaces((prev) =>
          reconcileHeartCounts(summaries, prev, freshWishedIds),
        );
        setTotalCount(result.totalCount);
        setStatus("success");
        hasLoadedOnceRef.current = true;
      } catch (error) {
        if (ignore) return;

        // 상태 코드와 무관하게 항상 콘솔에 남긴다 - 화면에는 재시도 버튼이 뜨지만
        // 500/네트워크 오류처럼 사용자가 재현하기 어려운 문제는 로그가 없으면
        // 원인 파악이 안 된다.
        console.error("공간 탐색 요청 실패:", error);
        setStatus("error");
      } finally {
        if (!ignore) setIsRefetching(false);
      }
    };

    load();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, district, currentPage, retryKey]);

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
    <section className="mx-auto mt-14 w-[1240px]">
      <h2 className="text-text-primary mb-6 text-2xl font-bold">공간 탐색</h2>

      <ExploreSearchFilterBar
        isMapView={isMapView}
        onToggleMapView={() => setIsMapView((prev) => !prev)}
        keyword={keywordInput}
        onKeywordChange={setKeywordInput}
        category={category}
        onCategoryChange={handleCategoryChange}
        district={district}
        onDistrictChange={handleDistrictChange}
      />

      {status === "loading" && (
        <div className="bg-tag-bg mt-6 flex h-[400px] w-full items-center justify-center rounded-xl">
          <p className="text-text-primary text-xl font-medium">
            공간을 불러오는 중이에요
          </p>
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
            className="text-primary text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      )}

      {status === "success" && isMapView && (
        <ExploreSpaceMap
          spaces={spaces}
          onSelectSpace={(spaceId) => navigate(`/spaces/${spaceId}`)}
          onClose={() => setIsMapView(false)}
        />
      )}

      {status === "success" && !isMapView && spaces.length === 0 && (
        <div className="mt-6 flex h-[300px] w-full items-center justify-center">
          <p className="text-text-secondary text-sm">검색 결과가 없어요.</p>
        </div>
      )}

      {status === "success" && !isMapView && spaces.length > 0 && (
        <>
          <div
            className={`mt-6 grid grid-cols-4 gap-x-6 gap-y-10 transition-opacity ${
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
              />
            ))}
          </div>

          <ExplorePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
};

export default ExploreSpace;
