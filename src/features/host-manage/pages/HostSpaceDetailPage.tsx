import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSpaceDetail, toExploreSpaceDetail } from "@/features/guest-explore/api/space_api";
import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_spaces";
import { fetchHostReservations } from "@/features/host-manage/api/hostApi";
import ExploreDetailGallery from "@/features/guest-explore/components/ExploreDetailGallery";
import ExploreDetailInfo from "@/features/guest-explore/components/ExploreDetailInfo";
import HostReservationCalendar, { type UnavailablePeriod } from "@/features/host-manage/components/HostReservationCalendar";

type FetchStatus = "loading" | "success" | "notfound" | "error";

export const HostSpaceDetailPage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [space, setSpace] = useState<ExploreSpaceDetail | null>(null);
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([]);

  const id = Number(spaceId);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setStatus("notfound");
      return;
    }

    let ignore = false;
    setStatus("loading");
    setSpace(null);

    Promise.all([
      getSpaceDetail(id),
      fetchHostReservations({ size: 50 }),
    ])
      .then(([detail, reservationsResult]) => {
        if (ignore) return;
        setSpace(toExploreSpaceDetail(detail));

        const periods: UnavailablePeriod[] = (reservationsResult.reservations ?? [])
          .filter((r) => r.space.spaceId === id && r.status !== "CANCELLED")
          .map((r) => ({ startDate: r.startDate, endDate: r.endDate }));
        setUnavailablePeriods(periods);
        setStatus("success");
      })
      .catch(() => {
        if (!ignore) setStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [id]);

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
          onClick={() => setStatus("loading")}
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
    <div className="mx-auto flex w-[1200px] flex-col gap-5">
      <ExploreDetailGallery space={space} />

      <div className="flex w-full items-start gap-[23px]">
        <div className="w-[689px] shrink-0">
          <ExploreDetailInfo space={space} variant="host" />
        </div>
        <HostReservationCalendar unavailablePeriods={unavailablePeriods} />
      </div>
    </div>
  );
};
