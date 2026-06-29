import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/shared/layout/MainLayout";
import { AuthLayout } from "@/shared/layout/AuthLayout";
import { HomePage } from "@/features/guest-explore/pages/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
    ],
  },
]);
