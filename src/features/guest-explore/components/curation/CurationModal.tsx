import { useEffect } from "react";
import type { Property } from "@/features/guest-explore/api/mock_3dcuration";
import { CurationViewer } from "@/features/guest-explore/components/curation/CurationViewer";
import Button from "@/shared/components/Button";

interface CurationModalProps {
  property: Property;
  /** 공간 상세페이지의 실제 건물명 (목데이터가 아닌 space.name) */
  buildingName: string;
  /** 공간 상세페이지의 실제 면적 (목데이터가 아닌 space.area) */
  area: number;
  isOpen: boolean;
  onClose: () => void;
}

/** 공간 상세 페이지 - 3D 큐레이션 버튼 클릭 시 노출되는 3D 뷰어 모달 */
export const CurationModal = ({
  property,
  buildingName,
  area,
  isOpen,
  onClose,
}: CurationModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${buildingName} 3D 큐레이션`}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-tag-bg shadow-xl md:h-7/8 md:w-3/4">
        {/* 모바일(360~767) 전체화면 상단 바 - 뒤로가기 */}
        <div className="flex h-14 shrink-0 items-center bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="뒤로가기"
            className="flex h-9 w-9 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div
            className="absolute top-6 left-1/2 z-20 -translate-x-1/2 rounded-3xl bg-white py-2 px-3"
            key={property.id}
          >
            <span className="text-[clamp(12px,_8.47px_+_0.98vw,_16px)] whitespace-nowrap">
              {buildingName} | {area}m²
            </span>
          </div>

          {/* 닫기 버튼 — 지도(SpaceLocationMapModal)·사진 상세(PhotoGalleryModal) 닫기 버튼과
              동일한 스타일(파란 원 + 흰색 X, 36px)로 통일 */}
          <Button
            className="bg-primary !h-9 !w-9 !rounded-full absolute top-0 right-0 text-white shadow-md mt-6 mr-6 z-20 hidden md:flex"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </Button>

          <CurationViewer property={property} />
        </div>
      </div>
    </div>
  );
};

export default CurationModal;
