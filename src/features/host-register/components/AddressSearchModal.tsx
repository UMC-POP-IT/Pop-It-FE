import { useEffect, useRef } from "react";
import DaumPostcode from "react-daum-postcode";


// 주소 선택 결과 — 페이지에서 서울 검증·시/구 채움에 사용
export interface AddressResult {
  address: string; // 주소 (사용자가 고른 타입 기준 — 빈 값 방지)
  sido: string; // 시/도 (예: "서울")
  sigungu: string; // 시/군/구 (예: "강남구")
}

interface AddressSearchModalProps {
  isOpen: boolean; // 모달 열림/닫힘
  onClose: () => void;
  onComplete: (result: AddressResult) => void; // 주소 선택 완료 시 부모에게 전달
}

const AddressSearchModal = ({
  isOpen,
  onClose,
  onComplete,
}: AddressSearchModalProps) => {
  // 열려있을 때만 Esc 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null> (null);


  useEffect(()=> {
    if (!isOpen) return;
    triggerRef.current= document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    return () => {
      triggerRef.current?.focus();
    };

  },[isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 딤 배경 (클릭 시 닫기) */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* 우편번호 검색 팝업 */}
      <div
        ref = {dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="주소 검색"
        className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-lg bg-white"
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          aria-label="주소 검색 닫기"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-lg text-white"
        >
          ×
        </button>
        <DaumPostcode
          onComplete={(data) => {
            // 지번을 고르면 roadAddress가 빈 값일 수 있어, 고른 타입에 맞는 주소 사용
            const address =
              data.userSelectedType === "R"
                ? data.roadAddress || data.autoRoadAddress || data.jibunAddress
                : data.jibunAddress || data.autoJibunAddress || data.roadAddress;
              if (!address) return;
            onComplete({
              address,
              sido: data.sido,
              sigungu: data.sigungu,
            });
            onClose();
          }}
        />
      </div>
    </div>
  );
};

export default AddressSearchModal;
