import { useLayoutEffect, useRef, useState, useEffect } from "react";
import SpaceCard from "@/shared/components/SpaceCard";
import { ScrollButton } from "@/features/guest-explore/components/ScrollButton";
import WishedSpaceEmptyState from "@/features/guest-explore/components/WishedSpaceEmptyState";
import type { Space } from "@/types";
import { useNavigate } from "react-router-dom";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useWishStore } from "@/store/wishStore";
import { getWishList, wishedSpace } from "@/features/guest-explore/api/spaces_api";

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
  keywords: [],
  description: dto.basicInfo,
  createdAt: "",
});

export const WishedSpace = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [wishedSpaces, setWishedSpaces] = useState<wishedSpace[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const { handleWishToggle } = useWishGuard();
  const navigate = useNavigate();

  // 이번 전체 목록 조회(재시도 포함)에서 서버가 실제로 찜했다고 확인해준 spaceId 누적 집합.
  // GET /users/me/wishlist는 페이지네이션이라, 한 페이지만 보고 "없으면 해제"를 단정하면
  // 아직 안 불러온 다음 페이지의 항목까지 잘못 해제 처리하게 된다. 그래서 hasNext가
  // false가 되어 전체를 다 불러온 시점에만 전역 wishedIds와 비교해서 해제를 확정한다.
  const confirmedIdsRef = useRef<Set<number>>(new Set());

  const confirmServerWishState = (pageItems: wishedSpace[], isLastPage: boolean) => {
    const { syncWished, wishedIds } = useWishStore.getState();
    pageItems.forEach((item) => {
      confirmedIdsRef.current.add(item.spaceId);
      syncWished(item.spaceId, true);
    });
    if (isLastPage) {
      wishedIds
        .filter((id) => !confirmedIdsRef.current.has(id))
        .forEach((id) => syncWished(id, false));
    }
  };

  // 최초 페이지(0)만 조회한다. 다음 페이지는 스크롤이 끝에 닿을 때 loadMore로 이어붙인다.
  useEffect(() => {
    let ignore = false;
    setStatus("loading");
    confirmedIdsRef.current = new Set();
    getWishList(0, WISH_PAGE_SIZE)
      .then((data) => {
        if (ignore) return;
        setWishedSpaces(data.wishlist);
        setHasNext(data.hasNext);
        setPage(0);
        setStatus("success");
        confirmServerWishState(data.wishlist, !data.hasNext);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("내가 찜한 공간 불러오기 실패", error);
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [retryKey]);

  // 다음 페이지를 이어붙인다. 항상 최신 page/hasNext를 참조하도록 아래 loadMoreRef를 통해서만 호출한다.
  const loadMore = async () => {
    if (!hasNext || isFetchingNext) return;
    setIsFetchingNext(true);
    const nextPage = page + 1;
    try {
      const data = await getWishList(nextPage, WISH_PAGE_SIZE);
      setWishedSpaces((prev) => [...prev, ...data.wishlist]);
      setHasNext(data.hasNext);
      setPage(nextPage);
      confirmServerWishState(data.wishlist, !data.hasNext);
    } catch (error) {
      console.error("찜한 공간 추가 조회 실패", error);
    } finally {
      setIsFetchingNext(false);
    }
  };

  // updateScrollButtons는 마운트 시 한 번만 이벤트 리스너로 등록되므로, loadMore를 직접
  // 클로저로 캡처하면 이후 렌더에서 바뀐 page/hasNext를 못 보고 항상 최초 상태로 호출된다.
  // 매 렌더마다 최신 loadMore를 ref에 저장해두고 리스너는 ref를 통해서만 호출한다.
  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  });

  // 이 목록의 카드는 전부 "이미 찜한 공간"이므로, 하트를 누르면 항상 찜 해제이다.
  // 낙관적으로 목록에서 먼저 제거하고, API 실패 시 원래 목록으로 되돌린다.
  const handleUnwish = async (spaceId: number) => {
    const previous = wishedSpaces;
    setWishedSpaces((prev) => prev.filter((space) => space.spaceId !== spaceId));
    try {
      await handleWishToggle(spaceId);
    } catch (error) {
      console.error("찜 해제 실패", error);
      setWishedSpaces(previous);
    }
  };

  // 좌/우 스크롤 버튼 활성화 여부 업데이트 + 끝에 닿으면 다음 페이지 조회
  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (!container) return;
    setCanScrollPrev(container.scrollLeft > 1);
    const isNearEnd =
      container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
    setCanScrollNext(!isNearEnd);
    if (isNearEnd) loadMoreRef.current();
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  // SpaceCard 단위로 스크롤
  const scrollByCard = (direction: 1 | -1) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.firstElementChild as HTMLElement | null;
    const step = (card?.clientWidth ?? container.clientWidth) + 16;
    container.scrollBy({ left: direction * step, behavior: "smooth" });
  };

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
              {canScrollPrev && <ScrollButton direction="prev" position={"1/4"} onClick={() => scrollByCard(-1)} />}
              <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
              {(wishedSpaces.length > 0) ? wishedSpaces.map((space) => (
                  <div
                  key={space.spaceId}
                  className="w-[calc(50%-0.5rem)] flex-none sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-3*1rem)/4)]"
                  >
                  <SpaceCard
                      space={toCard(space)}
                      isWished={true}
                      onWishToggle={() => handleUnwish(space.spaceId)}
                      onClick={() => navigate(`/spaces/${space.spaceId}`)}
                  />
                  </div>
              )) : <WishedSpaceEmptyState />}
              </div>
              {canScrollNext && <ScrollButton direction="next" position={"1/4"} onClick={() => scrollByCard(1)} />}
          </div>
        )}
    </section>
  );
};
