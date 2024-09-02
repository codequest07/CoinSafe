import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader } from "./ui/card";
import { NavLinks } from "@/lib/data";
import MemoLogo from "@/icons/Logo";
import MemoTrustWallet from "@/icons/TrustWallet";
import MemoSmile from "@/icons/Smile";
import MemoChrome from "@/icons/Chrome";

const DashHeader = () => {
  return (
    <main>
      <header className="flex justify-end h-14 items-center gap-4 border-b dark:border-b-[#000000] dark:bg-[#000000] lg:h-[80px]">
        <Sheet>
          <SheetContent side="left" className="flex flex-col bg-[#13131373]">
            <nav className="grid gap-2 text-lg font-medium">
              <Link to="/" className="flex items-center gap-2 font-semibold">
                <MemoLogo className="w-32 h-32" />
              </Link>

              {NavLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 my-3  text-[#FFFFFF] bg-[#FFFBF833]   transition-all hover:text-primary"
                      : "flex items-center gap-3 font-[400] rounded-lg  px-3 py-2  text-[#FFFFFF]  transition-all hover:text-primary"
                  }>
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto">
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
          </SheetContent>
          <SheetTrigger asChild className="mx-3">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0   md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <div className="w-full">
            <div className="flex items-center justify-between  bg-[#0B0B0B] text-white p-4 ">
              <div className="sm:flex flex-col hidden items-center">
                {/* Username and days badge */}
                <div className="flex  items-center">
                  <span className="text-sm text-gray-400">u/jumpingjack</span>
                  <span className="text-xs bg-[#2A2A2A] text-orange-500 py-1 px-2 rounded-full">
                    1000 days 🔥
                  </span>
                </div>
                {/* Message */}
                <div className="ml-4 text-sm">
                  <span>Why haven't you saved today? Ehn fine girl?</span>
                </div>
              </div>

              <div className="flex items-center sm:space-x-3">
                {/* Icons for connected wallets */}

                <Button className="bg-transparent hover:bg-transparent border py-5 border-[#7F7F7F] rounded-2xl">
                  connected wallets <MemoTrustWallet className="w-8 h-8" />
                </Button>
                <MemoSmile className="w-12 h-12" />
              </div>
            </div>
          </div>
        </Sheet>
      </header>
    </main>
  );
};

export default DashHeader;
