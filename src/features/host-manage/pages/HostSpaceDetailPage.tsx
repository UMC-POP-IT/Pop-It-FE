import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchSpaceDetail, toHostSpaceDetail, type HostSpaceDetail } from "@/features/host-manage/api/spaceDetailApi";
import { fetchUnavailableDates } from "@/features/host-manage/api/hostApi";
import ExploreDetailGallery from "@/features/guest-explore/components/ExploreDetailGallery";
import ExploreDetailInfo from "@/features/guest-explore/components/ExploreDetailInfo";
import HostReservationCalendar, { type UnavailablePeriod } from "@/features/host-manage/components/HostReservationCalendar";
import PhotoGalleryModal from "@/shared/components/PhotoGalleryModal";

type FetchStatus = "loading" | "success" | "notfound" | "error";

export const HostSpaceDetailPage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [space, setSpace] = useState<HostSpaceDetail | null>(null);
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([]);
  const [retryKey, setRetryKey] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const id = Number(spaceId);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setStatus("notfound");
      return;
    }

    let ignore = false;
    setStatus("loading");
    setSpace(null);

    const fetchAll = async () => {
      const [detail, unavailable] = await Promise.all([
        fetchSpaceDetail(id),
        fetchUnavailableDates(id),
      ]);

      if (ignore) return;
      setSpace(toHostSpaceDetail(detail));
      setUnavailablePeriods(unavailable);
      setStatus("success");
    };

    fetchAll().catch(() => {
      if (!ignore) setStatus("error");
    });

    return () => {
      ignore = true;
    };
  }, [id, retryKey]);

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
          onClick={() => navigate("/host/spaces")}
          className="text-primary text-sm font-medium"
        >
          내 공간으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      <div className="overflow-x-hidden">
        <ExploreDetailGallery space={space} onImageClick={(i) => setGalleryIndex(i)} />
      </div>

      <div className="flex w-full flex-col items-start gap-5 min-[1024px]:flex-row min-[1024px]:gap-[23px]">
        <div className="w-full min-[1024px]:w-[clamp(468px,53.125vw_-_76px,689px)] min-[1024px]:shrink-0">
          <ExploreDetailInfo space={space} variant="host" />
        </div>
        <HostReservationCalendar unavailablePeriods={unavailablePeriods} />
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
