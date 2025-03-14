import { useState } from "react";
import MemoSmile from "@/icons/Smile";
import MemoSmile2 from "@/icons/Smile2";
import MemoAngry2 from "@/icons/Angry2";
import MemoAngry from "@/icons/Angry";
import { useActiveAccount } from "thirdweb/react";
import ThirdwebConnectButton from "./ThirdwebConnectButton";

export default function SmileFace() {
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center sm:space-x-3">
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
          onMouseLeave={() => setIsHovered(false)}
        >
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
          onMouseLeave={() => setIsHovered(false)}
        >
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
