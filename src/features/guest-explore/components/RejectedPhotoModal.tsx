import { useEffect, useState } from "react";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";
import { ScrollButton } from "@/features/guest-explore/components/ScrollButton";
import dangerIcon from "@/features/guest-explore/icons/danger.svg";
import { GetSubmitCheckoutPhotos } from "../api/my_reservation_api";

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
  const dialogRef = useDialogA11y<HTMLDivElement>({ isOpen, onClose });

  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    setPhotoIndex(0);
    setIsLoading(true);
    setIsError(false);

    GetSubmitCheckoutPhotos(reservationId)
      .then(({ photoUrls }) => {
        if (ignore) return;
        setPhotoUrls(photoUrls);
      })
      .catch((error) => {
        if (ignore) return;
        console.error(error);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden={true} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="relative z-10 flex w-full max-w-[900px] flex-col bg-white shadow-xl"
      >
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-6 right-6 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFFFFF] text-text-primary shadow cursor-pointer"
        >
          <svg color="#3783F7" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative w-full">
          <div
            className="relative flex w-full items-center justify-center overflow-hidden bg-[#D8D8D8]"
            style={{ height: IMAGE_HEIGHT }}
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

                <div className="bg-[#FFF3F3] absolute top-5 left-1/2 flex h-[65px] w-[310px] -translate-x-1/2 flex-col items-center justify-center rounded-xl px-5 py-3 text-center">
                  <div className="flex items-center gap-1">
                    <img src={dangerIcon} alt="경고" className="h-4 w-4" />
                    <span className="text-[#F74B4B] text-[18px] font-semibold">퇴실 사진이 승인되지 않았습니다.</span>
                  </div>
                  <span className="text-text-secondary text-[14px]">사진을 다시 촬영해 업로드해 주세요.</span>
                </div>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#12121233] px-3 py-1 text-sm text-white">
                  {photoIndex + 1} / {photoUrls.length}
                </span>
              </>
            ) : (
              <span className="text-text-secondary text-sm">등록된 사진이 없습니다</span>
            )}
          </div>

          {photoUrls.length > 1 && (
            <>
              <div className="absolute top-0 left-8">
                <ScrollButton
                  direction="prev"
                  topOffset={IMAGE_HEIGHT / 2}
                  onClick={() => setPhotoIndex((i) => (i - 1 + photoUrls.length) % photoUrls.length)}
                />
              </div>
              <div className="absolute top-0 right-8">
                <ScrollButton
                  direction="next"
                  topOffset={IMAGE_HEIGHT / 2}
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
