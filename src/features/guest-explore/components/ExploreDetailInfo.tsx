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
                className={`flex items-center justify-center p-3 ${isWished ? "text-red-500" : "text-text-secondary"}`}
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
            {/* 3D 큐레이션 */}
            <button
                type="button"
                aria-label="3D로 둘러보기"
                onClick={() => setIsCurationOpen(true)}
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
                    d="M16.2675 19.0912C16.7874 19.0912 17.2502 18.9739 17.656 18.7393C18.0618 18.5047 18.3757 18.1813 18.5976 17.7692C18.8259 17.3507 18.94 16.872 18.94 16.3331C18.94 15.7941 18.8259 15.3186 18.5976 14.9064C18.3757 14.4879 18.0618 14.1614 17.656 13.9268C17.2502 13.6922 16.7874 13.5749 16.2675 13.5749H15.2022V19.0912H16.2675ZM16.2675 12.8711C16.9332 12.8711 17.5261 13.0201 18.046 13.3181C18.5723 13.6098 18.9812 14.0187 19.2729 14.545C19.5709 15.0649 19.7199 15.6609 19.7199 16.3331C19.7199 16.9988 19.5709 17.5948 19.2729 18.1211C18.9812 18.6474 18.5723 19.0595 18.046 19.3575C17.5261 19.6492 16.9332 19.795 16.2675 19.795H14.4033V12.8711H16.2675Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12.8808 16.2199C13.1788 16.3974 13.4134 16.6352 13.5846 16.9332C13.7558 17.2312 13.8414 17.5292 13.8414 17.8272C13.8414 18.214 13.7463 18.5595 13.5561 18.8639C13.3659 19.1682 13.0996 19.406 12.7572 19.5772C12.4148 19.7484 12.0248 19.834 11.5873 19.834C11.1498 19.834 10.7599 19.7484 10.4175 19.5772C10.0751 19.3997 9.8088 19.1587 9.61858 18.8544C9.42836 18.55 9.33325 18.2013 9.33325 17.8082H10.1227C10.1227 18.0618 10.1861 18.2901 10.3129 18.493C10.4397 18.6895 10.6109 18.8449 10.8265 18.959C11.0484 19.0731 11.302 19.1302 11.5873 19.1302C11.8727 19.1302 12.1263 19.0763 12.3482 18.9685C12.5765 18.8544 12.7508 18.699 12.8713 18.5025C12.9981 18.2996 13.0615 18.0713 13.0615 17.8177C13.0615 17.5767 12.9981 17.3612 12.8713 17.1709C12.7508 16.9807 12.5796 16.8317 12.3577 16.7239C12.1358 16.6161 11.8853 16.5622 11.6063 16.5622H11.1023V15.8584H11.6063C11.8663 15.8584 12.0977 15.8109 12.3006 15.7158C12.5099 15.6207 12.6716 15.4875 12.7857 15.3163C12.9062 15.1388 12.9664 14.9391 12.9664 14.7171C12.9664 14.3684 12.8428 14.0862 12.5955 13.8707C12.3482 13.6487 12.0312 13.5378 11.6444 13.5378C11.3908 13.5378 11.1625 13.5885 10.9596 13.69C10.7567 13.7914 10.5982 13.9341 10.4841 14.118C10.3763 14.2955 10.3224 14.5016 10.3224 14.7362H9.53298C9.53298 14.3684 9.62175 14.0419 9.79928 13.7565C9.98316 13.4649 10.2336 13.2398 10.5506 13.0813C10.8677 12.9164 11.2323 12.834 11.6444 12.834C12.0502 12.834 12.4116 12.9132 12.7286 13.0718C13.052 13.2303 13.3025 13.4522 13.48 13.7375C13.6575 14.0228 13.7463 14.3462 13.7463 14.7076C13.7463 14.9803 13.667 15.2561 13.5085 15.5351C13.3563 15.8141 13.1471 16.0423 12.8808 16.2199Z"
                    fill="currentColor"
                  />
                  <path
                    d="M22.1667 13.3155C22.1667 13.1609 22.1052 13.0125 21.9959 12.9031L14.4125 5.31977C14.1847 5.09208 13.8154 5.09208 13.5876 5.31977L6.00431 12.9031C5.89496 13.0125 5.83346 13.1609 5.83341 13.3155V21.5825C5.83341 21.9046 6.09458 22.1658 6.41675 22.1658H21.5834C21.9056 22.1658 22.1667 21.9046 22.1667 21.5825V13.3155ZM23.3334 21.5825C23.3334 22.549 22.5499 23.3325 21.5834 23.3325H6.41675C5.45025 23.3325 4.66675 22.549 4.66675 21.5825V13.3155C4.66679 12.8515 4.8513 12.4064 5.17944 12.0782L12.7628 4.4949C13.4462 3.8116 14.554 3.8116 15.2374 4.4949L22.8207 12.0782C23.1489 12.4064 23.3334 12.8515 23.3334 13.3155V21.5825Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
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
          <div className="flex w-full flex-wrap items-center gap-3">
            {space.facilities.map((item, index) => (
              <span
                key={index}
                className="bg-bg-footer text-text-primary flex items-center gap-2 rounded-full px-2 py-1 text-base font-medium whitespace-nowrap"
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
