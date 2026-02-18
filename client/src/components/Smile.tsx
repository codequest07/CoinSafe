import { useState } from "react";
import MemoSmile from "@/icons/Smile";
import MemoSmile2 from "@/icons/Smile2";
import MemoAngry2 from "@/icons/Angry2";
import MemoAngry from "@/icons/Angry";
import {
  useActiveAccount,
  useSwitchActiveWalletChain,
  useActiveWalletChain,
} from "thirdweb/react";
import ThirdwebConnectButton from "./ThirdwebConnectButton";
import { Link } from "react-router-dom";
import MemoUser from "@/icons/User";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { liskMainnet as lisk, base } from "@/lib/config";

const chains = [lisk, base];

const chainLogo: Record<number, string> = {
  [lisk.id]: "/assets/lisk.png",
  [base.id]: "/assets/base.png",
};

const chainDisplayName: Record<number, string> = {
  [lisk.id]: "Lisk",
  [base.id]: "Base",
};

export default function SmileFace() {
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const [isHovered, setIsHovered] = useState(false);
  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  const handleSwitchChain = async (chainId: number) => {
    setIsSwitchingChain(true);
    try {
      const chainToSwitch = chains.find((c) => c.id === chainId);
      if (chainToSwitch) {
        await switchChain(chainToSwitch);
      }
    } catch (error) {
      console.error("Failed to switch chain:", error);
    } finally {
      setIsSwitchingChain(false);
    }
  };

  return (
    <div className="flex items-center sm:space-x-3">
      <div className="flex items-center space-x-2 justify-center mt-2">
        <Link to={"/profile"}>
          <button className="cursor-pointer">
            <MemoUser className="w-12 h-12" />
            {/* <img src="/assets/profile-icon.svg" alt="" /> */}
          </button>
        </Link>
      </div>
      {/* Chain Switcher (when connected) */}
      {isConnected && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-[#272727B2] border-none text-white py-6 hover:bg-[#272727B2] rounded-[100px] hover:text-white mr-2"
              disabled={isSwitchingChain}>
              <span className="flex items-center gap-2">
                {activeChain?.id != null && chainLogo[activeChain.id] ? (
                  <div className="w-6 h-6 rounded-full object-contain bg-white p-1">
                    <img
                      src={chainLogo[activeChain.id]}
                      alt=""
                      className="h-4 w-4 rounded-full object-contain"
                    />
                  </div>
                ) : null}
                {isSwitchingChain
                  ? "Switching..."
                  : (activeChain?.id != null && chainDisplayName[activeChain.id]) || activeChain?.name || "Network"}
              </span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1A1A1E] border-[#333] text-white">
            {chains.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => handleSwitchChain(c.id)}
                className="cursor-pointer hover:bg-[#333] focus:bg-[#333] text-white">
                {chainDisplayName[c.id] ?? c.name}
                {activeChain?.id === c.id && " ✓"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Button for connected wallets */}
      <div>
        <ThirdwebConnectButton />
      </div>
      {/* <Button className="bg-transparent hover:bg-transparent border py-5 border-[#7F7F7F] rounded-2xl">
        Connect wallet
      </Button> */}

      {/* Icon with hover effect */}
      {isConnected ? (
        <div
          className={`cursor-pointer rounded-full  transition-all duration-1000 ease-in-out ${
            isHovered ? "shadow-lg shadow-[#7AE7BA]" : "shadow-none"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          {isHovered ? (
            <MemoSmile2 className="w-12 h-12 transition-all duration-1000" />
          ) : (
            <MemoSmile className="w-12 h-12 transition-all duration-1000" />
          )}
        </div>
      ) : (
        <div
          className={`cursor-pointer rounded-full  transition-all duration-1000 ease-in-out ${
            isHovered ? "shadow-lg shadow-[#FF484B85]" : "shadow-none"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          {isHovered ? (
            <MemoAngry2 className="w-12 h-12 transition-all duration-1000" />
          ) : (
            <MemoAngry className="w-12 h-12 transition-all duration-1000" />
          )}
        </div>
      )}
    </div>
  );
}
