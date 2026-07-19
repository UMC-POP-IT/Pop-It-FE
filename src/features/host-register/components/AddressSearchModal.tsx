import DaumPostcode from "react-daum-postcode";

interface AddressSearchModalProps {
  isOpen: boolean; //모달 열림/닫힘
  onClose: () => void;
  onComplete: (address: string) => void; //주소 선택 완료 시 부모에게 전달
}

const AddressSearchModal = ({
  isOpen,
  onClose,
  onComplete,
}: AddressSearchModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative z-10 w-[500px] overflow-hidden rounded-lg bg-white">
        <DaumPostcode
          onComplete={(data) => {
            onComplete(data.roadAddress);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
export default AddressSearchModal;
