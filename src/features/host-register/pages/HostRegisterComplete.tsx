import { useState } from "react";
import Button from "@/shared/components/Button";
import iconCheckCircle from "@/assets/icons/icon_check_circle.svg";
import { useNavigate } from "react-router-dom";
import { useHostRegisterStore } from "@/store/registerStore";
import { switchMode } from "@/shared/utils/oauth";

// 호스트 등록 완료 화면
export const HostRegisterComplete = () => {
  const navigate = useNavigate();
  const reset = useHostRegisterStore((s) => s.reset);
  const [isLeaving, setIsLeaving] = useState(false); // 이동 처리 중 (중복 클릭 방지)

  const handleDone = async () => {
    // disabled는 다음 렌더에야 반영되므로 아주 빠른 더블클릭은 여기서 막는다
    if (isLeaving) return;
    setIsLeaving(true);
    reset();
    // 헤더의 모드 전환은 '이미 등록된 호스트'일 때만 서버에 알린다(Header.tsx:93).
    // 방금 등록을 마친 사용자는 그 조건에 걸리지 않아 서버 currentMode가 GUEST로 남는다.
    // 이 값은 새로고침 시 앱 모드를 결정하므로(authStore.ts:79) 여기서 맞춰둔다.
    // 실패해도 화면 이동은 막지 않는다 — 등록 자체는 이미 끝났다.
    try {
      await switchMode("HOST");
    } catch (err) {
      console.error("[HostRegisterComplete] 호스트 모드 전환 실패:", err);
    }
    // 성공·실패 모두 이동하므로 이 컴포넌트는 언마운트된다. isLeaving은 되돌리지 않는다.
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
        disabled={isLeaving}
        onClick={handleDone}
      >
        {isLeaving ? "이동 중..." : "호스트 홈으로"}
      </Button>
    </div>
  );
};
