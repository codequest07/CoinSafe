"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
// import { Coins, ExternalLinkIcon, Menu } from "lucide-react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { MobileNavLinks } from "@/lib/data";
import MemoLogo from "@/icons/Logo";
import SmileFace from "./Smile";
import ExtensionCard from "./Cards/ExtensionCard";
// import ClaimBtn from "./ClaimBtn";
import { useGetSafeById } from "@/hooks/useGetSafeById";
import { Skeleton } from "./ui/skeleton";
import { useStreakSystem } from "@/hooks/useStreakSystem";
import { useRecoilValue } from "recoil";
import { userCurrentStreakState } from "@/store/atoms/streak";
import {
  useActiveAccount,
  useConnectModal,
  useSwitchActiveWalletChain,
  useActiveWalletChain,
} from "thirdweb/react";
import WalletAvatar from "./WalletAvatar";
import { ChevronDown, Coins, Menu, Network } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { client, liskMainnet, base } from "@/lib/config";
import { darkTheme } from "thirdweb/react";
import { wallets } from "@/lib/wallets";

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


const chains = [liskMainnet, base];

const DashHeader = () => {
  const location = useLocation();
  const params = useParams();
  const [randomMessage, setRandomMessage] = useState("");
  const account = useActiveAccount();
  const address = account?.address;
  const isConnected = !!account?.address;

  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();

  const [isSheetOpen, setIsSheetOpen] = useState(false);


  // Get streak information
  const { getStreakInfo } = useStreakSystem();
  const currentStreak = useRecoilValue(userCurrentStreakState);

  // Format streak with fire emoji
  const formattedStreak = `${currentStreak > 0 ? currentStreak.toString() : "0"
    } days 🔥`;

  // Check if we're on a vault detail page
  const isVaultDetailPage = location.pathname.includes("/vault/") && params.id;

  // Get safe details if we're on a vault detail page
  const { safeDetails, isLoading } = useGetSafeById(
    isVaultDetailPage ? params.id : undefined,
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

  const { connect, isConnecting } = useConnectModal();
  const [localIsConnecting, setLocalIsConnecting] = useState(false);

  // Use active chain if connected, otherwise default to Lisk
  const chainToUse = activeChain || liskMainnet;

  const handleConnect = async () => {
    try {
      setLocalIsConnecting(true);
      await connect({
        client,
        wallets,
        chain: chainToUse,
        theme: darkTheme({
          colors: { accentText: "hsl(144, 100%, 39%)" },
        }),
        size: "compact",
      });
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setLocalIsConnecting(false);
    }
  };

  const handleSwitchChain = async (chainId: number) => {
    try {
      const chainToSwitch = chains.find((c) => c.id === chainId);
      if (chainToSwitch) {
        await switchChain(chainToSwitch);
      }
    } catch (error) {
      console.error("Failed to switch chain:", error);
    }
  };

  // Reset localIsConnecting when connection is successful
  useEffect(() => {
    if (isConnected && localIsConnecting) {
      setLocalIsConnecting(false);
    }
  }, [isConnected, localIsConnecting]);

  return (
    <main>
      <header className="flex items-center h-14 shadow-xl border-b border-b-[#000000] lg:h-[70px] w-full bg-black text-white">
        {/* Mobile View */}
        <div className="w-full flex items-center justify-between md:hidden px-2">
          {/* Logo for mobile */}
          <Link to="/" className="flex items-center">
            <MemoLogo className="w-20 h-6" />
          </Link>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 md:hidden">
              {/* <ClaimBtn /> */}
              <WalletAvatar />
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="flex flex-col bg-[#010104] border-[#010104] w-full max-w-none">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    to="/"
                    onClick={() => setIsSheetOpen(false)}
                    className="flex items-center gap-2 font-semibold">
                    <MemoLogo className="w-32 h-10" />
                  </Link>

                  {/* Chain Switcher for Mobile */}
                  {isConnected && (
                    <div className="my-2 px-2">
                      <p className="text-sm text-gray-500 mb-2">Network</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between bg-[#FFFBF833] border-none text-white hover:bg-[#FFFBF855] hover:text-white">
                            <span className="flex items-center gap-2">
                              <Network className="h-4 w-4" />
                              {activeChain?.name || "Select Network"}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full bg-[#1A1A1E] border-[#333] text-white">
                          {chains.map((c) => (
                            <DropdownMenuItem
                              key={c.id}
                              onClick={() => {
                                handleSwitchChain(c.id);
                                setIsSheetOpen(false);
                              }}
                              className="cursor-pointer hover:bg-[#333] focus:bg-[#333] text-white">
                              {c.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  {MobileNavLinks.map((link) => (
                    <NavLink
                      key={link.label}
                      to={link.to}
                      onClick={() => setIsSheetOpen(false)}
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
                    to="/onramp"
                    onClick={() => setIsSheetOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 my-3 text-[#FFFFFF] bg-[#FFFBF833] transition-all hover:text-primary"
                        : "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 text-[#FFFFFF] transition-all hover:text-primary"
                    }
                  >
                    <Coins className="w-5 h-5" />
                    On-ramp
                  </NavLink>
                </nav>
                {/* <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
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
              </nav> */}

                {/* Connect Wallet Button - Only show when not connected */}
                {!isConnected && (
                  <div className="px-2 py-4">
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting || localIsConnecting}
                      className="w-full bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5]/80 text-[#010104] font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                      {isConnecting || localIsConnecting
                        ? "Connecting..."
                        : "Connect Wallet"}
                    </Button>
                  </div>
                )}

                <div className="mt-auto hidden">
                  <ExtensionCard />
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
              {/* Icons for connected wallets (includes chain switcher when connected) */}
              <SmileFace />
            </div>
          </div>
        </div>
      </header>
    </main>
  );
};

export default DashHeader;
