import {
  useActiveWalletConnectionStatus,
  useConnectModal,
} from "thirdweb/react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { useEffect, useState } from "react";
import { client, liskMainnet } from "@/lib/config";
import { darkTheme } from "thirdweb/react";
import { wallets } from "@/lib/wallets";
import { motion, AnimatePresence } from "framer-motion";
import { LogoAnimation } from "./loading-screen";

const ConnectModal = ({
  isConnectModalOpen,
  setIsConnectModalOpen,
}: {
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
}) => {
  const { connect, isConnecting } = useConnectModal();
  const status = useActiveWalletConnectionStatus();
  const [localIsConnecting, setLocalIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setLocalIsConnecting(true);
      await connect({
        client,
        wallets,
        chain: liskMainnet,
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

  // Manage pointer-events on body
  useEffect(() => {
    const shouldDisablePointerEvents = isConnecting || localIsConnecting;
    if (shouldDisablePointerEvents) {
      document.body.style.pointerEvents = "auto";
    } else {
      document.body.style.pointerEvents = "auto";
    }

    return () => {
      document.body.style.pointerEvents = "auto";
    };
  }, [isConnecting, localIsConnecting]);

  // Reset localIsConnecting when modal closes and connection is complete
  useEffect(() => {
    if (!isConnectModalOpen && !isConnecting) {
      setLocalIsConnecting(false);
    }
  }, [isConnectModalOpen, isConnecting]);

  return (
    <Dialog
      open={status === "connecting" ? true : isConnectModalOpen}
      onOpenChange={(open) => {
        if (status === "connecting") return; // 🚫 block closing
        setIsConnectModalOpen(open);
      }}
    >
      <DialogContent className="max-w-[390px] sm:max-w-[400px] border-0 text-white bg-[#17171C]">
        {status === "connecting" ? (
          <div className="h-[150px] rounded-2xl p-8 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center mb-6">
              {/* <MemoLogo2 className="w-80 h-20 text-[#20FFAF]" /> */}
              <LogoAnimation />
            </div>
            <div className="flex flex-col items-center text-center">
              <AnimatePresence mode="popLayout">
                <motion.h2
                  key={1}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-white text-xl font-[500] mb-2"
                >
                  Reconnecting
                </motion.h2>
              </AnimatePresence>
              <motion.p
                animate={{
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                  delay: 0.5,
                }}
                className="text-gray-400 text-sm mb-4"
              >
                Please be patient as we reestablish your connection with the
                blockchain.
              </motion.p>
            </div>
          </div>
        ) : (
          status !== "connected" && (
            <>
              <div className="flex items-center justify-center">
                <img
                  src="/assets/wallet.png"
                  alt="wallet-icon"
                  className="w-32"
                />
              </div>
              <p className="my-3 text-[16px] text-center text-[#F1F1F1]">
                Connect your wallet to get the best of coinsafe
              </p>
              <div className="flex gap-2 items-center justify-center w-full">
                <Button
                  className="rounded-full border-none outline-none font-light py-2 px-10 text-sm bg-[#FFFFFF2B]/20"
                  onClick={() => setIsConnectModalOpen(false)}
                  disabled={isConnecting || localIsConnecting}
                >
                  Close
                </Button>
                <Button
                  className="rounded-full border-none outline-none text-black font-light py-2 px-10 text-sm"
                  variant="outline"
                  onClick={handleConnect}
                  disabled={isConnecting || localIsConnecting}
                >
                  {isConnecting || localIsConnecting
                    ? "Connecting..."
                    : "Connect Wallet"}
                </Button>
              </div>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConnectModal;
