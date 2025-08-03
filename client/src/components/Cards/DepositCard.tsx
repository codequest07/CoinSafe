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
import { CoinsafeDiamondContract } from "@/lib/contract";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useDepositAsset } from "@/hooks/useDepositAsset";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { getBalance } from "thirdweb/extensions/erc20";
import MemoRipple from "@/icons/Ripple";
import SuccessfulTxModal from "../Modals/SuccessfulTxModal";
import ApproveTxModal from "../Modals/ApproveTxModal";
import { useNavigate } from "react-router-dom";
import { tokenData } from "@/lib/utils";
import { getTokenPrice } from "@/lib";
import { supportedTokensState } from "@/store/atoms/balance";
import { useRecoilState } from "recoil";

export default function DepositCard() {
  const navigate = useNavigate();
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);
  const [approveTxModalOpen, setApproveTxModalOpen] = useState(false);
  const smartAccount = useActiveAccount();
  const address = smartAccount?.address;

  const [amount, setAmount] = useState<number>();
  const [token, setToken] = useState("");
  const [tokenPrice, setTokenPrice] = useState("0.00");
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [supportedTokens] = useRecoilState(supportedTokensState);

  const openThirdModal = () => {
    setIsThirdModalOpen(true);
  };

  const promptApproveModal = () => {
    setApproveTxModalOpen(true);
  };

  const handleTokenSelect = (value: string) => {
    setToken(value);
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
      setSelectedTokenBalance((prev) => prev - (amount || 0));
    },
    onApprove: () => {
      promptApproveModal();
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: "destructive",
        duration: 3000,
      });
    },
    toast,
  });

  const resetState = () => {
    setAmount(0);
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
    async function fetchTokenBalance() {
      try {
        const contract = getContract({
          client,
          address: token,
          // abi: erc20Abi,
          chain: liskMainnet,
        });

        const tokenBalance = await getBalance({ contract, address: address! });
        setSelectedTokenBalance(Number(tokenBalance.displayValue));
      } catch (error) {
        console.error(error);
        throw new Error(error as any);
      }
    }

    if (address && token) {
      fetchTokenBalance();
    }
  }, [token, address]);

  return (
    <main className="min-h-screen md:min-h-fit flex items-start md:items-center justify-center md:justify-center p-4 pt-8 md:pt-4">
      <div className="w-full max-w-md md:max-w-[600px] border-0 p-6 rounded-[12px] text-white bg-[#1D1D1D73]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-medium">Deposit Assets</h1>
        </div>
        <div className="py-4 text-gray-700">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Amount</label>
            <div className="flex items-center gap-3 bg-transparent rounded-[8px] border-[1px] border-[#FFFFFF3D] px-4 py-4">
              <div className="flex-1">
                <input
                  type="number"
                  value={amount}
                  disabled={isLoading}
                  onChange={(e: any) => setAmount(e.target.value)}
                  className="bg-transparent text-[#B5B5B5] text-base outline-none w-full"
                  placeholder="0.00"
                />
                <div className="text-sm text-gray-400 mt-1">
                  ≈ ${tokenPrice}
                </div>
              </div>

              <div className="flex-shrink-0">
                <Select
                  onValueChange={handleTokenSelect}
                  value={token}
                  disabled={isLoading}>
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
                  Amount greater than wallet balance
                </p>
              )}
              <div className="flex justify-between items-center my-2">
                <div className="text-sm font-[300] text-gray-300">
                  Wallet balance:{" "}
                  <span className="text-gray-400">
                    {selectedTokenBalance} {tokenData[token]?.symbol}
                  </span>
                </div>
                {token &&
                (selectedTokenBalance == 0 ||
                  (amount && amount > selectedTokenBalance)) ? (
                  <Button
                    variant="link"
                    className="text-[#79E7BA] hover:text-[#79E7BA]/80 p-0"
                    onClick={() => navigate("/dashboard/deposit")}>
                    Deposit to save
                  </Button>
                ) : (
                  <Button
                    className="text-sm border-none outline-none bg-transparent hover:bg-transparent text-green-400 cursor-pointer"
                    onClick={() => setAmount(selectedTokenBalance)}>
                    Max
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end mt-5">
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
      </div>
      <SuccessfulTxModal
        amount={amount || 0}
        token={tokenData[token]?.symbol}
        isOpen={isThirdModalOpen}
        onClose={() => {
          setIsThirdModalOpen(false);
          resetState();
        }}
        transactionType="deposit"
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />

      <ApproveTxModal
        isOpen={approveTxModalOpen}
        onClose={() => setApproveTxModalOpen(false)}
        amount={amount || 0}
        token={tokenData[token]?.symbol}
        text="To Deposit"
      />
    </main>
  );
}
