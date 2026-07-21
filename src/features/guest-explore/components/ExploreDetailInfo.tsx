import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_spaces";

interface ExploreDetailInfoProps {
  space: ExploreSpaceDetail;
  /** 게스트/호스트 역할에 따른 조건부 렌더링 (기본값: 게스트) */
  variant?: "guest" | "host";
  isWished?: boolean;
  onWishToggle?: () => void;
}

interface SectionTitleProps {
  children: ReactNode;
}

const ExploreDetailInfo = ({
  space,
  variant = "guest",
  isWished = false,
  onWishToggle,
}: ExploreDetailInfoProps) => {
  const navigate = useNavigate();
  const isHost = variant === "host";

  return (
    <div
      className={`flex shrink-0 flex-col gap-10 ${isHost ? "w-full" : "w-[689px]"}`}
    >
      {/* 제목 + 액션 */}
      <div className="flex flex-col items-start gap-4">
        <div className="flex w-full items-start justify-between">
          <div className="border-primary flex flex-col items-start gap-1 border-b-2 py-2">
            <span className="text-primary text-base font-bold">
              {space.category}
            </span>
            <span className="text-text-primary text-2xl font-bold">
              {space.name}
            </span>
          </div>

          <div className="flex shrink-0 items-center">
            {/* 찜하기: 게스트 전용 기능 */}
            {!isHost && onWishToggle && (
              <button
                type="button"
                aria-label={isWished ? "찜 해제하기" : "찜하기"}
                aria-pressed={isWished}
                onClick={onWishToggle}
                className="flex items-center justify-center p-3"
              >
                <span
                  className={`text-2xl leading-none ${isWished ? "text-red-500" : "text-text-secondary"}`}
                >
                  {isWished ? "♥" : "♡"}
                </span>
              </button>
            )}
            <button
              type="button"
              aria-label="지도로 보기"
              className="flex items-center justify-center p-3 text-2xl leading-none"
            >
              🗺
            </button>
            {/* 3D 큐레이션: 게스트 탐색 목업 데이터에 연결되어 있어 호스트 화면에서는 비노출 */}
            {!isHost && (
              <button
                type="button"
                aria-label="3D로 둘러보기"
                onClick={() => navigate(`/spaces/${space.id}/view`)}
                className="text-text-primary flex items-center justify-center p-3 text-sm font-bold"
              >
                3D
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3 py-2">
            <span className="bg-bg-footer flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
              📍
            </span>
            <span className="text-text-primary text-lg font-bold">
              {space.address}
            </span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <span className="bg-bg-footer flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
              ↔
            </span>
            <span className="text-text-primary text-lg font-bold">
              {space.area}m²
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-20">
        {/* 가격 */}
        <div className="flex flex-col items-start gap-5">
          <SectionTitle>가격</SectionTitle>
          <div className="flex w-[200px] flex-col items-end gap-3 text-base font-bold">
            <div className="flex w-full items-center justify-between">
              <span className="text-text-primary font-normal">일 단가</span>
              <span className="text-right">
                <span className="text-primary">
                  {space.cost.day.toLocaleString()}
                </span>
                <span className="text-text-primary">원</span>
              </span>
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="text-text-primary font-normal">주 단가</span>
              <span className="text-right">
                <span className="text-primary">
                  {(space.cost.day * 7).toLocaleString()}
                </span>
                <span className="text-text-primary">원</span>
              </span>
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="text-text-primary font-normal">
                월 단가 (30일 기준)
              </span>
              <span className="text-right">
                <span className="text-primary">
                  {(space.cost.day * 30).toLocaleString()}
                </span>
                <span className="text-text-primary">원</span>
              </span>
            </div>
          </div>
        </div>

        {/* 상세설명 */}
        <div className="flex flex-col items-start gap-5">
          <SectionTitle>상세설명</SectionTitle>
          <p className="text-text-tag text-base whitespace-pre-line">
            {space.description}
          </p>
        </div>

        {/* 시설정보 */}
        <div className="flex flex-col items-start gap-5">
          <SectionTitle>시설정보</SectionTitle>
          <div className="flex items-center gap-3">
            {space.facilities.map((item, index) => (
              <span
                key={index}
                className="bg-bg-footer text-text-primary flex items-center gap-2 rounded-full px-2 py-1 text-base font-medium"
              >
                <span className="bg-primary-100 h-5 w-5 rounded-full" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 공간정보 */}
        <div className="flex flex-col items-start gap-5">
          <SectionTitle>공간정보</SectionTitle>
          <div className="flex items-center gap-3">
            {space.spaceInfo.map((item, index) => (
              <span
                key={index}
                className="bg-bg-footer text-text-primary flex items-center gap-2 rounded-full px-2 py-1 text-base font-medium"
              >
                <span className="bg-primary-100 h-5 w-5 rounded-full" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 영업허가 안내 */}
        <div className="bg-tag-bg flex w-full flex-col gap-3 rounded-lg px-7 py-6">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">⚠️</span>
            <span className="text-text-primary text-base font-bold">
              영업허가 안내
            </span>
          </div>
          <p className="text-base text-[#464646]">
            이 공간에서 식음료 영업을 계획하시는 경우, 반드시 해당
            공간의 영업허가 가능 여부를 사전에 확인해주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ children }: SectionTitleProps) => (
  <div className="border-primary flex w-fit items-center justify-center border-b py-1">
    <h3 className="text-text-primary text-xl font-bold">{children}</h3>
  </div>
);

export default ExploreDetailInfo;
