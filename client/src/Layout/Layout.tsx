import DashHeader from "@/components/dashHeader";
import Sidebar from "@/components/sidebar";

import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="h-screen bg-[#010104] flex">
      <div className="p-4 shadow-md ">
        <Sidebar />
      </div>
      <main className="flex flex-col w-full">
        <div className="p-4 shadow-md ">
          <DashHeader />
        </div>
        <div className="bg-[#010104] flex-grow  overflow-y-auto overflow-x-hidden no-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
