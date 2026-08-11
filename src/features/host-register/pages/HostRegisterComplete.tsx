import { useState } from "react";
import Button from "@/shared/components/Button";
import iconCheckCircle from "@/assets/icons/icon_check_circle.svg";
import { useHostRegisterStore } from "@/store/registerStore";
import { useHostModeSwitch } from "@/shared/hooks/useHostModeSwitch";

// 호스트 등록 완료 화면
export const HostRegisterComplete = () => {
  const reset = useHostRegisterStore((s) => s.reset);
  const switchToHost = useHostModeSwitch();
  const [isLeaving, setIsLeaving] = useState(false); // 이동 처리 중 (중복 클릭 방지)
  const [error, setError] = useState("");

  const handleDone = async () => {
    // disabled는 다음 렌더에야 반영되므로 아주 빠른 더블클릭은 여기서 막는다
    if (isLeaving) return;
    setIsLeaving(true);
    setError("");

    // 모드 전환·서버 동기화·이동을 훅이 처리한다.
    // 등록 여부 조회에 실패하면 이동하지 않으므로 버튼을 다시 열어준다.
    if ((await switchToHost()) === "unknown") {
      setError("호스트 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요");
      setIsLeaving(false);
      return;
    }

    // 폼 비우기는 이동이 끝난 뒤에 한다. reset()이 isJustRegistered까지 끄기 때문에
    // 먼저 호출하면 아직 이 화면에 있는 동안 가드가 /host/spaces로 바꿔버리고,
    // 곧이어 훅이 같은 곳으로 또 이동해 히스토리에 같은 칸이 두 번 쌓인다.
    reset();
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
        disabled={isLeaving}
        onClick={handleDone}
      >
        {isLeaving ? "이동 중..." : "호스트 홈으로"}
      </Button>

      {error && (
        <span
          role="alert"
          className="text-danger text-sm"
        >
          {error}
        </span>
      )}
    </div>
  );
};
