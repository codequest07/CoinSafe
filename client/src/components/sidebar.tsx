import { Link, NavLink, useLocation } from "react-router-dom";
import MemoLogo from "@/icons/Logo";
import { NavLinks } from "@/lib/data";
import ExtensionCard from "./Cards/ExtensionCard";
import { useEffect, useState } from "react";
import ConnectModal from "./Modals/ConnectModal";
import { useActiveAccount } from "thirdweb/react";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "./ui/dialog";
// import AmountInput from "./AmountInput";
// import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
// import { useRecoilState } from "recoil";
// import { supportedTokensState } from "@/store/atoms/balance";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, Coins, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { Coins, ExternalLinkIcon } from "lucide-react";

const currencies = [
  { code: "USDT", name: "Lisk", rate: 400.56 },
  { code: "USDC", name: "Bitcoin", rate: 45000 },
  // { code: "ETH", name: "Ethereum", rate: 2800 },
  // { code: "ADA", name: "Cardano", rate: 0.45 },
];

const Sidebar = () => {
  const [openConnectModal, setOpenConnectModal] = useState(false);
  const location = useLocation();

  const [amount, setAmount] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");
  const [, setUsdValue] = useState<number>(0);
  const [openOnRampModal, setOpenOnRampModal] = useState(false);

  // const navigate = useNavigate()

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

  const account = useActiveAccount();
  const isConnected = !!account?.address;

  const [token, setToken] = useState("");

  useEffect(() => {
    fetch("https://coinsafe-0q0m.onrender.com/api/fonbnk/generate-signature")
      .then((res) => res.json())
      .then((data) => setToken(data?.data?.signature))
      .catch((err) => console.error("Error fetching token:", err));
  }, []);

  //   const token = jsonwebtoken.sign(
  //     {
  //       uid: uuid(),
  //     },
  //     FONBNK_SIGNATURE,
  //     {
  //       algorithm: 'HS256',
  //     },
  //  );

  const handleNavigate = (e: any) => {
    if (!isConnected) {
      e.preventDefault();
      setOpenConnectModal(true);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      setOpenConnectModal(true);
    } else {
      setOpenConnectModal(false);
    }
  }, [isConnected]);

  // Custom function to determine if a link should be active
  const isLinkActive = (path: string) => {
    const currentPath = location.pathname;

    // Exact match for dashboard
    if (path === "/") {
      return currentPath === "/";
    }

    // For other routes, check if the current path starts with the link path
    // but is not just the dashboard path
    return currentPath.startsWith(path) && path !== "/";
  };

  return (
    <main>
      <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden rounded-2xl border-r p-2 border-[#13131373] bg-[#13131373] md:flex flex-col">
          <div className="flex h-full max-h-fit shadow-lg rounded-xl flex-col gap-2">
            <div className="flex items-center py-12 px-4 lg:h-[60px] lg:px-6">
              <Link
                to="/"
                className="flex items-center gap-2 font-semibold"
              >
                <MemoLogo className="w-40 h-40" />
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {NavLinks.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    onClick={handleNavigate}
                    className={() =>
                      isLinkActive(link.to)
                        ? "flex items-center gap-3 font-[400] rounded-lg px-3 py-3 my-1.5 text-[#F1F1F1] bg-[#1E1E1E99] transition-all"
                        : "flex items-center gap-3 font-[400] rounded-lg px-3 py-3 my-1.5 text-[#B5B5B5] transition-all"
                    }
                  >
                    <>
                      {isLinkActive(link.to) ? (
                        <link.activeIcon className="w-5 h-5" />
                      ) : (
                        <link.icon className="w-5 h-5" />
                      )}
                      {link.label}
                    </>
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
            </div>
          </div>
          <div className="mt-auto p-4">
            <ExtensionCard />
          </div>
        </div>
      </div>
      {openConnectModal && (
        <ConnectModal
          isConnectModalOpen={openConnectModal}
          setIsConnectModalOpen={setOpenConnectModal}
        />
      )}

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

export default Sidebar;
