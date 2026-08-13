import { useState, type ReactNode } from "react";
import type { ExploreSpaceDetail } from "@/features/guest-explore/api/mock_spaces";
import { getPropertyByCategory } from "@/features/guest-explore/api/mock_3dcuration";
import SpaceLocationMapModal from "@/features/guest-explore/components/SpaceLocationMapModal";
import CurationModal from "@/features/guest-explore/components/curation/CurationModal";
import businessLicenseInfoIcon from "@/assets/icons/icon_business_license_info.svg";
import icon3D from "@/assets/icons/icon_3d.svg";

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
  const property = getPropertyByCategory(space.category);

  return (
    <div
      className={`flex shrink-0 flex-col gap-10 ${isHost ? "w-full" : "w-full lg:w-[689px]"}`}
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
                className={`flex items-center justify-center p-3 ${isWished ? "text-red-500" : "text-text-primary"}`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d={
                      isWished
                        ? "M15.0663 7.07836C17.1027 4.79916 20.6661 4.67434 22.8559 6.86416C24.8804 8.8887 24.9583 12.1466 23.0325 14.2652L14.4306 23.725C14.3201 23.8466 14.1632 23.9164 13.9988 23.9164C13.8346 23.9163 13.6786 23.8465 13.5681 23.725L4.96739 14.2652C3.04152 12.1466 3.11947 8.88871 5.14399 6.86416C7.40462 4.60353 11.1279 4.80989 13.1249 7.30622L13.9988 8.39883L14.8738 7.30622L15.0663 7.07836Z"
                        : "M15.0663 7.07836C17.1027 4.79916 20.6661 4.67434 22.8559 6.86416C24.8804 8.8887 24.9583 12.1466 23.0325 14.2652L14.4306 23.725C14.3201 23.8466 14.1632 23.9164 13.9988 23.9164C13.8346 23.9163 13.6786 23.8465 13.5681 23.725L4.96739 14.2652C3.04152 12.1466 3.11947 8.88871 5.14399 6.86416C7.40462 4.60353 11.1279 4.80989 13.1249 7.30622L13.9988 8.39883L14.8738 7.30622L15.0663 7.07836ZM22.031 7.68903C20.2621 5.92014 17.348 6.08197 15.7853 8.03539L14.4557 9.69766C14.345 9.83608 14.1772 9.91637 13.9999 9.91641C13.8228 9.91641 13.6549 9.83599 13.5442 9.69766L12.2135 8.03539C10.6507 6.08191 7.7377 5.92019 5.96886 7.68903C4.38466 9.27325 4.324 11.8224 5.831 13.4802L13.9988 22.4661L22.1689 13.4802C23.6759 11.8224 23.6152 9.27323 22.031 7.68903Z"
                    }
                    fill="currentColor"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              aria-label="지도로 보기"
              onClick={() => setIsMapOpen(true)}
              className="text-text-primary flex items-center justify-center p-3"
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
            {/* 3D 큐레이션 */}
            <button
              type="button"
              aria-label="3D로 둘러보기"
              onClick={() => setIsCurationOpen(true)}
              className="text-text-primary flex items-center justify-center p-3"
            >
              <img
                src={icon3D}
                alt=""
                aria-hidden="true"
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start">
          <div className="flex items-center gap-4 py-2">
            <span className="bg-bg-footer flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-text-primary"
                aria-hidden="true"
              >
                <path
                  d="M12 22s7-7.58 7-12.5S16.14 2 12 2 5 4.99 5 9.5 12 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="9.5"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            <span className="text-text-primary text-lg font-bold">
              {space.address}
            </span>
          </div>
          <div className="flex items-center gap-4 py-2">
            <span className="bg-bg-footer flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-text-primary"
                aria-hidden="true"
              >
                <path
                  d="M4 12h16M4 12l3.5-3.5M4 12l3.5 3.5M20 12l-3.5-3.5M20 12l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
          <div className="flex items-end gap-6">
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
                <span className="text-text-primary font-normal">월 단가</span>
                <span className="text-right">
                  <span className="text-primary">
                    {(space.cost.day * 30).toLocaleString()}
                  </span>
                  <span className="text-text-primary">원</span>
                </span>
              </div>
            </div>
            <span className="text-text-tag text-base font-normal whitespace-nowrap">
              (30일 기준)
            </span>
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
          <div className="flex w-full flex-wrap items-center gap-3">
            {space.facilities.map((item, index) => (
              <span
                key={index}
                className="bg-bg-footer text-text-primary flex items-center gap-2 rounded-full px-2 py-1 text-base font-medium whitespace-nowrap"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 공간정보 */}
        <div className="flex flex-col items-start gap-5">
          <SectionTitle>공간정보</SectionTitle>
          {/* 컨테이너 폭이 좁아지는 Tablet/Mobile에서 칩이 넘치지 않도록 줄바꿈 허용 (시설정보와 동일하게 맞춤) */}
          <div className="flex w-full flex-wrap items-center gap-3">
            {space.spaceInfo.map((item, index) => (
              <span
                key={index}
                className="bg-bg-footer text-text-primary flex items-center gap-2 rounded-full px-2 py-1 text-base font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 영업허가 안내 */}
        <div className="bg-tag-bg flex w-full flex-col gap-3 rounded-lg px-7 py-6">
          <div className="flex items-center gap-2">
            <img
              src={businessLicenseInfoIcon}
              alt=""
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
            />
            <span className="text-text-primary text-base font-bold">
              영업허가 안내
            </span>
          </div>
          <p className="text-base text-[#464646]">
            이 공간에서 식음료 영업을 계획하시는 경우, 반드시 해당 공간의
            영업허가 가능 여부를 사전에 확인해주세요.
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
          buildingName={space.name}
          area={space.area}
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
