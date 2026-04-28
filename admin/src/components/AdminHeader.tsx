import { SidebarTrigger } from "./ui/sidebar";

export function AdminHeader() {
  return (
    <header className="flex items-center h-14 shadow-xl border-b border-b-[#000000] lg:h-[70px] w-full bg-black text-white px-4 md:px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <span className="text-sm md:text-base font-semibold tracking-tight">
            Notification Console
          </span>
        </div>
        <SidebarTrigger className="ml-2" />
      </div>
    </header>
  );
}
