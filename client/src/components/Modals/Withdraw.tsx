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
import { useEffect, useState } from "react";
import { CoinSafeContract, tokens } from "@/lib/contract";
import { useAccount } from "wagmi";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWithdrawAsset } from "@/hooks/useWithdrawAsset";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { useBalances } from "@/hooks/useBalances";
import { formatUnits } from "viem";

export default function Withdraw({
  isWithdrawModalOpen,
  setIsWithdrawModalOpen,
}: {
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const { address } = useAccount();

  const [amount, setAmount] = useState(0);
  const [token, setToken] = useState("");
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const { AvailableBalance } = useBalances(address as string);

  const openThirdModal = () => {
    console.log("details", token, amount);

    setIsThirdModalOpen(true);
    setIsWithdrawModalOpen(false);
  };

  const { withdrawAsset, isLoading } = useWithdrawAsset({
    address,
    token: token as `0x${string}`,
    amount,
    coinSafeAddress: CoinSafeContract.address as `0x${string}`,
    coinSafeAbi: CoinSafeContract.abi.abi,
    onSuccess: () => {
      openThirdModal();
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    },
    toast,
  });

  const handleTokenSelect = (value: string) => {
    setToken(value);
  };

  useEffect(() => {
    if (address && token && AvailableBalance?.data) {
      const tokensData = AvailableBalance?.data as any[];
      if (!tokensData) return;

      const tokenBalance =
        tokensData[0]
          .map((address: string, index: number) => ({
            address,
            balance: tokensData[1][index],
          }))
          .find((item: any) => item.address.toLowerCase() === token.toLowerCase())
          ?.balance || 0n;

      setSelectedTokenBalance(Number(formatUnits(tokenBalance, 18)));
    }
  }, [token, address, AvailableBalance?.data]);

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
          {token && (
            <>
              {amount > selectedTokenBalance && (
                <p className="text-red-500 text-[13px] text-right">
                  Amount greater than available balance
                </p>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-[300] text-gray-300">
                  Available balance:{" "}
                  <span className="text-gray-400">
                    {selectedTokenBalance}{" "}
                    {token == tokens.safu
                      ? "SAFU"
                      : token === tokens.lsk
                      ? "LSK"
                      : "USDT"}
                  </span>
                </div>
                <Button
                  className="text-sm border-none outline-none bg-transparent hover:bg-transparent text-green-400 cursor-pointer"
                  onClick={() => setAmount(selectedTokenBalance)}
                >
                  Max
                </Button>
              </div>
            </>
          )}
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
                withdrawAsset(e);

                // if(isSuccess) {
                //   openThirdModal();
                // }
              }}
              className="text-black px-8 rounded-[2rem]"
              variant="outline"
              disabled={isLoading || amount > selectedTokenBalance}
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
      <SuccessfulTxModal
        transactionType="withdraw"
        amount={amount}
        token={
          token == tokens.safu ? "SAFU" : token === tokens.lsk ? "LSK" : "USDT"
        }
        isOpen={isThirdModalOpen}
        onClose={() => setIsThirdModalOpen(false)}
      />
    </Dialog>
  );
}
