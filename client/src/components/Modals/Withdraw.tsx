import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import MemoBackIcon from "@/icons/BackIcon";
// import coinSafeAbi from "../../abi/coinsafe.json";
// import ApproveWithdraw from "./ApproveWithdraw";
import { tokens } from "@/lib/contract";
import { 
  useAccount, 
  useConnect, 
  // useWriteContract 
} from "wagmi";
import { injected } from "wagmi/connectors";
import { liskSepolia } from "viem/chains";
// import { erc20Abi } from "viem";
// import { waitForTransactionReceipt } from "@wagmi/core";
// import { config } from "@/lib/config";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Withdraw({
  isWithdrawModalOpen,
  setIsWithdrawModalOpen,
  onBack,
}: {
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {
  // const { writeContractAsync } = useWriteContract();

  const { connectAsync } = useConnect();
  // const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const [amount, setAmount] = useState(0);
  const [token, setToken] = useState("");

  // const openThirdModal = () => {
  //   console.log("details", token, amount);

  //   setIsThirdModalOpen(true);
  //   setIsWithdrawModalOpen(false);
  // };

  const handleWithdrawAsset = async (e: any) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      if (!address) {
        try {
          await connectAsync({
            chainId: liskSepolia.id,
            connector: injected(),
          });
        } catch (error) {
          alert(error);
        }
      }

      if (!amount) {
        toast({
          title: "Please input a value for amount to Withdraw",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!token) {
        toast({
          title: "Please select token to Withdraw",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
    // const formData = new FormData(e.target as HTMLFormElement)
    // const tokenId = formData.get('tokenId') as string
    // console.log("Loggin first")
    // writeContract({
    //   address: `0x${CoinSafeContract.address}`,
    //   abi:coinSafeAbi.abi,
    //   functionName: 'WithdrawToPool',
    //   args: [amount, BigInt(token)],
    // });

    // console.log("Logging after")
  };

  const handleTokenSelect = (value: string) => {
    setToken(value);
  };

  return (
    <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
      <DialogContent className="sm:max-w-[600px] border-0 text-white bg-[#010104]">
        <DialogTitle className="text-white flex items-center space-x-3">
          <MemoBackIcon onClick={onBack} className="w-6 h-6 cursor-pointer" />
          <p>Withdraw assets</p>
        </DialogTitle>
        <div className="p-8 text-gray-700">
          {/* Amount Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <label htmlFor="amount" className="text-sm text-gray-400">
                Amount
              </label>
              <div className="flex flex-col items-center justify-center">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  placeholder="100"
                  required
                  min={0.05}
                  className="bg-transparent text-base font-light text-gray-200 border-none focus:outline-none text-center w-full"
                />
                {/* <div className="text-xs text-gray-400 text-center">
                  ≈ $400.56
                </div> */}
              </div>
            </div>
            <div className="ml-4">
              <Select onValueChange={handleTokenSelect} required>
                <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                  <div className="flex items-center">
                    {/* <MemoRipple className="mr-2" /> */}
                    <SelectValue placeholder="Select Token" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={tokens.usdt}>
                    <div className="flex items-center space-x-2">
                      <p>USDT</p>
                    </div>
                  </SelectItem>
                  <SelectItem value={tokens.lsk}>LSK</SelectItem>
                  <SelectItem value={tokens.safu}>SAFU</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Wallet Balance Section */}
          {/* <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-[300] text-gray-300">
              Withdraw assets: <span className="text-gray-400">3000 XRP</span>
            </div>
            <div className="text-sm text-green-400 cursor-pointer">Max</div>
          </div> */}
        </div>
        <DialogFooter>
          <Button
            onClick={() => setIsWithdrawModalOpen(false)}
            className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
            type="submit"
          >
            Cancel
          </Button>
          <div>
            <Button
              onClick={(e) => {
                handleWithdrawAsset(e);

                // if(isSuccess) {
                //   openThirdModal();
                // }
              }}
              className="text-black px-8 rounded-[2rem]"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Withdraw assets"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      {/* <Withdrawed
        amount={amount}
        token={
          token == tokens.safu ? "SAFU" : token === tokens.lsk ? "LSK" : "USDT"
        }
        isOpen={isThirdModalOpen}
        onClose={() => setIsThirdModalOpen(false)}
      /> */}
    </Dialog>
  );
}
