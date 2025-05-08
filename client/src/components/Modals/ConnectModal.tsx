import { useConnectModal } from "thirdweb/react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { useEffect, useState } from "react";
import { client } from "@/lib/config";
import { darkTheme } from "thirdweb/react";
import { wallets } from "@/lib/wallets";

const ConnectModal = ({
  isConnectModalOpen,
  setIsConnectModalOpen,
}: {
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
}) => {
  const { connect, isConnecting } = useConnectModal();
  const [localIsConnecting, setLocalIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setLocalIsConnecting(true);
      await connect({
        client,
        wallets,
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
    <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
      <DialogContent className="max-w-[390px] sm:max-w-[400px] border-0 text-white bg-[#17171C]">
        <div className="flex items-center justify-center">
          <img src="/assets/wallet.png" alt="wallet-icon" className="w-32" />
        </div>
        <p className="my-3 text-[16px] text-center text-[#F1F1F1]">
          Connect your wallet to get the best of coinsafe
        </p>
        <div className="flex gap-2 items-center justify-center w-full">
          <Button
            className="rounded-full border-none outline-none font-light py-2 px-10 text-sm bg-[#FFFFFF2B]/20"
            onClick={() => setIsConnectModalOpen(false)}
            disabled={isConnecting || localIsConnecting}>
            Close
          </Button>
          <Button
            className="rounded-full border-none outline-none text-black font-light py-2 px-10 text-sm"
            variant="outline"
            onClick={handleConnect}
            disabled={isConnecting || localIsConnecting}>
            {isConnecting || localIsConnecting
              ? "Connecting..."
              : "Connect Wallet"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectModal;
