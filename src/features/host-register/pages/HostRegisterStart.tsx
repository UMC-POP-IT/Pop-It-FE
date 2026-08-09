import { useId } from "react";
import StepIndicator from "@/shared/components/StepIndicator";
import Button from "@/shared/components/Button";
import Logo from "@/shared/components/Logo";
import iconClose from "@/assets/icons/icon_close.svg";
import { useNavigate } from "react-router-dom";
import { HOST_STEPS } from "@/features/host-register/api/mock_register";
import { useAuthStore } from "@/store/authStore";
import { useDialogA11y } from "@/shared/hooks/useDialogA11y";
import hostRegisterIllustration from "@/assets/images/host_register_illustration.png";

// 호스트 등록 시작 모달 (인트로)
//  - [등록 시작하기] → step1(사업자 정보) 화면으로 이동
//  - [X] → 게스트 모드로 복귀 + 게스트홈(/)으로 이동
// TODO(2차): 모달 열림/닫힘 상태 관리
export const HostRegisterStart = () => {
  const navigate = useNavigate();
  const setMode = useAuthStore((s) => s.setMode);
  const titleId = useId();

  // X 버튼과 Escape가 같은 동작을 한다 — 호스트 전환을 취소하고 게스트 홈으로
  const handleClose = () => {
    setMode("GUEST");
    navigate("/");
  };

  // 이 화면은 라우트지만 MainLayout 아래에 있어 Header/Footer가 뒤에 그대로 렌더된다.
  // 딤이 시각적으로만 덮을 뿐이라, 트랩이 없으면 Tab이 딤 뒤의 안 보이는 헤더·푸터
  // 링크로 먼저 나가서 포커스 위치를 알 수 없게 된다. aria-modal="true"는 "바깥이
  // 불활성"이라는 선언이므로 반드시 이 트랩과 세트로만 붙인다.
  // isOpen이 항상 true인 이유: 마운트되어 있다는 것 자체가 열려 있다는 뜻이다.
  // TODO(2차): 이 훅은 언마운트 시 포커스를 트리거로 되돌리는데, 이 화면은 닫을 때뿐
  // 아니라 [등록 시작하기]로 step1에 갈 때도 언마운트된다. 앞으로 갔는데 포커스만
  // 헤더로 돌아가므로, 위 "모달 열림/닫힘 상태 관리"와 함께 정리한다.
  const dialogRef = useDialogA11y<HTMLDivElement>({
    isOpen: true,
    onClose: handleClose,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 모달 카드 — 피그마(1000 x 620 · 패딩 100/80 · gap 80 · radius 12)를 0.9로 줄인 값.
          1000이 화면에서 너무 커서 여백과 이미지만 축소하고 폰트는 디자인 토큰 값 그대로 둔다.
          높이는 고정하지 않는다 — 오른쪽 컬럼 내용이 정한다.

          lg 미만에서 여백·gap을 줄이고 이미지를 숨기는 이유:
          이미지 306 + gap 64 + 오른쪽 컬럼 최소폭 224(StepIndicator w-fit) = 594,
          여기에 px-20(160)과 바깥 p-4(32)를 더하면 뷰포트 786px 미만에서 오른쪽 컬럼이
          카드 밖으로 밀린다. fixed라 가로 스크롤도 안 생겨서 [등록 시작하기]와 X 닫기에
          아예 도달할 수 없게 된다. md(768)로 잡으면 768~785 구간이 18px 모자라 lg로 둔다 */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex w-full max-w-[900px] items-stretch gap-8 rounded-xl bg-white px-8 py-16 shadow-xl lg:gap-16 lg:px-20"
      >
        {/* 왼쪽: 대표 이미지 — 피그마 340의 0.9 (내용폭 740 - gap 64 - 오른쪽 370).
            높이는 self-stretch로 오른쪽 컬럼에 맞추고, object-contain이 세로 가운데로 그린다.
            장식 이미지(alt="")라 좁은 화면에서 숨겨도 잃는 정보가 없다 */}
        <div className="hidden w-[306px] shrink-0 self-stretch overflow-hidden rounded-lg lg:block">
          <img
            src={hostRegisterIllustration}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>

        {/* 오른쪽: 닫기 + 안내 + 진행바 + 시작 버튼.
            피그마 세로 간격이 항목마다 달라(0 / 20 / 40 / auto) 부모 gap 대신 각자 margin으로 준다.
            폭은 flex-1 — 피그마도 Fill(flex: 1 0 0)이라 남는 370을 먹는다.
            높이 고정을 뺐다. 폰트를 안 줄여서 내용(약 428)이 피그마 460의 0.9(414)보다 커진다 */}
        <div className="flex flex-1 flex-col items-start">
          {/* X 닫기 (공통 X 컴포넌트 없어 LoginModal과 동일하게 raw button 사용).
              items-start를 self-end로 뒤집는다 — 피그마에서 X만 오른쪽이다 */}
          <button
            type="button"
            aria-label="닫기"
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary self-end text-xl"
          >
            <img
              src={iconClose}
              alt=""
              className="h-8 w-8"
            />
          </button>

          {/* error variant가 피그마 로고 크기(108 x 20.8)와 정확히 같다.
              이름은 오류 페이지용이지만 크기 맞는 기존 variant를 쓴다 (공통 컴포넌트 수정 회피) */}
          <Logo variant="error" />

          {/* 카피 폭이 피그마 380 = 오른쪽 컬럼 전체 폭이라 w-full로 둔다 (두 줄로 접힘) */}
          <div className="mt-5 flex w-full flex-col gap-1">
            {/* aria-labelledby로 다이얼로그 이름이 되는 제목 */}
            <h1
              id={titleId}
              className="text-text-primary text-[32px] leading-[1.4] font-bold"
            >
              호스트 등록
            </h1>
            {/* 피그마 Grey/grey-600 (#747474) = text-tertiary. secondary는 #808080이라 다른 색이다 */}
            <p className="text-text-tertiary text-xl leading-[1.4] font-medium">
              안전한 거래를 위해 호스트 등록을 마친 후 팝잇을 이용해주세요
            </p>
          </div>

          {/* 진행바 — 아직 시작 전이라 두 단계 모두 비활성(currentStep=-1).
              StepIndicator는 폭 전체를 쓰고 정렬이 내부에 하드코딩돼 있어 밖에서 못 덮는다.
              w-fit으로 폭을 내용(224px)만큼 좁히면 내부 가운데정렬이 무효가 되어 왼쪽에 붙는다 */}
          <div className="mt-10 w-fit">
            <StepIndicator
              steps={HOST_STEPS}
              currentStep={-1}
              spacing="compact"
            />
          </div>

          {/* 등록 시작하기 → step1(사업자 정보)로 이동.
              피그마 간격은 auto(바닥 붙임)지만 높이를 안 고정해서 남는 세로 공간이 없고 mt-auto가 0이 된다.
              그러면 진행바에 거의 붙어버려서 고정값 32px로 대체했다 */}
          <Button
            variant="primary"
            size="nav"
            className="mt-8"
            onClick={() => navigate("/host/host-register/step1")}
          >
            등록 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
};
