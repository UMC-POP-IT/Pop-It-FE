import DaumPostcode from "react-daum-postcode";

// 주소 선택 결과 — 페이지에서 서울 검증·시/구 채움에 사용
export interface AddressResult {
  address: string; // 도로명 주소 (예: "서울 강남구 테헤란로 123")
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 딤 배경 (클릭 시 닫기) */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* 우편번호 검색 팝업 */}
      <div className="relative z-10 w-[500px] overflow-hidden rounded-lg bg-white">
        <DaumPostcode
          onComplete={(data) => {
            onComplete({
              address: data.roadAddress,
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
