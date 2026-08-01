import StepIndicator from "@/shared/components/StepIndicator";
import Button from "@/shared/components/Button";
import Logo from "@/shared/components/Logo";
import iconClose from "@/assets/icons/icon_close.svg";
import { useNavigate } from "react-router-dom";
import { HOST_STEPS } from "@/features/host-register/api/mock_register";
import { useAuthStore } from "@/store/authStore";

// 호스트 등록 시작 모달 (인트로)
//  - [등록 시작하기] → step1(사업자 정보) 화면으로 이동
//  - [X] → 게스트 모드로 복귀 + 게스트홈(/)으로 이동
// TODO(2차): 모달 열림/닫힘 상태 관리
export const HostRegisterStart = () => {
  const navigate = useNavigate();
  const setMode = useAuthStore((s) => s.setMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 모달 카드 */}
      <div className="relative z-10 flex w-[720px] gap-8 rounded-2xl bg-white p-8 shadow-xl">
        {/* X 닫기 (공통 X 컴포넌트 없어 LoginModal과 동일하게 raw button 사용) */}
        <button
          type="button"
          aria-label="닫기"
          onClick={() => {
            setMode("GUEST"); // 호스트 전환 취소 → 게스트 모드로 복귀
            navigate("/");
          }}
          className="text-text-secondary hover:text-text-primary absolute top-4 right-4 text-xl"
        >
          <img
            src={iconClose}
            alt=""
            className="h-4 w-4"
          />
        </button>

        {/* 왼쪽: 대표 이미지 (정적 목업 — 회색 박스)
            TODO: 실제 이미지 에셋으로 교체 */}
        <div className="bg-tag-bg aspect-square w-1/2 shrink-0 rounded-lg" />

        {/* 오른쪽: 안내 + 진행바 + 시작 버튼 */}
        <div className="flex flex-1 flex-col gap-4">
          <Logo variant="footer" />

          <div className="flex flex-col gap-1">
            <h1 className="text-text-primary text-2xl font-bold">
              호스트 등록
            </h1>
            <p className="text-text-secondary text-sm">
              안전한 거래를 위해 호스트 등록을 마친 후 팝잇을 이용해주세요
            </p>
          </div>

          {/* 진행바 — 아직 시작 전이라 두 단계 모두 비활성(currentStep=-1) */}
          <StepIndicator
            steps={HOST_STEPS}
            currentStep={-1}
          />

          {/* 등록 시작하기 → step1(사업자 정보)로 이동 */}
          <Button
            variant="primary"
            size="md"
            className="self-start"
            onClick={() => navigate("/host/host-register/step1")}
          >
            등록 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
};
