import { NavLink } from "react-router-dom";
import { Bell, History, PlayCircle, Shield } from "lucide-react";
import MemoLogo from "../../../client/src/icons/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "./ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar className="md:w-[250px] lg:w-[250px] bg-[#010104]">
      <div className="flex h-full min-h-screen shadow-lg rounded-xl flex-col gap-2 ">
        <SidebarHeader className="flex items-center py-12 px-4 lg:h-[60px] lg:px-6">
          <MemoLogo className="w-40 h-40" />
        </SidebarHeader>
        <SidebarContent >
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <SidebarLink to="/dashboard" icon={Shield} label="Dashboard" />
              <SidebarLink to="/send" icon={Bell} label="Send" />
              <SidebarLink to="/history" icon={History} label="History" />
              <SidebarLink to="/triggers" icon={PlayCircle} label="Triggers" />
            </nav>
          </div>
        </SidebarContent>
        <SidebarFooter className="mt-auto p-4 text-xs text-slate-500">
          For internal admin use only.
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function SidebarLink({ to, icon: Icon, label }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? "flex items-center gap-3 font-normal rounded-lg px-3 py-3 my-1.5 text-[#F1F1F1] bg-[#1E1E1E99] transition-all"
          : "flex items-center gap-3 font-normal rounded-lg px-3 py-3 my-1.5 text-[#B5B5B5] transition-all"
      }>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
}
