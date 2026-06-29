import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Outlet />
    </div>
  );
};
