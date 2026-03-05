import { Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { AuthGate } from "./components/AuthGate";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { SendNotificationPage } from "./pages/SendNotificationPage";
import { HistoryPage } from "./pages/HistoryPage";
import { TriggersPage } from "./pages/TriggersPage";

function App() {
  return (
    <AuthGate>
      <SidebarProvider>
        <div className="h-screen bg-[#010104] flex overflow-hidden">
          <div className="hidden md:block p-4 shadow-md">
            <AppSidebar />
          </div>
          <main className="flex flex-col w-full min-w-0">
            <div className="md:p-4 px-2 shadow-md">
              <AdminHeader />
            </div>
            <div className="bg-[#13131373] grow overflow-y-auto overflow-x-hidden px-2 md:px-4">
              <div className="py-4 max-w-6xl mx-auto">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/send" element={<SendNotificationPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/triggers" element={<TriggersPage />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGate>
  );
}

export default App;
