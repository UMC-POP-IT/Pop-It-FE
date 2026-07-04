import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { LoginModal } from "@/shared/components/LoginModal";
import Banner from "./Banner";

export const MainLayout = () => (
  <div className="bg-bg flex min-h-screen flex-col">
    <Header />
    <Banner />
    <main className="mx-auto w-full max-w-screen-xl flex-1 px-6 py-8">
      <Outlet />
    </main>
    <Footer />
    <LoginModal />
  </div>
);
