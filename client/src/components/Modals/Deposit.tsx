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
import fundingFacetAbi from "../../abi/FundingFacet.json";
import { CoinsafeDiamondContract, tokens } from "@/lib/contract";
import { LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
// import Deposited from "./Deposited";
import { useDepositAsset } from "@/hooks/useDepositAsset";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client, liskSepolia } from "@/lib/config";
import { getBalance } from "thirdweb/extensions/erc20";
import MemoRipple from "@/icons/Ripple";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { getLskToUsd, getSafuToUsd, getUsdtToUsd } from "@/lib";
import ApproveTxModal from "./ApproveTxModal";
import AmountInput from "../AmountInput";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
// import { tokens } from "@/lib/contract";

export default function Deposit({
  isDepositModalOpen,
  setIsDepositModalOpen,
}: {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  onBack: () => void;
}) {
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const [approveTxModalOpen, setApproveTxModalOpen] = useState(false);
  const smartAccount = useActiveAccount();
  const address = smartAccount?.address;

  const [amount, setAmount] = useState<number>();
  const [token, setToken] = useState("");
  const [tokenPrice, setTokenPrice] = useState("0.00");

  const [selectedTokenBalance, _setSelectedTokenBalance] = useState(0);

  const [saveState, setSaveState] = useRecoilState(saveAtom);
  const [, setDecimals] = useState(1);
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    token?: string;
    duration?: string;
    transactionPercentage?: string;
    frequency?: string;
  }>({});

  const openThirdModal = () => {
    setIsThirdModalOpen(true);
    setIsDepositModalOpen(false);
  };

  const promptApproveModal = () => {
    setApproveTxModalOpen(true);
  };

  const { depositAsset, isLoading } = useDepositAsset({
    address: address as `0x${string}`,
    account: smartAccount,
    token: token as `0x${string}`,
    amount,
    // coinSafeAddress: CoinSafeContract.address as `0x${string}`,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    coinSafeAbi: fundingFacetAbi,
    onSuccess: () => {
      openThirdModal();
    },
    onApprove: () => {
      promptApproveModal();
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    },
    toast,
  });

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

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _amount = Number(event.target.value);
    setSaveState((prevState) => ({
      ...prevState,
      amount: _amount,
    }));
  };

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
      <DialogContent className="w-11/12 sm:max-w-[600px] border-0 text-white bg-[#1D1D1D73]">
        <DialogTitle className="text-white flex items-center">
          <p>Deposit assets</p>
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
                // onClick={() => setAmount(selectedTokenBalance)}
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
        <DialogFooter className="">
          <div className="flex sm:space-x-4 justify-between mt-2">
            <Button
              onClick={() => setIsDepositModalOpen(false)}
              className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
              type="submit">
              Cancel
            </Button>

            <Button
              onClick={(e) => {
                depositAsset(e);
              }}
              className="text-black px-8 rounded-[2rem]"
              variant="outline"
              disabled={isLoading || (amount || 0) > selectedTokenBalance}>
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Deposit assets"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <SuccessfulTxModal
        amount={amount || 0}
        token={
          token == tokens.safu ? "SAFU" : token === tokens.lsk ? "LSK" : "USDT"
        }
        isOpen={isThirdModalOpen}
        onClose={() => setIsThirdModalOpen(false)}
        transactionType="deposit"
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />

      <ApproveTxModal
        isOpen={approveTxModalOpen}
        onClose={() => setApproveTxModalOpen(false)}
        amount={amount || 0}
        token={
          token == tokens.safu ? "SAFU" : token === tokens.lsk ? "LSK" : "USDT"
        }
        text="To Deposit"
      />
    </Dialog>
  );
}
