import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import MemoSmile from "@/icons/Smile";
import MemoSmile2 from "@/icons/Smile2";

export default function SmileFace() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center sm:space-x-3">
      {/* Button for connected wallets */}
      <div>
        <ConnectButton />
      </div>
      {/* <Button className="bg-transparent hover:bg-transparent border py-5 border-[#7F7F7F] rounded-2xl">
        Connect wallet
      </Button> */}

      {/* Icon with hover effect */}
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
    </div>
  );
}
