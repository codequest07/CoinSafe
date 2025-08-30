"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
// import { Coins, ExternalLinkIcon, Menu } from "lucide-react";
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
import { ChevronDown, Coins, Menu, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

const currencies = [
  { code: "USDT", name: "Lisk", rate: 400.56 },
  { code: "USDC", name: "Bitcoin", rate: 45000 },
  // { code: "ETH", name: "Ethereum", rate: 2800 },
  // { code: "ADA", name: "Cardano", rate: 0.45 },
];

const DashHeader = () => {
  const location = useLocation();
  const params = useParams();
  const [randomMessage, setRandomMessage] = useState("");
  const account = useActiveAccount();
  const address = account?.address;

  const [amount, setAmount] = useState<string>("0.00");
  const [selectedCurrency, setSelectedCurrency] = useState("LSK");
  const [, setUsdValue] = useState<number>(0);
  const [openOnRampModal, setOpenOnRampModal] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  /**
   * Calculates USD equivalent when amount or currency changes
   * This function runs automatically whenever amount or selectedCurrency state changes
   * It finds the exchange rate for the selected currency and multiplies by the amount
   */
  useEffect(() => {
    console.log("[v0] calculateUsdValue: Calculating USD equivalent");
    const numericAmount = Number.parseFloat(amount) || 0;
    const currency = currencies.find((c) => c.code === selectedCurrency);
    const calculatedUsd = numericAmount * (currency?.rate || 0);
    setUsdValue(calculatedUsd);
    console.log(
      `[v0] calculateUsdValue: ${numericAmount} ${selectedCurrency} = ${calculatedUsd} USD`
    );
  }, [amount, selectedCurrency]);

  /**
   * Handles input changes for the amount field
   * Validates input to only allow numbers and decimal points
   * Updates the amount state which triggers USD recalculation
   */
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] handleAmountChange: Processing amount input change");
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      console.log(`[v0] handleAmountChange: Amount updated to ${value}`);
    } else {
      console.log("[v0] handleAmountChange: Invalid input rejected");
    }
  };

  /**
   * Handles currency selection from dropdown
   * Updates the selected currency which triggers USD recalculation
   */
  const handleCurrencySelect = (currencyCode: string) => {
    console.log(
      `[v0] handleCurrencySelect: Changing currency to ${currencyCode}`
    );
    setSelectedCurrency(currencyCode);
    const selectedCurrencyData = currencies.find(
      (c) => c.code === currencyCode
    );
    console.log(
      `[v0] handleCurrencySelect: New rate is ${selectedCurrencyData?.rate} USD per ${currencyCode}`
    );
  };

  /**
   * Clears the input field by resetting amount to "0.00"
   * This also triggers USD recalculation to show $0.00
   */
  const handleClear = () => {
    console.log("[v0] handleClear: Clearing input field");
    setAmount("0.00");
    console.log("[v0] handleClear: Amount reset to 0.00");
  };

  /**
   * Formats a number as USD currency
   * Uses Intl.NumberFormat for proper currency formatting
   */
  // const formatUsdValue = (value: number) => {
  //   console.log(`[v0] formatUsdValue: Formatting ${value} as USD currency`);
  //   return new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: "USD",
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   }).format(value);
  // };

  const [token, setToken] = useState("");

  useEffect(() => {
    fetch("https://coinsafe-0q0m.onrender.com/api/fonbnk/generate-signature")
      .then((res) => res.json())
      .then((data) => setToken(data?.data?.signature))
      .catch((err) => console.error("Error fetching token:", err));
  }, []);

  // Get streak information
  const { getStreakInfo } = useStreakSystem();
  const currentStreak = useRecoilValue(userCurrentStreakState);

  // Format streak with fire emoji
  const formattedStreak = `${
    currentStreak > 0 ? currentStreak.toString() : "0"
  } days 🔥`;

  // Check if we're on a vault detail page
  const isVaultDetailPage = location.pathname.includes("/vault/") && params.id;

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
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>

            {/* Mobile Navigation Sidebar */}
            <SheetContent
              side="right"
              className="flex flex-col bg-[#13131373] border-r border-r-[#333333]"
            >
              <nav className="grid gap-2 text-lg font-medium">
                <Link to="/" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-2 font-semibold">
                  <MemoLogo className="w-32 h-10" />
                </Link>

                {NavLinks.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    onClick={() => setIsSheetOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 my-3 text-[#FFFFFF] bg-[#FFFBF833] transition-all hover:text-primary"
                        : "flex items-center gap-3 font-[400] rounded-lg px-3 py-2 text-[#FFFFFF] transition-all hover:text-primary"
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <div
                  // to={`https://pay.fonbnk.com/?source=o9VjcneL&signature=${token}`}
                  // target="_blank"
                  onClick={() => setOpenOnRampModal(true)}
                  className={
                    "flex items-center cursor-pointer gap-3 font-[400] rounded-lg px-3 py-3 my-1.5 text-[#B5B5B5] transition-all"
                  }
                >
                  <>
                    <Coins className="w-5 h-5" />
                    {"On-ramp"}
                    {/* <span><ExternalLinkIcon className="w-5 h-5" /></span> */}
                  </>
                </div>
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

      {openOnRampModal && (
        <Dialog open={openOnRampModal} onOpenChange={setOpenOnRampModal}>
          <DialogContent className="max-w-[390px] sm:max-w-[400px] border-[1px] border-[#FFFFFF3D] rounded-lg text-white bg-[#17171C] p-4 absolute left-1/2 top-[30%]">
            <DialogHeader>
              <DialogTitle className="py-4">On-ramp Details</DialogTitle>
            </DialogHeader>
            <div className="w-full max-w-sm">
              <label
                htmlFor=""
                className="text-[#CACACA] font-light text-[14px]"
              >
                Amount to On-ramp
              </label>
              <div className="flex items-center justify-between bg-transaprarent rounded-lg p-4 border-[1px] border-[#FFFFFF3D]">
                <div className="flex-1">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="text-2xl font-medium bg-transparent border-none outline-none w-full"
                    placeholder="0.00"
                  />
                  {/* <div className="text-sm text-gray-500 mt-1">
                    ≈ {formatUsdValue(usdValue)}
                  </div> */}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        className="flex items-center gap-2 border-[1px] border-[#FFFFFF21] bg-gray-600 text-[#F1F1F1] hover:bg-gray-700 p-2 text-[14px] rounded-md"
                      >
                        {selectedCurrency}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-32 bg-gray-600 text-white"
                    >
                      {currencies.map((currency) => (
                        <DropdownMenuItem
                          key={currency.code}
                          onClick={() => handleCurrencySelect(currency.code)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{currency.code}</span>
                            {/* <span className="text-xs text-gray-500">{currency.name}</span> */}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="py-4 flex justify-end">
                <Link
                  to={
                    !amount
                      ? "#"
                      : `https://pay.fonbnk.com/auth?source=o9VjcneL&network=LISK&asset=${selectedCurrency}&amount=${amount}&currency=crypto&paymentChannel=bank&countryIsoCode=NG&address=${account?.address}&signature=${token}`
                  }
                  target="_blank"
                >
                  <Button className="bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] rounded-[100px] border-[1px] border-[#FFFFFF05] text-[#010104] text-[14px]">
                    Proceed to On-ramp
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
};

export default DashHeader;
