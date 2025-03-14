import ThirdwebConnectButton from "../ThirdwebConnectButton";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";

const ConnectModal = ({
  isConnectModalOpen,
  setIsConnectModalOpen,
}: {
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
}) => {
  return (
    <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
      <DialogContent className="sm:max-w-[400px] border-0 text-white bg-[#17171C]">
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
          >
            Close
          </Button>
          <span onClick={() => setIsConnectModalOpen(false)}>
            <ThirdwebConnectButton />
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectModal;
