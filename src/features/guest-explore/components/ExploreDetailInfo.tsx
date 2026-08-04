import { useState, type ReactNode } from "react";
import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_spaces";
import { getPropertyBySpaceId } from "@/features/guest-explore/api/mock_3dcuration";
import SpaceLocationMapModal from "@/features/guest-explore/components/SpaceLocationMapModal";
import CurationModal from "@/features/guest-explore/components/curation/CurationModal";

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
  const isHost = variant === "host";
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isCurationOpen, setIsCurationOpen] = useState(false);
  const property = getPropertyBySpaceId(space.id);

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
              onClick={() => setIsMapOpen(true)}
              className="text-text-secondary flex items-center justify-center p-3"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 28 28"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11.5334 5.26611C11.6648 5.23524 11.8043 5.25006 11.9276 5.31169L17.5 8.09733L23.0724 5.31169C23.2531 5.22134 23.4679 5.23069 23.6398 5.33675C23.8118 5.44304 23.9167 5.63133 23.9167 5.8335V20.4168C23.9167 20.6378 23.7919 20.8398 23.5942 20.9386L17.7609 23.8553C17.5967 23.9374 17.4033 23.9374 17.2391 23.8553L11.6667 21.0685L6.09424 23.8553C5.91355 23.9457 5.69877 23.9363 5.52686 23.8302C5.35488 23.724 5.25 23.5357 5.25 23.3335V8.75016C5.25 8.52921 5.3748 8.32717 5.57243 8.22835L11.4058 5.31169L11.5334 5.26611ZM6.41667 9.11019V22.389L11.0833 20.0557V6.77686L6.41667 9.11019ZM12.25 20.0557L16.9167 22.389V9.11019L12.25 6.77686V20.0557ZM18.0833 9.11019V22.389L22.75 20.0557V6.77686L18.0833 9.11019Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            {/* 3D 큐레이션: 게스트 탐색 목업 데이터에 연결되어 있어 호스트 화면에서는 비노출 */}
            {!isHost && (
              <button
                type="button"
                aria-label="3D로 둘러보기"
                onClick={() => setIsCurationOpen(true)}
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
            <div className="flex w-full items-start justify-between">
              <span className="text-text-primary flex flex-col font-normal">
                월 단가
                <span className="text-text-tag text-xs font-normal">
                  (30일 기준)
                </span>
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

      <SpaceLocationMapModal
        space={space}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />

      {property && (
        <CurationModal
          property={property}
          isOpen={isCurationOpen}
          onClose={() => setIsCurationOpen(false)}
        />
      )}
    </div>
  );
};

const SectionTitle = ({ children }: SectionTitleProps) => (
  <div className="border-primary flex w-fit items-center justify-center border-b py-1">
    <h3 className="text-text-primary text-xl font-bold">{children}</h3>
  </div>
);

export default ExploreDetailInfo;
