import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { tokens, CoinsafeDiamondContract } from "@/lib/contract";
// import savingsFacetAbi from "../../abi/SavingsFacet.json";
import fundingFacetAbi from "../../abi/FundingFacet.json";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWithdrawAsset } from "@/hooks/useWithdrawAsset";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { useBalances } from "@/hooks/useBalances";
import { useActiveAccount } from "thirdweb/react";
// import { getLskToUsd, getSafuToUsd, getUsdtToUsd } from "@/lib";
import AmountInput from "../AmountInput";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";

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

  useBalances(address as string); // Call useBalances without destructuring
  const [amount] = useState<number>();
  const [token] = useState("");
  // Removed unused tokenPrice state variable

  const [selectedTokenBalance, _setSelectedTokenBalance] = useState(0);

  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const [, setDecimals] = useState(1);
  const [validationErrors] = useState<{
    amount?: string;
    token?: string;
    duration?: string;
    transactionPercentage?: string;
    frequency?: string;
  }>({});

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
    // SAFU & LSK check
    if (value == tokens.safu || value == tokens.lsk) {
      setDecimals(18);
      // USDT check
    } else if (value == tokens.usdt) {
      setDecimals(6);
    }

    setSaveState((prevState) => ({ ...prevState, token: value }));
  };

  // Removed unused getTokenPrice function

  useEffect(() => {
    // Removed unused updatePrice logic
  }, [token, amount]);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _amount = Number(event.target.value);
    setSaveState((prevState) => ({
      ...prevState,
      amount: _amount,
    }));
  };
  return (
    <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
      <DialogContent className="w-11/12 sm:max-w-[600px] border-1 border-[#FFFFFF21] text-white bg-[#1D1D1D73]">
        <DialogTitle className="text-white flex items-center space-x-3">
          {/* <MemoBackIcon onClick={onBack} className="w-6 h-6 cursor-pointer" /> */}
          <p>Withdraw assets</p>
        </DialogTitle>
        <div className="sm:p-8 text-gray-700">
          <div className="space-y-2">
            <AmountInput
              amount={saveState.amount}
              handleAmountChange={handleAmountChange}
              handleTokenSelect={handleTokenSelect}
              saveState={saveState}
              tokens={tokens}
              selectedTokenBalance={selectedTokenBalance}
              validationErrors={validationErrors}
            />
          </div>

          {/* Wallet balance */}
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-[300] text-gray-300">
                Onchain balance:{" "}
                <span className="text-gray-400">
                  {selectedTokenBalance}{" "}
                  {saveState.token == tokens.safu
                    ? "SAFU"
                    : saveState.token === tokens.lsk
                    ? "LSK"
                    : "USDT"}
                </span>
              </div>
              <Button
                className="text-sm border-none outline-none bg-transparent hover:bg-transparent text-[#79E7BA] cursor-pointer"
                // onClick={() => setSaveState((prev) => ({ ...prev, amount: selectedTokenBalance }))}
                onClick={() =>
                  setSaveState((prev) => ({
                    ...prev,
                    amount: selectedTokenBalance,
                  }))
                }>
                Max
              </Button>
            </div>
          </>
        </div>
        <DialogFooter>
          <div className="flex sm:space-x-4 justify-between mt-2">
            <Button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
              type="submit">
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
              disabled={isLoading || (amount || 0) > selectedTokenBalance}>
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
