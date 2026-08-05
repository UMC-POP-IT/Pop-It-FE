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
import Button from "@/shared/components/Button";
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
        // 찜 API 연동 전까지는 이 공간을 세션 내에서 이미 동기화했다면 다시 덮어쓰지 않는다
        // (그렇지 않으면 로컬에서 누른 찜 토글이 재방문 시 서버 기본값으로 되돌아간다).
        syncWished(detail.spaceId, detail.isWishlisted);
        setStatus("success");
      } catch (error) {
        if (ignore) return;

        const httpStatus = error instanceof Error ? (error as { status?: number }).status : undefined;
        if (httpStatus === 404) {
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
  }, [id, retryKey, syncWished]);

  const isWished = !!space && wishedIds.includes(space.id);

  if (status === "loading") {
    return (
      <div className="bg-tag-bg flex h-[400px] w-full flex-col items-center justify-center gap-4 rounded-xl">
        <p className="text-text-primary text-xl font-medium">
          공간 정보를 불러오는 중이에요
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-tag-bg flex h-[400px] w-full flex-col items-center justify-center gap-4 rounded-xl">
        <p className="text-text-primary text-xl font-medium">
          공간 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
        <Button variant="outline" size="sm" onClick={() => setRetryKey((k) => k + 1)}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (status === "notfound" || !space) {
    return (
      <div className="bg-tag-bg flex h-[400px] w-full flex-col items-center justify-center gap-4 rounded-xl">
        <p className="text-text-primary text-xl font-medium">
          공간 정보를 찾을 수 없어요.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate("/explore")}>
          공간 탐색으로 돌아가기
        </Button>
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
            spaceId={space.id}
            dayCost={space.cost.day}
            onLoginRequired={!user ? () => openLoginModal() : undefined}
          />
        )}
      </div>
    </div>
  );
};
