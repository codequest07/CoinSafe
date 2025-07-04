import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { CoinsafeDiamondContract } from "@/lib/contract";
// import savingsFacetAbi from "../../abi/SavingsFacet.json";
import fundingFacetAbi from "../../abi/FundingFacet.json";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWithdrawAsset } from "@/hooks/useWithdrawAsset";
import SuccessfulTxModal from "../Modals/SuccessfulTxModal";
import { formatUnits } from "viem";
import { useActiveAccount } from "thirdweb/react";
import MemoRipple from "@/icons/Ripple";
import { getTokenPrice } from "@/lib";
import { useNavigate } from "react-router-dom";
import { getTokenDecimals, tokenData } from "@/lib/utils";
import { balancesState, supportedTokensState } from "@/store/atoms/balance";
import { useRecoilState } from "recoil";

export default function WithdrawCard() {
  const navigate = useNavigate();
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const account = useActiveAccount();
  const address = account?.address;

  const [amount, setAmount] = useState<number>();
  const [token, setToken] = useState("");
  const [tokenPrice, setTokenPrice] = useState("0.00");
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [supportedTokens] = useRecoilState(supportedTokensState);
  const [balances] = useRecoilState(balancesState);
  const AvailableBalance = useMemo(() => balances?.available || {}, [balances]);

  const openThirdModal = () => {
    console.log("details", token, amount);

    setIsThirdModalOpen(true);
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

  const resetState = () => {
    setAmount(1-1);
    // setToken("");
    // setTokenPrice("0.00");
    // setSelectedTokenBalance(0);
  };

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

      const tokenBalance = (AvailableBalance[token] as bigint) || 0n;

      setSelectedTokenBalance(Number(formatUnits(tokenBalance, getTokenDecimals(token))));
    }
  }, [token, address, AvailableBalance]);

  return (
    <main>
      <div className="w-11/12 mx-auto sm:max-w-[600px] border-0 p-6 rounded-[12px] text-white bg-[#1D1D1D73]">
        <div className="flex items-center gap-2 mb-6">
          <button className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-medium">Withdraw assets</h1>
        </div>
        <div className="py-4 text-gray-700">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Amount</label>
            <div className="flex items-center justify-between p-6 bg-transparent border border-[#FFFFFF3D] rounded-xl relative">
              <div className="flex flex-col items-start">
                <input
                  type="number"
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
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
                    {supportedTokens.map((token) => (
                      <SelectItem value={token} key={token}>
                        {tokenData[token]?.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Wallet Balance Section */}
          {token && (
            <>
              {amount! > 0 && amount! > selectedTokenBalance && (
                <p className="text-red-500 text-[13px] mt-1 text-right">
                  Amount greater than available balance
                </p>
              )}
              <div className="flex items-center justify-between my-2">
                <div className="text-sm font-[300] text-gray-300">
                  Available balance:{" "}
                  <span className="text-gray-400">
                    {selectedTokenBalance} {tokenData[token]?.symbol}
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
        <div className="flex items-center justify-end mt-5">
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
      </div>
      <SuccessfulTxModal
        transactionType="withdraw"
        amount={amount || 0}
        token={tokenData[token]?.symbol}
        isOpen={isThirdModalOpen}
        onClose={() => {
          setIsThirdModalOpen(false);
          resetState();
        }}
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />
    </main>
  );
}
