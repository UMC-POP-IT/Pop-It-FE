// src/app/router.tsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "@/shared/layout/MainLayout";
import { AuthLayout } from "@/shared/layout/AuthLayout";
import { ErrorPage } from "@/shared/pages/ErrorPage";
import { useAuthStore } from "@/store/authStore";

// 인증
import { LoginPage } from "@/features/auth/pages/LoginPage";

// 1번 팀원 (레아 - 공간탐색/상세/찜)
import { ExplorePage } from "@/features/guest-explore/pages/ExplorePage";
import { SpaceDetailPage } from "@/features/guest-explore/pages/SpaceDetailPage";

// 2번 팀원 (텬 - AI추천/3D/예약)
import { HomePage } from "@/features/guest-explore/pages/HomePage";
import { SpaceViewPage } from "@/features/guest-explore/pages/SpaceViewPage";
// import { RecommendPage } from "@/features/guest-recommend/pages/RecommendPage"
// import { SpaceViewPage } from "@/features/guest-recommend/pages/SpaceViewPage"
import { MyReservationPage } from "@/features/guest-explore/pages/MyReservationPage";

// 3번 팀원 (사라 - 공간등록)
import { RegisterStep1 } from "@/features/host-register/pages/RegisterStep1";
import { RegisterStep2 } from "@/features/host-register/pages/RegisterStep2";
import { RegisterStep3 } from "@/features/host-register/pages/RegisterStep3";
import { RegisterStep4 } from "@/features/host-register/pages/RegisterStep4";
import { RegisterStep5 } from "@/features/host-register/pages/RegisterStep5";
import { HostRegisterStart } from "@/features/host-register/pages/HostRegisterStart";
import { HostRegisterStep1 } from "@/features/host-register/pages/HostRegisterStep1";
import { HostRegisterStep2 } from "@/features/host-register/pages/HostRegisterStep2";
import { HostRegisterComplete } from "@/features/host-register/pages/HostRegisterComplete";

// 4번 팀원 (챈 - 내공간관리/예약관리/로그인)
import { MySpacePage } from "@/features/host-manage/pages/MySpacePage";
import { HostSpaceDetailPage } from "@/features/host-manage/pages/HostSpaceDetailPage";
import { HostReservationPage } from "@/features/host-manage/pages/HostReservationPage";
import { SpaceEditEntry } from "@/features/host-register/pages/SpaceEditEntry";

// 세션 복원이 완료될 때까지 리다이렉트를 보류해 새로고침 시 호스트 경로를 잃지 않도록 한다
const HostGuard = () => {
  const user = useAuthStore((s) => s.user);
  const isSessionReady = useAuthStore((s) => s.isSessionReady);
  if (!isSessionReady) return (
    <div className="bg-tag-bg flex h-[224px] w-full items-center justify-center rounded-xl">
      <p className="text-text-primary text-xl font-medium">불러오는 중...</p>
    </div>
  );
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export const router = createBrowserRouter([
  {
    // 라우트 트리 어디서든 로더/렌더 중 에러가 던져지면 오류 페이지로 대체
    element: <Outlet />,
    errorElement: <ErrorPage />,
    children: [
      /*
       * AuthLayout:
       * Header/Footer 없이 중앙 정렬만 하는 레이아웃
       * 로그인/회원가입 같이 헤더가 필요 없는 페이지들이 들어옴
       */
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          // { path: "/signup", element: <SignupPage /> },
        ],
      },

      /*
       * MainLayout:
       * Header + Footer가 자동으로 붙는 레이아웃
       * 서비스 내부 페이지 전부 여기 들어옴
       * 각 팀원이 페이지 완성하면 주석 해제하고 import 추가
       */
      {
        element: <MainLayout />,
        children: [
          // 홈
          { path: "/", element: <HomePage /> },

          // 1번 팀원 - 공간탐색/상세/찜
          { path: "/explore", element: <ExplorePage /> },
          { path: "/spaces/:spaceId", element: <SpaceDetailPage /> },

          // 2번 팀원 - AI추천/3D/예약
          { path: "/recommend", element: <div>AI추천 - 2번</div> },
          { path: "/reservations", element: <MyReservationPage /> },
          { path: "/spaces/:spaceId/view", element: <SpaceViewPage /> },

          // 호스트 전용 (비로그인 시 홈으로 리다이렉트)
          {
            element: <HostGuard />,
            children: [
              // 3번 팀원 - 공간등록
              { path: "/host/register", element: <RegisterStep1 /> },
              { path: "/host/register/step2", element: <RegisterStep2 /> },
              { path: "/host/register/step3", element: <RegisterStep3 /> },
              { path: "/host/register/step4", element: <RegisterStep4 /> },
              { path: "/host/register/step5", element: <RegisterStep5 /> },

              //공간수정
              { path: "/host/register/edit/:spaceId", element: <SpaceEditEntry /> },

              // 3번 팀원 - 호스트 등록 (게스트 → 호스트 전환)
              { path: "/host/host-register", element: <HostRegisterStart /> },
              { path: "/host/host-register/step1", element: <HostRegisterStep1 /> },
              { path: "/host/host-register/step2", element: <HostRegisterStep2 /> },
              {
                path: "/host/host-register/complete",
                element: <HostRegisterComplete />,
              },

              // 4번 팀원 - 내공간관리/예약관리
              { path: "/host/spaces", element: <MySpacePage /> },
              { path: "/host/spaces/:spaceId", element: <HostSpaceDetailPage /> },
              { path: "/host/reservations", element: <HostReservationPage /> },
            ],
          },
        ],
      },

      // 오류 페이지: Header/Footer 없이 단독으로 표시 (QA 확인용 고정 경로 + 존재하지 않는 경로)
      { path: "/error", element: <ErrorPage /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);
