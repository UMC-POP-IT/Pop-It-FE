import Button from "@/shared/components/Button";
import iconCheckCircle from "@/assets/icons/icon_check_circle.svg";
import { useNavigate } from "react-router-dom";
import { useHostRegisterStore } from "@/store/registerStore";

// 호스트 등록 완료 화면
export const HostRegisterComplete = () => {
  const navigate = useNavigate();
  const reset = useHostRegisterStore((s) => s.reset);

  const handleDone = () => {
    reset();
    navigate("/host/spaces");
  };
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-6 text-center">
      <span className="text-primary">
        <img
          src={iconCheckCircle}
          alt="완료"
          className="h-12 w-12"
        />
      </span>

      <h1 className="text-text-primary text-2xl font-bold">
        호스트 등록 완료!
      </h1>
      <p className="text-text-secondary text-sm">
        이제 공간을 등록하여 팝잇을 이용해보세요
      </p>

      <Button
        variant="primary"
        size="md"
        onClick={handleDone}
      >
        호스트 홈으로
      </Button>
    </div>
  );
};
