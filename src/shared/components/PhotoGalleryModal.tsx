import { useEffect, useState } from "react";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";
import iconNavChevron from "@/assets/icons/icon_nav_chevron.svg";
import iconCloseWhite from "@/assets/icons/icon_close_white.svg";

interface PhotoGalleryModalProps {
  isOpen: boolean;
  photos: string[];
  initialIndex?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  onClose: () => void;
}

/**
 * 너비는 화면에 맞춰 최대 900px, 높이는 520px 고정.
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
  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) setPhotoIndex(initialIndex);
  }, [isOpen]);

  if (!isOpen) return null;

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
        className="relative h-[520px] w-full max-w-[900px] overflow-hidden bg-[#fafafa]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          className="absolute top-8 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-[#3783f7]"
          onClick={onClose}
          aria-label="닫기"
        >
          <img src={iconCloseWhite} alt="" className="h-[18px] w-[18px]" />
        </button>

        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-text-primary text-lg font-medium">사진 불러오는 중...</span>
          </div>
        ) : photos.length > 0 ? (
          <>
            <img
              src={photos[photoIndex]}
              alt={`사진 ${photoIndex + 1}`}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(18,18,18,0.2)] px-[18px] py-1 text-lg font-bold text-white">
              {photoIndex + 1} / {photos.length}
            </span>
            {photos.length > 1 && (
              <>
                <button
                  className="absolute top-1/2 left-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-xl border-[0.5px] border-[#808080] bg-white"
                  onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                  aria-label="이전 사진"
                >
                  <img src={iconNavChevron} alt="" className="h-[16.5px] w-[9px]" />
                </button>
                <button
                  className="absolute top-1/2 right-10 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-xl border-[0.5px] border-[#808080] bg-white"
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
            <span className="text-text-primary text-lg font-medium">{emptyMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGalleryModal;
