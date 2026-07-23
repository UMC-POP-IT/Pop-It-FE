import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  mockHostSpaces,
  type MockHostSpace,
} from "@/features/host-manage/api/mock_host_data";
import {
  scatterCoordinate,
  type ExploreSpaceDetail,
} from "@/features/guest-explore/api/mock_spaces";
import ExploreDetailGallery from "@/features/guest-explore/components/ExploreDetailGallery";
import ExploreDetailInfo from "@/features/guest-explore/components/ExploreDetailInfo";

type FetchStatus = "loading" | "success" | "notfound" | "error";

/**
 * 호스트가 등록한 공간(MockHostSpace)을
 * 게스트 공간 상세 UI(ExploreSpaceDetail)에서 재사용 가능한 형태로 변환
 */
const toExploreSpaceDetail = (space: MockHostSpace): ExploreSpaceDetail => {
  const areaNumber = Number(space.area.replace(/[^0-9.]/g, "")) || 0;

  return {
    id: space.id,
    hostId: 0, // 호스트 본인 공간 상세이므로 별도 참조 불필요
    imageUrls: space.imageUrls,
    heartCount: 0, // 호스트 화면에서는 찜 개수를 노출하지 않음
    name: space.name,
    address: space.address,
    cost: {
      day: space.cost.day,
      month: space.cost.month,
      year: space.cost.month * 12,
    },
    keywords: space.facilities,
    description: space.description,
    createdAt: space.registeredAt,
    category: space.category,
    area: areaNumber,
    // TODO: 주 단가 필드가 별도로 없어 일 단가 기준 추정치 사용 (백엔드 연동 시 교체)
    weekCost: space.cost.day * 7,
    monthCostText: `${space.cost.month.toLocaleString()}원`,
    facilities: space.facilities,
    spaceInfo: space.spaceInfo,
    // 지도 표시용 좌표 (백엔드 연동 전까지 목업 스캐터 처리)
    ...scatterCoordinate(space.id),
  };
};

// TODO: 백엔드 연동 전까지 목업 데이터 조회를 비동기 API 호출처럼 흉내낸다
const fetchHostSpaceById = (id: number): Promise<MockHostSpace | undefined> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockHostSpaces.find((space) => space.id === id));
    }, 300);
  });

export const HostSpaceDetailPage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [space, setSpace] = useState<MockHostSpace | null>(null);

  const id = Number(spaceId);

  useEffect(() => {
    let ignore = false;
    setStatus("loading");
    setSpace(null);

    if (!Number.isFinite(id)) {
      setStatus("notfound");
      return;
    }

    fetchHostSpaceById(id)
      .then((result) => {
        if (ignore) return;
        if (result) {
          setSpace(result);
          setStatus("success");
        } else {
          setStatus("notfound");
        }
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
          onClick={() => {
            setStatus("loading");
            setSpace(null);
            if (!Number.isFinite(id)) {
              setStatus("notfound");
              return;
            }
            fetchHostSpaceById(id)
              .then((result) => {
                if (result) {
                  setSpace(result);
                  setStatus("success");
                } else {
                  setStatus("notfound");
                }
              })
              .catch(() => setStatus("error"));
          }}
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

  const detail = toExploreSpaceDetail(space);

  return (
    <div className="mx-auto flex w-[1200px] flex-col gap-5">
      <ExploreDetailGallery space={detail} />

      <div className="flex w-full items-start gap-[23px]">
        <ExploreDetailInfo
          space={detail}
          variant="host"
        />
      </div>
    </div>
  );
};
