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
import PhotoGalleryModal from "@/shared/components/PhotoGalleryModal";
import Spinner from "@/shared/components/Spinner";
import { useWishStore } from "@/store/wishStore";
import { useAuthStore } from "@/store/authStore";
import { useWishGuard } from "@/shared/hooks/useWishGuard";
import { useDelayedLoading } from "@/shared/hooks/useDelayedLoading";

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
  // null이면 뷰어 닫힘, 숫자면 해당 인덱스부터 확대 뷰어 열림
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

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

        const httpStatus =
          error instanceof Error
            ? (error as { status?: number }).status
            : undefined;
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

  // 실제로 지연이 거의 없는 대부분의 요청(특히 뒤로가기로 재진입할 때)에는
  // 이 화면 자체를 비워둔다 - 헤더(MainLayout, 이 컴포넌트 바깥)만 그대로
  // 유지되고 콘텐츠 영역은 아무 것도 렌더링하지 않아, 화면이 순간 깜빡이며
  // 오류처럼 보이는 현상을 없앤다. 400ms 넘게 실제로 걸리는 경우에만 작은
  // 스피너를 보여준다(#275).
  const showLoadingSpinner = useDelayedLoading(status === "loading");

  if (status === "loading") {
    if (!showLoadingSpinner) return null;
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Spinner aria-label="공간 정보를 불러오는 중" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-tag-bg flex h-[400px] w-full flex-col items-center justify-center gap-4 rounded-xl">
        <p className="text-text-primary text-xl font-medium">
          공간 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRetryKey((k) => k + 1)}
        >
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/explore")}
        >
          공간 탐색으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 md:px-6 lg:px-0">
      <ExploreDetailGallery
        space={space}
        onImageClick={(index) => setGalleryIndex(index)}
      />

      {/* Desktop(lg, 1024~): 정보 좌측 + 예약 위젯 우측 사이드 컬럼
          Tablet/Mobile(~1023): 예약 위젯이 정보 아래로 내려와 풀폭으로 스택 (Figma 반응형 스펙, 이슈 #256) */}
      <div className="flex w-full flex-col items-start gap-10 lg:flex-row lg:gap-[23px]">
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
            availableStartDate={space.availableStartDate}
            availableEndDate={space.availableEndDate}
            onLoginRequired={!user ? () => openLoginModal() : undefined}
          />
        )}
      </div>

      <PhotoGalleryModal
        isOpen={galleryIndex !== null}
        photos={space.imageUrls}
        initialIndex={galleryIndex ?? 0}
        onClose={() => setGalleryIndex(null)}
      />
    </div>
  );
};
