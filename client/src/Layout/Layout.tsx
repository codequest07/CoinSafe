import DashHeader from "@/components/dashHeader";
import Sidebar from "@/components/sidebar";

import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="h-screen bg-[#010104] flex overflow-hidden">
      <div className="hidden md:block p-4 shadow-md">
        <Sidebar />
      </div>
      <main className="flex flex-col w-full min-w-0">
        <div className="md:p-4 px-2 shadow-md">
          <DashHeader />
        </div>
        <div className="bg-[#010104] flex-grow overflow-y-auto overflow-x-hidden no-scrollbar px-2 md:px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
