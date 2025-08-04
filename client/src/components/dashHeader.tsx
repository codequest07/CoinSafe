"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Coins, ExternalLinkIcon, Menu } from "lucide-react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { NavLinks } from "@/lib/data";
import MemoLogo from "@/icons/Logo";
import SmileFace from "./Smile";
import ExtensionCard from "./Cards/ExtensionCard";
// import ClaimBtn from "./ClaimBtn";
import { useGetSafeById } from "@/hooks/useGetSafeById";
import { Skeleton } from "./ui/skeleton";
import { useStreakSystem } from "@/hooks/useStreakSystem";
import { useRecoilValue } from "recoil";
import { userCurrentStreakState } from "@/store/atoms/streak";
import { useActiveAccount } from "thirdweb/react";
import WalletAvatar from "./WalletAvatar";

const getRandomMessage = () => {
  const messages = [
    "Why haven't you saved today? Don't miss out!",
    "Saving is the key to greatness! Start now.",
    "Don't let today pass without saving!",
    "Secure your future, one save at a time.",
    "What are you waiting for? Save something!",
    "Every little bit counts. Start saving today!",
    "Take a step toward your goals—save today!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const DashHeader = () => {
  const location = useLocation();
  const params = useParams();
  const [randomMessage, setRandomMessage] = useState("");
  const account = useActiveAccount();
  const address = account?.address;

  const [token, setToken] = useState('');

  useEffect(() => {
    fetch('https://coinsafe-0q0m.onrender.com/api/fonbnk/generate-signature')
      .then((res) => res.json())
      .then((data) => setToken(data?.data?.signature))
      .catch((err) => console.error('Error fetching token:', err));
  }, []);

  // Get streak information
  const { getStreakInfo } = useStreakSystem();
  const currentStreak = useRecoilValue(userCurrentStreakState);

  // Format streak with fire emoji
  const formattedStreak = `${
    currentStreak > 0 ? currentStreak.toString() : "0"
  } days 🔥`;

  // Check if we're on a vault detail page
  const isVaultDetailPage =
    location.pathname.includes("/dashboard/vault/") && params.id;

  // Get safe details if we're on a vault detail page
  const { safeDetails, isLoading } = useGetSafeById(
    isVaultDetailPage ? params.id : undefined
  );

  // Get current route name - only the last segment
  const getCurrentRouteName = () => {
    const path = location.pathname;

    // Return Dashboard for root path
    if (path === "/") return "Dashboard";

    // If we're on a vault detail page and have safe details, show "Vault / Safe Name"
    if (isVaultDetailPage) {
      if (isLoading) {
        return "Vault / Loading...";
      }
      if (safeDetails?.target) {
        return `Vault / ${safeDetails.target}`;
      }
      return "Vault / Details";
    }

    // Split the path by '/' and get the last non-empty segment
    const segments = path.split("/").filter((segment) => segment !== "");
    const lastSegment = segments[segments.length - 1];

    // Capitalize the first letter
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  // This effect runs only once when the component mounts
  useEffect(() => {
    // Generate a new random message when the component mounts
    setRandomMessage(getRandomMessage());
  }, []); // Empty dependency array means this runs only once on mount

  // Separate effect for fetching streak data that runs when address changes
  useEffect(() => {
    // Fetch streak info if address is available
    if (address) {
      getStreakInfo(address).catch((err) => {
        console.error("[DashHeader] Error fetching streak info:", err);
      });
    }
    // We intentionally omit getStreakInfo from dependencies to prevent
    // constant re-renders and message changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <main>
      <header className="flex items-center h-14 shadow-xl border-b border-b-[#000000] lg:h-[70px] w-full bg-black text-white">
        {/* Mobile View */}
        <div className="w-full flex items-center justify-between md:hidden px-2">
          {/* Logo for mobile */}
          <Link to="/" className="flex items-center">
            <MemoLogo className="w-20 h-6" />
            <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded ml-1">
              Beta
            </span>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            {/* <ClaimBtn /> */}
            <WalletAvatar />
          </div>

          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>

            {/* Mobile Navigation Sidebar */}
            <SheetContent
              side="right"
              className="flex flex-col bg-[#13131373] border-r border-r-[#333333]">
              <nav className="grid gap-2 text-lg font-medium">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                  <MemoLogo className="w-32 h-10" />
                </Link>

                {NavLinks.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 my-3 text-[#FFFFFF] bg-[#FFFBF833] transition-all hover:text-primary"
                        : "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 text-[#FFFFFF] transition-all hover:text-primary"
                    }>
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  <NavLink
                    to={`https://sandbox-pay.fonbnk.com/?source=D4p5B3HY&signature=${token}`}
                    target="_blank"
                    className={
"flex items-center gap-3 font-[400] rounded-lg px-3 py-3 my-1.5 text-[#B5B5B5] transition-all"
                    }>
                    <>
                      <Coins className="w-5 h-5" />
                      {"On-ramp"}
                      <span><ExternalLinkIcon className="w-5 h-5" /></span>
                    </>
                  </NavLink>
              </nav>
              <div className="mt-auto">
                <ExtensionCard />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop View */}
        <div className="w-full hidden md:block rounded-0 md:p-3 ">
          <div className="flex items-start justify-between text-white p-1">
            <div className="sm:flex flex-col space-y-2 hidden items-start">
              {/* Current Route Name and Badge */}
              <div className="flex space-x-2 items-center">
                {isVaultDetailPage && isLoading ? (
                  <Skeleton className="h-5 w-32" />
                ) : (
                  <span className="text-sm text-[#F1F1F1]">
                    {getCurrentRouteName()}
                  </span>
                )}
                <span className="text-xs bg-[#F3B42324] text-[#F1F1F1] py-1 px-2 rounded-full">
                  {formattedStreak}
                </span>
              </div>
              {/* Message */}
              <div className="ml-0 text-sm">
                <span>{randomMessage}</span>
              </div>
            </div>
            <div className="flex items-center sm:space-x-3">
              {/* <ClaimBtn /> */}
              {/* Icons for connected wallets */}
              <SmileFace />
            </div>
          </div>
        </div>
      </header>
    </main>
  );
};

export default DashHeader;
