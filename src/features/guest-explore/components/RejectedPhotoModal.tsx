import { useEffect, useRef, useState } from "react";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { ScrollButton } from "@/features/guest-explore/components/ScrollButton";
import dangerIcon from "@/features/guest-explore/icons/danger.svg";
import { GetSubmitCheckoutPhotos } from "@/features/guest-explore/api/my_reservation_api";

const IMAGE_HEIGHT = 520;

interface RejectedPhotoModalProps {
  isOpen: boolean;
  reservationId: number;
  onClose: () => void;
}

const RejectedPhotoModal = ({ isOpen, reservationId, onClose }: RejectedPhotoModalProps) => {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose });
  const touchStartXRef = useRef<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    setPhotoIndex(0);
    setPhotoUrls([]);
    setIsLoading(true);
    setIsError(false);
    setIsRejected(false);

    GetSubmitCheckoutPhotos(reservationId)
      .then(({ imageUrls, checkoutRejected }) => {
        if (ignore) return;
        setPhotoUrls(imageUrls);
        setIsRejected(checkoutRejected);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("[RejectedPhotoModal] 퇴실 사진 조회 실패:", error);
        setIsError(true);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, reservationId]);

  if (!isOpen) return null;

  const SWIPE_THRESHOLD = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchStartXRef.current === null || photoUrls.length <= 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (deltaX > SWIPE_THRESHOLD) {
      setPhotoIndex((i) => (i - 1 + photoUrls.length) % photoUrls.length);
    } else if (deltaX < -SWIPE_THRESHOLD) {
      setPhotoIndex((i) => (i + 1) % photoUrls.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden={true} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="거절된 퇴실 사진"
        tabIndex={-1}
        className="relative z-10 flex w-full max-w-[900px] flex-col bg-white shadow-xl"
      >
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-6 right-6 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white text-text-primary shadow cursor-pointer"
        >
          <svg color="#3783F7" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative w-full">
          <div
            className="relative flex w-full touch-pan-y items-center justify-center overflow-hidden bg-[#D8D8D8]"
            style={{ height: IMAGE_HEIGHT }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {isLoading ? (
              <span className="text-text-secondary text-sm">사진을 불러오는 중...</span>
            ) : isError ? (
              <span className="text-text-secondary text-sm">사진을 불러오지 못했습니다</span>
            ) : photoUrls.length > 0 ? (
              <>
                <img
                  src={photoUrls[photoIndex]}
                  alt={`퇴실 인증 사진 ${photoIndex + 1}`}
                  className="h-full w-full object-cover"
                />

                {isRejected && (
                  // 박스 폭/높이/패딩/아이콘/글자를 전부 이 요소의 font-size(1em) 배수로 정의해서,
                  // 모바일에서 font-size가 clamp로 줄어들 때 비율을 유지한 채 전체가 함께 축소되도록 함.
                  // 767px 이상(원래 데스크톱 값)에서는 clamp가 18px로 saturate되어 기존 크기와 동일.
                  <div className="bg-[#FFF3F3] absolute top-5 left-1/2 flex h-auto min-h-[3.611em] w-[17.222em] max-w-[calc(100%-64px)] -translate-x-1/2 flex-col items-center justify-center rounded-[0.667em] px-[1.111em] py-[0.667em] text-center text-[clamp(11px,_4.81px_+_1.72vw,_18px)]">
                    <div className="flex items-center gap-[0.222em]">
                      <img src={dangerIcon} alt="경고" className="h-[0.889em] w-[0.889em] flex-shrink-0" />
                      <span className="text-[#F74B4B] font-semibold">퇴실 사진이 승인되지 않았습니다.</span>
                    </div>
                    <span className="text-text-secondary text-[0.778em]">사진을 다시 촬영해 업로드해 주세요.</span>
                  </div>
                )}
                <span className="absolute bottom-4 right-1 -translate-x-1/2 rounded-full bg-[#12121233] px-3 py-1 text-sm text-white">
                  {photoIndex + 1} / {photoUrls.length}
                </span>
              </>
            ) : (
              <span className="text-text-secondary text-sm">등록된 사진이 없습니다</span>
            )}
          </div>

          {!isLoading && !isError && photoUrls.length > 1 && (
            <>
              <div className="absolute top-0 left-8 max-[767px]:hidden">
                <ScrollButton
                  direction="prev"
                  topOffset={IMAGE_HEIGHT / 2}
                  label="이전 사진 보기"
                  onClick={() => setPhotoIndex((i) => (i - 1 + photoUrls.length) % photoUrls.length)}
                />
              </div>
              <div className="absolute top-0 right-8 max-[767px]:hidden">
                <ScrollButton
                  direction="next"
                  topOffset={IMAGE_HEIGHT / 2}
                  label="다음 사진 보기"
                  onClick={() => setPhotoIndex((i) => (i + 1) % photoUrls.length)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RejectedPhotoModal;
