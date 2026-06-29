import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
