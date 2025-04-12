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
import { tokens, CoinsafeDiamondContract } from "@/lib/contract";
// import savingsFacetAbi from "../../abi/SavingsFacet.json";
import fundingFacetAbi from "../../abi/FundingFacet.json";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWithdrawAsset } from "@/hooks/useWithdrawAsset";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { useBalances } from "@/hooks/useBalances";
import { formatUnits } from "viem";
import { useActiveAccount } from "thirdweb/react";
import MemoRipple from "@/icons/Ripple";
import { getLskToUsd, getSafuToUsd, getUsdtToUsd } from "@/lib";
import { tokenData } from "@/lib/utils";

export default function Withdraw({
  isWithdrawModalOpen,
  setIsWithdrawModalOpen,
}: {
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const account = useActiveAccount();
  const address = account?.address;

  const [amount, setAmount] = useState<number>();
  const [token, setToken] = useState("");
  const [tokenPrice, setTokenPrice] = useState("0.00");
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const { AvailableBalance, supportedTokens } = useBalances(address as string);

  const openThirdModal = () => {
    console.log("details", token, amount);

    setIsThirdModalOpen(true);
    setIsWithdrawModalOpen(false);
  };

  const { withdrawAsset, isLoading } = useWithdrawAsset({
    address: address as `0x${string}`,
    account,
    token: token as `0x${string}`,
    amount,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    coinSafeAbi: fundingFacetAbi,
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

  async function getTokenPrice(token: string, amount: number | undefined) {
    if (!token || !amount) return "0.00";

    try {
      switch (token) {
        case tokens.safu: {
          const safuPrice = await getSafuToUsd(amount);
          return safuPrice.toFixed(2);
        }
        case tokens.lsk: {
          const lskPrice = await getLskToUsd(amount);
          return lskPrice.toFixed(2);
        }
        case tokens.usdt: {
          const usdtPrice = await getUsdtToUsd(amount);
          return usdtPrice.toFixed(2);
        }
        default:
          return "0.00";
      }
    } catch (error) {
      console.error("Error getting token price:", error);
      return "0.00";
    }
  }

  useEffect(() => {
    const updatePrice = async () => {
      const price: string = await getTokenPrice(token, amount);
      setTokenPrice(price);
    };
    updatePrice();
  }, [token, amount]);

  useEffect(() => {
    if (address && token && AvailableBalance) {
      const tokensData = AvailableBalance;
      if (!tokensData) return;

      const tokenBalance = AvailableBalance[token] as bigint || 0n;

      setSelectedTokenBalance(Number(formatUnits(tokenBalance, 18)));
    }
  }, [token, address, AvailableBalance]);

  return (
    <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
      <DialogContent className="w-11/12 sm:max-w-[600px] border-1 border-[#FFFFFF21] text-white bg-[#17171C]">
        <DialogTitle className="text-white flex items-center space-x-3">
          <p>Withdraw Assets</p>
        </DialogTitle>
        <div className="py-4 text-gray-700">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Amount</label>
            <div className="flex items-center justify-between p-6 bg-transparent border border-[#FFFFFF3D] rounded-xl relative">
              <div className="flex flex-col items-start">
                <input
                  type="number"
                  value={amount}
                  onChange={(e: any) => setAmount(Number(e.target.value))}
                  className="text-2xl font-medium bg-transparent text-white w-16 sm:w-full outline-none"
                  placeholder="0"
                />
                <div className="text-sm text-gray-400 mt-1">
                  ≈ ${tokenPrice}
                </div>
              </div>
              <div className="ml-4">
                <Select onValueChange={handleTokenSelect} value={token}>
                  <SelectTrigger className="w-[160px] py-2.5 bg-gray-700  border border-[#FFFFFF3D] bg-[#3F3F3F99]/60 text-white rounded-md">
                    <div className="flex items-center">
                      <MemoRipple className="mr-2" />
                      <SelectValue placeholder="Select Token" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {supportedTokens.map(token => <SelectItem value={token}>{tokenData[token]?.symbol}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Wallet Balance Section */}
          {token && (
            <>
              {amount && amount > selectedTokenBalance && (
                <p className="text-red-500 text-[13px] mt-1 text-right">
                  Amount greater than available balance
                </p>
              )}
              <div className="flex items-center justify-between my-2">
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
          <div className="flex sm:space-x-4 justify-between mt-2">
            <Button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
              type="submit"
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                withdrawAsset(e);

                // if(isSuccess) {
                //   openThirdModal();
                // }
              }}
              className="text-black px-8 rounded-[2rem]"
              variant="outline"
              disabled={isLoading || (amount || 0) > selectedTokenBalance}
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
        amount={amount || 0}
        token={
          token == tokens.safu ? "SAFU" : token === tokens.lsk ? "LSK" : "USDT"
        }
        isOpen={isThirdModalOpen}
        onClose={() => setIsThirdModalOpen(false)}
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />
    </Dialog>
  );
}
