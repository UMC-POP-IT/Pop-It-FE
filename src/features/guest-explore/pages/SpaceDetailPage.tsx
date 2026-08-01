import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSpaceDetail,
  toExploreSpaceDetail,
} from "@/features/guest-explore/api/space_api";
import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_spaces";
import ExploreDetailGallery from "@/features/guest-explore/components/ExploreDetailGallery";
import ExploreDetailInfo from "@/features/guest-explore/components/ExploreDetailInfo";
import ExploreReservationCard from "@/features/guest-explore/components/ExploreReservationCard";
import { useWishStore } from "@/store/wishStore";
import { useAuthStore } from "@/store/authStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";

type FetchStatus = "loading" | "success" | "notfound" | "error";

export const SpaceDetailPage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const wishedIds = useWishStore((state) => state.wishedIds);
  const syncWished = useWishStore((state) => state.syncWished);
  const user = useAuthStore((s) => s.user);
  const openLoginModal = useAuthStore((s) => s.openLoginModal);
  const { handleWishToggle } = useWishGuard();

  const [status, setStatus] = useState<FetchStatus>("loading");
  const [space, setSpace] = useState<ExploreSpaceDetail | null>(null);
  const [isMine, setIsMine] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const id = Number(spaceId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [spaceId]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setStatus("loading");
      setSpace(null);

      if (!Number.isFinite(id)) {
        setStatus("notfound");
        return;
      }

      try {
        const detail = await getSpaceDetail(id);
        if (ignore) return;

        setSpace(toExploreSpaceDetail(detail));
        setIsMine(detail.isMine);
        // 최초 진입 시에만 서버의 찜 여부로 로컬 상태를 맞춘다.
        syncWished(detail.spaceId, detail.isWishlisted);
        setStatus("success");
      } catch (error) {
        if (ignore) return;

        const status = error instanceof Error ? (error as { status?: number }).status : undefined;
        if (status === 404) {
          setStatus("notfound");
        } else {
          setStatus("error");
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, retryKey]);

  const isWished = !!space && wishedIds.includes(space.id);

  if (status === "loading") {
    return (
      <div className="bg-tag-bg flex h-[400px] w-full items-center justify-center rounded-xl">
        <p className="text-text-primary text-xl font-medium">
          공간 정보를 불러오는 중이에요
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-text-secondary text-sm">
          공간 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
        <button
          type="button"
          onClick={() => setRetryKey((k) => k + 1)}
          className="text-primary text-sm font-medium"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (status === "notfound" || !space) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-text-secondary text-sm">
          공간 정보를 찾을 수 없어요.
        </p>
        <button
          type="button"
          onClick={() => navigate("/explore")}
          className="text-primary text-sm font-medium"
        >
          공간 탐색으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-[1200px] flex-col gap-5">
      <ExploreDetailGallery space={space} />

      <div className="flex w-full items-start gap-[23px]">
        <ExploreDetailInfo
          space={space}
          variant={isMine ? "host" : "guest"}
          isWished={isWished}
          onWishToggle={() => handleWishToggle(space.id)}
        />
        {/* 본인이 등록한 공간은 예약할 수 없으므로 게스트 화면에서만 노출 */}
        {!isMine && (
          <ExploreReservationCard
            dayCost={space.cost.day}
            onLoginRequired={!user ? () => openLoginModal() : undefined}
          />
        )}
      </div>
    </div>
  );
};
