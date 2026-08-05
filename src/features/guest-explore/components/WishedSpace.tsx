import { useEffect, useRef, useState } from "react";
import SpaceCard from "@/shared/components/SpaceCard";
import { ScrollButton } from "@/features/guest-explore/components/ScrollButton";
import WishedSpaceEmptyState from "@/features/guest-explore/components/WishedSpaceEmptyState";
import type { Space } from "@/types";
import { useNavigate } from "react-router-dom";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useCardCarousel } from "@/features/guest-explore/hooks/useCardCarousel";
import { useWishStore } from "@/store/wishStore";
import { getWishList, wishedSpace } from "@/features/guest-explore/api/spaces_api";

// SpaceCard 4개 단위로 스크롤
const CARDS_PER_SCROLL = 4;

const WISH_PAGE_SIZE = 12;

type FetchStatus = "loading" | "success" | "error";

const HeartIcon = () => {
  return (
    <span className="text-2xl text-red-500">
      ♥
    </span>
  )
}

// 찜한 공간 API 응답(spaceId/buildingName/... 백엔드 필드명)을
// 앱 전역에서 공용으로 쓰는 Space 모델(id/name/... )로 변환
const toCard = (dto: wishedSpace): Space => ({
  id: dto.spaceId,
  hostId: 0,
  imageUrls: dto.thumbnailUrl ? [dto.thumbnailUrl] : [],
  heartCount: dto.wishCount,
  name: dto.buildingName,
  address: dto.roadAddress,
  cost: { day: dto.pricePerDay },
  keywords: dto.keywords,
  description: dto.basicInfo,
  createdAt: "",
});

export const WishedSpace = () => {
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [wishedSpaces, setWishedSpaces] = useState<wishedSpace[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const { handleWishToggle } = useWishGuard();
  const navigate = useNavigate();

  const { scrollRef, canScrollPrev, canScrollNext, imageCenter, scrollByCard } =
    useCardCarousel(CARDS_PER_SCROLL, [wishedSpaces.length, status]);

  // 이번 전체 목록 조회(재시도 포함)에서 서버가 실제로 찜했다고 확인해준 spaceId 누적 집합.
  // GET /users/me/wishlist는 페이지네이션이라, 한 페이지만 보고 "없으면 해제"를 단정하면
  // 아직 안 불러온 다음 페이지의 항목까지 잘못 해제 처리하게 된다. 그래서 hasNext가
  // false가 되어 전체를 다 불러온 시점에만 전역 wishedIds와 비교해서 해제를 확정한다.
  const confirmedIdsRef = useRef<Set<number>>(new Set());

  // mount 조회/loadMore/찜 해제 후 재동기화가 동시에 진행될 수 있는데, 응답이 요청
  // 순서와 다르게 도착하면 먼저 시작된(하지만 나중에 도착한) 응답이 이미 최신인
  // wishedSpaces를 stale한 데이터로 덮어쓸 수 있다. 목록을 바꾸는 요청을 시작할 때마다
  // 값을 올리고, 응답을 반영하기 직전 "여전히 최신 요청인지"를 확인해 그렇지 않으면 버린다.
  const fetchGenRef = useRef(0);

  const confirmServerWishState = (pageItems: wishedSpace[], isLastPage: boolean) => {
    const { syncWished, reconcileWished, wishedIds } = useWishStore.getState();
    pageItems.forEach((item) => {
      confirmedIdsRef.current.add(item.spaceId);
      syncWished(item.spaceId, true);
    });
    if (isLastPage) {
      wishedIds
        .filter((id) => !confirmedIdsRef.current.has(id))
        .forEach((id) => reconcileWished(id, false));
    }
  };

  // 최초 페이지(0)만 조회한다. 다음 페이지는 스크롤이 끝에 닿을 때 loadMore로 이어붙인다.
  useEffect(() => {
    const gen = ++fetchGenRef.current;
    setStatus("loading");
    confirmedIdsRef.current = new Set();
    getWishList(0, WISH_PAGE_SIZE)
      .then((data) => {
        if (gen !== fetchGenRef.current) return;
        setWishedSpaces(data.wishlist);
        setHasNext(data.hasNext);
        setPage(0);
        setStatus("success");
        confirmServerWishState(data.wishlist, !data.hasNext);
      })
      .catch((error) => {
        if (gen !== fetchGenRef.current) return;
        console.error("내가 찜한 공간 불러오기 실패", error);
        setStatus("error");
      });
  }, [retryKey]);

  // 다음 페이지를 이어붙인다. 항상 최신 page/hasNext를 참조하도록 아래 loadMoreRef를 통해서만 호출한다.
  const loadMore = async () => {
    if (!hasNext || isFetchingNext) return;
    setIsFetchingNext(true);
    const nextPage = page + 1;
    const gen = ++fetchGenRef.current;
    try {
      const data = await getWishList(nextPage, WISH_PAGE_SIZE);
      if (gen !== fetchGenRef.current) return;
      setWishedSpaces((prev) => [...prev, ...data.wishlist]);
      setHasNext(data.hasNext);
      setPage(nextPage);
      confirmServerWishState(data.wishlist, !data.hasNext);
    } catch (error) {
      if (gen !== fetchGenRef.current) return;
      console.error("찜한 공간 추가 조회 실패", error);
    } finally {
      setIsFetchingNext(false);
    }
  };

  // 찜 해제 성공 후, 현재까지 로드된 범위(0 ~ page)를 서버 기준으로 다시 맞춘다.
  // offset 페이지네이션(page*size)에서 이미 로드한 항목 하나가 서버에서 빠지면 이후
  // 항목들의 서버상 offset이 한 칸씩 당겨지는데, 로컬 page 값은 그대로라 다음 loadMore가
  // 이미 밀려난 항목을 건너뛰게 된다. size를 (page+1)*WISH_PAGE_SIZE로 늘려 같은 창을
  // 한 번에 다시 조회하면 이후 loadMore(page+1)가 다시 정확한 offset을 가리키게 된다.
  const resyncWishList = async (loadedPage: number) => {
    const gen = ++fetchGenRef.current;
    try {
      const data = await getWishList(0, (loadedPage + 1) * WISH_PAGE_SIZE);
      if (gen !== fetchGenRef.current) return;
      confirmedIdsRef.current = new Set();
      setWishedSpaces(data.wishlist);
      setHasNext(data.hasNext);
      confirmServerWishState(data.wishlist, !data.hasNext);
    } catch (error) {
      if (gen !== fetchGenRef.current) return;
      console.error("찜 해제 후 목록 재조회 실패", error);
    }
  };

  // 이 목록의 카드는 전부 "이미 찜한 공간"이므로, 하트를 누르면 항상 찜 해제이다.
  // 낙관적으로 목록에서 먼저 제거하고, API 실패 시 원래 목록으로 되돌린다.
  // 두 카드를 연속으로 해제하면 각 호출이 서로 다른 시점의 목록을 스냅샷으로 들고
  // 있게 되는데, 롤백 시 그 스냅샷 전체로 덮어써 버리면 그 사이에 성공적으로 끝난
  // 다른 해제 결과까지 되살아난다. 그래서 실패한 카드의 원래 위치/데이터만 기억해뒀다가
  // 롤백 시 그 카드 하나만 현재(최신) 목록에 되돌려 넣는다.
  const handleUnwish = async (spaceId: number) => {
    const removedIndex = wishedSpaces.findIndex((space) => space.spaceId === spaceId);
    if (removedIndex === -1) return;
    const removedSpace = wishedSpaces[removedIndex];
    const genBeforeToggle = fetchGenRef.current;

    setWishedSpaces((prev) => prev.filter((space) => space.spaceId !== spaceId));
    try {
      await handleWishToggle(spaceId);
      // 서버에서 실제로 빠졌으니 offset 정합을 위해 로드된 범위를 다시 맞춘다.
      await resyncWishList(page);
    } catch (error) {
      console.error("찜 해제 실패", error);
      // 실패했다면 서버에는 원래대로 남아있는 항목이라, 그 사이에 resyncWishList가
      // 이미 실행돼 서버 최신 목록으로 교체됐다면 그 안에 이 항목이 다시 포함돼 있다.
      // 그런 경우 여기서 스냅샷을 또 끼워 넣으면 중복/위치 어긋남이 생기므로 건너뛴다.
      if (fetchGenRef.current !== genBeforeToggle) return;
      setWishedSpaces((prev) => {
        const restored = [...prev];
        restored.splice(Math.min(removedIndex, restored.length), 0, removedSpace);
        return restored;
      });
    }
  };

  // 좌/우 스크롤 버튼 상태는 useCardCarousel이 관리한다. 여기서는 스크롤이 끝에 닿았을 때
  // 다음 페이지를 이어붙이는 것만 별도로 감시한다. 리스너를 마운트 시 한 번만 등록하므로
  // loadMore를 직접 클로저로 캡처하면 이후 렌더에서 바뀐 page/hasNext를 못 보고 항상 최초
  // 상태로 호출된다. 매 렌더마다 최신 loadMore를 ref에 저장해두고 리스너는 ref를 통해서만 호출한다.
  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  });

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const checkNearEnd = () => {
      const isNearEnd =
        container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
      if (isNearEnd) loadMoreRef.current();
    };
    container.addEventListener("scroll", checkNearEnd);
    return () => container.removeEventListener("scroll", checkNearEnd);
  }, [status, scrollRef]);

  return (
    <section className="flex flex-col gap-4 mt-20">
        <h2 className="text-text-primary text-2xl font-bold">내가 찜한 공간 <HeartIcon /></h2>
        <span className="text-text-secondary text-sm">관심 있는 공간을 한 눈에 확인해 보세요!</span>

        {status === "loading" && (
          <div className="bg-tag-bg flex h-[200px] w-full items-center justify-center rounded-xl">
            <p className="text-text-primary text-sm font-medium">찜한 공간을 불러오는 중이에요</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3 py-12">
            <p className="text-text-secondary text-sm">찜한 공간을 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="text-primary text-sm font-medium"
            >
              다시 시도
            </button>
          </div>
        )}

        {status === "success" && (
          <div className="relative">
              {canScrollPrev && imageCenter !== null && <ScrollButton direction="prev" topOffset={imageCenter} onClick={() => scrollByCard(-1)} />}
              {/* overflow-x-hidden은 휠/트랙패드/드래그 스크롤을 의도적으로 차단하기 위함 (화살표 버튼의 scrollBy만 허용) */}
              <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-hidden scroll-smooth"
              >
              {(wishedSpaces.length > 0) ? wishedSpaces.map((space) => (
                  <div
                  key={space.spaceId}
                  className="w-[calc(50%-0.5rem)] flex-none sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-3*1rem)/4)]"
                  >
                  <SpaceCard
                      key={space.spaceId} 
                      space={toCard(space)}
                      isWished={true}
                      categoryTag={space.spaceCategory}
                      onWishToggle={() => handleUnwish(space.spaceId)}
                      onClick={() => navigate(`/spaces/${space.spaceId}`)}
                  />
                  </div>
              )) : <WishedSpaceEmptyState />}
              </div>
              {canScrollNext && imageCenter !== null && <ScrollButton direction="next" topOffset={imageCenter} onClick={() => scrollByCard(1)} />}
          </div>
        )}
    </section>
  );
};
