import DashHeader from "@/components/dashHeader";
import Sidebar from "@/components/sidebar";

import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <main className="flex flex-col w-full">
        <DashHeader />
        <div className="bg-[#F7F7F7] flex-grow  overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
