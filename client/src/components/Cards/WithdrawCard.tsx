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
    setAmount(1 - 1);
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

      setSelectedTokenBalance(
        Number(formatUnits(tokenBalance, getTokenDecimals(token)))
      );
    }
  }, [token, address, AvailableBalance]);

  return (
    <main className="min-h-screen md:min-h-fit flex items-start md:items-center justify-center md:justify-center p-4 pt-8 md:pt-4">
      <div className="w-full max-w-md md:max-w-[600px] border-0 p-6 rounded-[12px] text-white bg-[#1D1D1D73]">
        <div className="flex items-center gap-2 mb-6">
          <button className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-medium">Withdraw assets</h1>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Amount</label>
            <div className="flex items-center gap-3 bg-transparent rounded-[8px] border-[1px] border-[#FFFFFF3D] px-4 py-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  className="bg-transparent text-[#B5B5B5] text-base outline-none w-full"
                  placeholder="0.00"
                />
                <div className="text-sm text-gray-400 mt-1">
                  ≈ ${tokenPrice}
                </div>
              </div>

              <div className="flex-shrink-0">
                <Select onValueChange={handleTokenSelect} value={token}>
                  <SelectTrigger className="w-28 h-12 bg-gray-700 border-[1px] border-[#FFFFFF21] bg-[#1E1E1E99] text-white rounded-lg">
                    <div className="flex items-center">
                      {token && tokenData[token]?.image ? (
                        <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center mr-2">
                          <img
                            src={tokenData[token].image}
                            width={16}
                            height={16}
                            className="w-full h-full"
                            alt={tokenData[token].symbol}
                          />
                        </div>
                      ) : token && tokenData[token] ? (
                        <div
                          className={`w-4 h-4 rounded-full ${
                            tokenData[token]?.color || "bg-gray-600"
                          } flex items-center justify-center text-white text-xs font-medium mr-2`}>
                          {tokenData[token]?.symbol?.charAt(0) || "?"}
                        </div>
                      ) : (
                        <MemoRipple className="w-4 h-4 mr-2" />
                      )}
                      {token ? (
                        <span className="text-white text-sm">
                          {tokenData[token]?.symbol}
                        </span>
                      ) : (
                        <SelectValue placeholder="Token" />
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {supportedTokens.map((tokenAddress) => {
                      const tokenInfo = tokenData[tokenAddress];
                      return (
                        <SelectItem value={tokenAddress} key={tokenAddress}>
                          <div className="flex items-center">
                            {tokenInfo?.image ? (
                              <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center mr-2">
                                <img
                                  src={tokenInfo.image}
                                  width={16}
                                  height={16}
                                  className="w-full h-full"
                                  alt={tokenInfo.symbol}
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-4 h-4 rounded-full ${
                                  tokenInfo?.color || "bg-gray-600"
                                } flex items-center justify-center text-white text-xs font-medium mr-2`}>
                                {tokenInfo?.symbol?.charAt(0) || "?"}
                              </div>
                            )}
                            <span className="text-sm">
                              {tokenInfo?.symbol || tokenAddress}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
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
              <div className="flex justify-between items-center">
                <div className="text-sm font-[300] text-gray-300">
                  Available balance:{" "}
                  <span className="text-gray-400">
                    {selectedTokenBalance} {tokenData[token]?.symbol}
                  </span>
                </div>
                <Button
                  className="text-sm border-none outline-none bg-transparent hover:bg-transparent text-green-400 cursor-pointer"
                  onClick={() => setAmount(selectedTokenBalance)}>
                  Max
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end mt-6">
          <Button
            onClick={(e) => {
              withdrawAsset(e);

              // if(isSuccess) {
              //   openThirdModal();
              // }
            }}
            className="text-black px-8 py-2 rounded-[2rem]"
            variant="outline"
            disabled={isLoading || (amount || 0) > selectedTokenBalance}>
            {isLoading ? (
              <LoaderCircle className="animate-spin mr-2" />
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
