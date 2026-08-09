import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSpaceDetail, toExploreSpaceDetail } from "@/features/guest-explore/api/space_api";
import { getPropertyByCategory, type Property } from "@/features/guest-explore/api/mock_3dcuration";
import { CurationViewer } from "@/features/guest-explore/components/curation/CurationViewer";
import Button from "@/shared/components/Button";

export const SpaceViewPage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const id = Number(spaceId);
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    if (!Number.isFinite(id)) {
      setHasError(true);
      return;
    }

    setHasError(false);
    getSpaceDetail(id)
      .then((detail) => {
        if (ignore) return;
        setProperty(getPropertyByCategory(toExploreSpaceDetail(detail).category) ?? null);
      })
      .catch(() => {
        if (!ignore) setHasError(true);
      });

    return () => {
      ignore = true;
    };
  }, [id, retryKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        role="button"
        tabIndex={0}
        aria-label="닫기"
        onClick={() => navigate(`/spaces/${spaceId}`)}
        onKeyDown={(e) => { // keyboard로도 제어 가능하게끔 변경
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault(); // 현재 이벤트의 기본동작 중단
            navigate(`/spaces/${spaceId}`);
          }
        }}
      />
      <div className="relative aria-hidden z-10 h-7/8 w-3/4 overflow-hidden bg-tag-bg shadow-xl">
        {property && (
          <div className="absolute top-6 left-1/2 z-20 -translate-x-1/2 rounded-3xl bg-white py-2 px-3" key={property.id}>
            <span>{property.name} | {property.area}</span>
          </div>
        )}
        <Button className="!h-11 !w-11 !rounded-full bg-blue-500 absolute top-0 right-0 text-white flex items-center justify-center mt-6 mr-6 z-20" onClick={() => navigate(`/spaces/${spaceId}`)}>
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </Button>

        {hasError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <span className="text-text-primary text-lg font-semibold">
              3D 큐레이션을 불러오지 못했어요
            </span>
            <Button variant="outline" size="sm" onClick={() => setRetryKey((k) => k + 1)}>
              다시 시도
            </Button>
          </div>
        ) : property ? (
          <CurationViewer property={property} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-text-primary text-lg font-semibold">3D 큐레이션 준비중입니다</span>
          </div>
        )}
      </div>
    </div>
  );
};