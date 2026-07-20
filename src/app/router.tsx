// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/shared/layout/MainLayout";
import { AuthLayout } from "@/shared/layout/AuthLayout";

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
import { HostReservationPage } from "@/features/host-manage/pages/HostReservationPage";

export const router = createBrowserRouter([
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

      // 3번 팀원 - 공간등록
      { path: "/host/register", element: <RegisterStep1 /> },
      { path: "/host/register/step2", element: <RegisterStep2 /> },
      { path: "/host/register/step3", element: <RegisterStep3 /> },
      { path: "/host/register/step4", element: <RegisterStep4 /> },
      { path: "/host/register/step5", element: <RegisterStep5 /> },

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
      { path: "/host/reservations", element: <HostReservationPage /> },
    ],
  },
]);
