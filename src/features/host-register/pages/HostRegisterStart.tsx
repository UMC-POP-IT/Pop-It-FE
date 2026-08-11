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
    // 카드 바깥 여백 — 모바일 16 / 태블릿 24
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 모달 카드 — 3단이 배치까지 다르다.
            모바일 : 세로 1단, 전부 가운데 정렬, 버튼은 카드 폭 전체
            태블릿 : 좌우 2단 + 버튼만 카드 바닥 전체 폭
            데스크톱: 좌우 2단 + 버튼이 오른쪽 컬럼 안에 184폭 (기존 그대로)
          폭·패딩: 모바일 max 360 / p 20 · 태블릿 854 / 60·80 · 데스크톱 900 / 64·80.
          모바일 폭은 뷰포트 360에서 바깥 p-4(16×2)를 빼 328이 되고, 392 이상에서 360으로 멈춘다.
          높이는 고정하지 않는다 — 내용이 정한다 */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex w-full max-w-[360px] flex-col rounded-xl bg-white p-5 shadow-xl md:max-w-[88%] md:px-20 md:py-[60px] lg:max-w-[900px] lg:py-16"
      >
        {/* X 닫기 — 모바일·태블릿은 카드 오른쪽 위.
            (공통 X 컴포넌트가 없어 LoginModal과 동일하게 raw button을 쓴다) */}
        <button
          type="button"
          aria-label="닫기"
          onClick={handleClose}
          className="text-text-secondary hover:text-text-primary self-end lg:hidden"
        >
          <img
            src={iconClose}
            alt=""
            className="h-8 w-8"
          />
        </button>

        {/* 2단 영역 — 모바일에서만 세로로 쌓인다. 태블릿 gap 60 / 데스크톱 64 */}
        <div className="flex flex-col items-center md:flex-row md:items-stretch md:gap-[60px] lg:gap-16">
          {/* 대표 이미지 — 모바일 200×270.588 · 태블릿 240×324.706.
              데스크톱만 높이를 self-stretch로 오른쪽 컬럼에 맞추고 폭 306을 쓴다 */}
          <div className="h-[270.588px] w-[200px] shrink-0 overflow-hidden rounded-lg md:h-[324.706px] md:w-[240px] lg:h-auto lg:w-[306px] lg:self-stretch">
            <img
              src={hostRegisterIllustration}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>

          {/* 오른쪽 컬럼 (모바일에서는 이미지 아래).
              모바일 이미지↔로고 16, md 이상은 가로 배치라 0.
              폭은 flex-1 — 피그마도 Fill(flex: 1 0 0) */}
          <div className="mt-4 flex flex-1 flex-col items-center md:mt-0 md:items-start">
            {/* 데스크톱 전용 X — 이 자리에 있어야 왼쪽 이미지가 X 높이까지 늘어난다.
                카드 레벨로 빼면 이미지 상단이 32px 내려가 기존 데스크톱 모양이 바뀐다 */}
            <button
              type="button"
              aria-label="닫기"
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary hidden self-end lg:block"
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

            {/* 로고↔제목 20 (3단 공통) · 제목↔안내문 모바일 12 / 태블릿 8 / 데스크톱 4 */}
            <div className="mt-5 flex w-full flex-col gap-3 text-center md:gap-2 md:text-left lg:gap-1">
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
                w-fit으로 폭을 내용만큼 좁히면 내부 가운데정렬이 무효가 되어 왼쪽에 붙고,
                모바일에서는 부모의 items-center가 그 덩어리를 가운데로 보낸다.
                안내문과의 간격은 컴포넌트 안 py-3(12)을 빼고 준다 (모바일 28 / 태블릿 40) */}
            <div className="mt-4 w-fit md:mt-7 lg:mt-10">
              <StepIndicator
                steps={HOST_STEPS}
                currentStep={-1}
                spacing="compact"
              />
            </div>

            {/* 데스크톱 전용 버튼 — 오른쪽 컬럼 안, 184폭 (기존 그대로).
                Button 자체가 display:flex라 여기서 hidden을 주면 충돌한다. div로 감싸 껐다 켠다 */}
            <div className="mt-8 hidden lg:block">
              <Button
                variant="primary"
                size="nav"
                onClick={() => navigate("/host/host-register/step1")}
              >
                등록 시작하기
              </Button>
            </div>
          </div>
        </div>

        {/* 모바일·태블릿 전용 버튼 — 카드 폭 전체, 높이 56.
            2단 영역 바깥이라 태블릿에서 이미지·오른쪽 컬럼 아래를 가로질러 깔린다.
            w-full!의 !는 size="nav"가 가진 w-[156px]/md:w-[184px]를 이기기 위한 것 */}
        <div className="mt-7 w-full md:mt-10 lg:hidden">
          <Button
            variant="primary"
            size="nav"
            className="w-full!"
            onClick={() => navigate("/host/host-register/step1")}
          >
            등록 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
};
