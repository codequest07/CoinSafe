import { Link, NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader } from "./ui/card";
import MemoLogo from "@/icons/Logo";
import { NavLinks } from "@/lib/data";
import MemoChrome from "@/icons/Chrome";
import MemoBeta from "@/icons/Beta";

const Sidebar = () => {
  return (
    <main>
      <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        <div className="hidden border-r  bg-[#010104]  md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex items-center py-12 px-4 lg:h-[60px] lg:px-6">
              <Link to="/" className="flex items-center gap-2 font-semibold">
                <MemoLogo className="w-32 h-32" />
                <MemoBeta className="w-10 h-10" />
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {NavLinks.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 my-3  text-[#FFFFFF] dark:text-[#8B6EE1] bg-[#FFFBF833]   transition-all hover:text-primary"
                        : "flex items-center gap-3 font-[400] rounded-lg  px-3 py-2  text-[#FFFFFF] dark:text-[#8B6EE1]  transition-all hover:text-primary"
                    }>
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mt-auto p-4">
              <Card
                x-chunk="dashboard-02-chunk-0"
                className="flex flex-col items-center justify-center bg-[#092324] text-white p-6 rounded-lg shadow-lg max-w-xs">
                <CardHeader className="flex items-center justify-center">
                  <div className="relative bg-[#00BCD4] rounded-full p-3 mb-4">
                    <MemoChrome className="w-12 h-12" />
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                  <div className="text-center mb-4">
                    <p className="text-lg font-semibold">Save automatically</p>
                    <p className="text-sm">
                      Start saving automatically with our all new crowe wallet
                      extension
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <button className="bg-white text-black font-semibold py-2 px-6 rounded-full">
                      Download
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Sidebar;
