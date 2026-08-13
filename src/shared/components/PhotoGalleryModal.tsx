import { useEffect, useState } from "react";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";
import iconNavChevron from "@/assets/icons/icon_nav_chevron.svg";

interface PhotoGalleryModalProps {
  isOpen: boolean;
  photos: string[];
  initialIndex?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  onClose: () => void;
}

/**
 * 뷰포트 비율(vw/vh) 스케일링 실험 결과 비율 자체는 괜찮다는 피드백을 받아, 그 비율을 3단계
 * 고정값으로 스냅: 모바일(~767) 340×420 · 태블릿(768~1023) 700×520 · 데스크탑(1024~) 900×520.
 * (예전 Figma 실측 고정값은 태블릿이 706 높이로 너무 크고 모바일이 285 높이로 너무 작았음 — 폭보다
 * 높이가 문제였어서, 태블릿도 데스크탑과 같은 520 상한을 쓰도록 조정했다.)
 * 사진이 잘리지 않도록 object-contain으로 표시하며, 비율이 안 맞으면 양옆에 흰 여백이 생긴다.
 * 호스트 퇴실 사진 보기 / 게스트 거절된 사진 보기가 동일한 크기를 공유해야 하므로 공용 컴포넌트로 분리.
 */
const PhotoGalleryModal = ({
  isOpen,
  photos,
  initialIndex = 0,
  isLoading = false,
  emptyMessage = "사진을 불러올 수 없습니다",
  onClose,
}: PhotoGalleryModalProps) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  // 로드에 실패한 사진 URL을 기억해뒀다가, 같은 URL을 다시 그릴 때는 깨진 이미지 아이콘 대신
  // 안내 문구를 보여준다. 인덱스가 아니라 URL 기준으로 저장해 photos 배열이 바뀌어도 안전하다.
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) {
      setPhotoIndex(initialIndex);
      setFailedUrls(new Set());
    }
  }, [isOpen, initialIndex]);

  if (!isOpen) return null;

  const currentPhoto = photos[photoIndex];
  const currentPhotoFailed = !!currentPhoto && failedUrls.has(currentPhoto);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.3)] px-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="사진 갤러리"
        tabIndex={-1}
        className="relative h-[420px] w-full max-w-[340px] overflow-hidden bg-[#fafafa] max-h-[calc(100dvh-2rem)] md:h-[520px] md:max-w-[700px] lg:max-w-[900px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 — 지도(SpaceLocationMapModal)·3D뷰(CurationModal) 닫기 버튼과 동일한
            스타일(파란 원 + 흰색 X, 36px)로 통일 */}
        <button
          type="button"
          className="bg-primary absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md md:top-6 md:right-6 lg:top-8 lg:right-8"
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>

        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-text-primary text-lg font-medium">
              사진 불러오는 중...
            </span>
          </div>
        ) : photos.length > 0 ? (
          <>
            {currentPhotoFailed ? (
              <div className="flex h-full w-full items-center justify-center bg-[#D8D8D8]">
                <span className="text-text-primary text-lg font-medium">
                  이미지를 불러올 수 없습니다
                </span>
              </div>
            ) : (
              <img
                src={currentPhoto}
                alt={`사진 ${photoIndex + 1}`}
                className="h-full w-full object-cover"
                onError={() =>
                  setFailedUrls((prev) => new Set(prev).add(currentPhoto))
                }
              />
            )}
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(18,18,18,0.2)] px-[18px] py-1 text-lg font-bold text-white md:bottom-8 lg:bottom-10">
              {photoIndex + 1} / {photos.length}
            </span>
            {photos.length > 1 && (
              <>
                <button
                  className="absolute top-1/2 left-4 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-xl border border-[#d8d8d8] bg-white md:left-8 lg:left-10"
                  onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                  aria-label="이전 사진"
                >
                  <img src={iconNavChevron} alt="" className="h-[16.5px] w-[9px]" />
                </button>
                <button
                  className="absolute top-1/2 right-4 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-xl border border-[#d8d8d8] bg-white md:right-8 lg:right-10"
                  onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                  aria-label="다음 사진"
                >
                  <img src={iconNavChevron} alt="" className="h-[16.5px] w-[9px] scale-x-[-1]" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-text-primary text-lg font-medium">
              {emptyMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGalleryModal;
