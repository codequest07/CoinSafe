import DashHeader from "@/components/dashHeader";
import Sidebar from "@/components/sidebar";
import EmailSetupModal from "@/components/Modals/EmailSetupModal";
import { useEmailSetup } from "@/hooks/useEmailSetup";

import { Outlet } from "react-router-dom";

const Layout = () => {
  const { showEmailModal, handleEmailAdded, handleCloseModal } =
    useEmailSetup();

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

      {/* Email Setup Modal */}
      <EmailSetupModal
        isOpen={showEmailModal}
        onClose={handleCloseModal}
        onEmailAdded={handleEmailAdded}
      />
    </div>
  );
};

export default Layout;
