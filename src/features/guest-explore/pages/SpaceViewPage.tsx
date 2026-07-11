import { useNavigate, useParams } from "react-router-dom";
import { recommendSpaces } from "@/features/guest-explore/api/mock_spaces";
import type { Space } from "@/types";
import Button from "@/shared/components/Button";

export const SpaceViewPage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const id = Number(spaceId);
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => navigate(-1)} />
      <div className="relative z-10 flex h-7/8 w-3/4 flex-col items-center justify-center gap-4 bg-tag-bg shadow-xl">
        {recommendSpaces.map((space: Space) => {
          if (space.id === id) {
            return (
              <div className="rounded-3xl absolute top-2 bg-white py-2 px-3 space-y-4 mt-6" key={space.id}>
                <span>{space.name} | {"66m²"}</span>
              </div>
            );
          }
          return null;
        })}
        <Button className="rounded-full bg-blue-500 absolute top-0 right-0 text-white w-10 h-10 flex items-center justify-center mt-6 mr-6" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </Button>
        <span className="text-text-primary text-lg font-semibold">3D 큐레이션 viewer 추가 예정</span>
      </div>
    </div>
  );
};