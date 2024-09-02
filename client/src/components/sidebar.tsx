import { Link, NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader } from "./ui/card";
import MemoLogo from "@/icons/Logo";
import { NavLinks } from "@/lib/data";
import MemoChrome from "@/icons/Chrome";

const Sidebar = () => {
  return (
    <main>
      <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        <div className="hidden border-r p-2 border-[#13131373]  bg-[#13131373]  md:block">
          <div className="flex h-full max-h-screen shadow-lg  rounded-xl  flex-col gap-2">
            <div className="flex items-center py-12 px-4 lg:h-[60px] lg:px-6">
              <Link to="/" className="flex items-center gap-2 font-semibold">
                <MemoLogo className="w-40 h-40" />
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
                        ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-3 my-3  text-[#F1F1F1]  bg-[#1E1E1E99]   transition-all "
                        : "flex items-center gap-3 font-[400] rounded-lg  px-3 py-3  text-[#B5B5B5]   transition-all "
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
                className="flex flex-col items-center justify-center bg-[#092324] text-white p-1 rounded-lg shadow-lg">
                <CardHeader className="flex items-center justify-center">
                  <MemoChrome className="w-20 h-20" />
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
