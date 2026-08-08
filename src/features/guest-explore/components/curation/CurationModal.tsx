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

      <div className="relative aria-hidden z-10 h-7/8 w-3/4 overflow-hidden bg-tag-bg shadow-xl">
        <div
          className="absolute top-6 left-1/2 z-20 -translate-x-1/2 rounded-3xl bg-white py-2 px-3"
          key={property.id}
        >
          <span>
            {buildingName} | {area}m²
          </span>
        </div>

        <Button
          className="!h-11 !w-11 !rounded-full bg-blue-500 absolute top-0 right-0 text-white flex items-center justify-center mt-6 mr-6 z-20"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </Button>

        <CurationViewer property={property} />
      </div>
    </div>
  );
};

export default CurationModal;
