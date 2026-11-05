import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import MobileNav from "./MobileNav.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0c0d0e]">
      <Sidebar />
      <MobileNav />
      <main className="md:ml-64 px-5 md:px-10 xl:px-14 py-7 md:py-10 pb-24 md:pb-10 max-w-[1440px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
