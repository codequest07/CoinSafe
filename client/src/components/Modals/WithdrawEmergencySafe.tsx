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
import { useChainConfig } from "@/hooks/useChainConfig";
// import savingsFacetAbi from "../../abi/SavingsFacet.json";

import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import SuccessfulTxModal from "./SuccessfulTxModal";
import { formatUnits } from "viem";
import { useActiveAccount } from "thirdweb/react";
import { getTokenPrice } from "@/lib";
import { getTokenDecimals, tokenData } from "@/lib/utils";
import { supportedTokensState } from "@/store/atoms/balance";
import { useRecoilState } from "recoil";
import { useWithdrawEmergencySafe } from "@/hooks/useWithdrawEmergencySafe";

export default function WithdrawEmergencySafe({
  isWithdrawModalOpen,
  setIsWithdrawModalOpen,
  AvailableBalance,
}: {
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  AvailableBalance: Record<string, unknown>;
}) {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const account = useActiveAccount();
  const address = account?.address;
  const { diamondAddress } = useChainConfig();

  const [amount, setAmount] = useState<number>();
  const [token, setToken] = useState("");
  const [tokenPrice, setTokenPrice] = useState("0.00");
  const [selectedTokenBalance, setSelectedTokenBalance] = useState(0);
  const [supportedTokens] = useRecoilState(supportedTokensState);

  const openSuccessModal = () => {
    console.log("Opening success modal");
    // Hide the approval modal and show the success modal
    setIsSuccessModalOpen(true);
    setIsWithdrawModalOpen(false);

    // Toast is now shown in the onClick handler only, not here
  };

  const { withdrawFromEmergencySafe, isLoading } = useWithdrawEmergencySafe({
    address: address as `0x${string}`,
    account,
    token: token as `0x${string}`,
    amount,
    coinSafeAddress: diamondAddress as `0x${string}`,
    onSuccess: () => {
      console.log("Withdrawal successful");
      // Success is handled in the onClick handler
    },
    onError: (error) => {
      console.error("Withdrawal error:", error);
      toast.error(error.message);
    },
    toast,
  });

  const handleTokenSelect = (value: string) => {
    setToken(value);
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

      // console.log("token amounts::", tokensData);

      if (!tokensData) return;

      const tokenBalance = (AvailableBalance[token] as bigint) || 0n;

      setSelectedTokenBalance(
        Number(formatUnits(tokenBalance, getTokenDecimals(token))),
      );
    }
  }, [token, address, AvailableBalance]);

  return (
    <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
      <DialogContent className="w-11/12 sm:max-w-[600px] border-1 border-[#FFFFFF21] text-white bg-[#17171C]">
        <DialogTitle className="text-white flex items-center space-x-3">
          <p>Withdraw from emergency safe</p>
        </DialogTitle>
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
                <div className="text-sm text-left text-gray-400 mt-1">
                  ≈ ${tokenPrice}
                </div>
              </div>
              <div className="sm:ml-4">
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
                          } flex items-center justify-center text-white text-xs font-medium mr-2`}
                        >
                          {tokenData[token]?.symbol?.charAt(0) || "?"}
                        </div>
                      ) : (
                        <></>
                        // <MemoRipple className="w-4 h-4 mr-2" />
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
                                } flex items-center justify-center text-white text-xs font-medium mr-2`}
                              >
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
              {amount && amount > selectedTokenBalance && (
                <p className="text-red-500 text-[13px] mt-1 text-right">
                  Amount greater than safe token balance
                </p>
              )}
              <div className="flex items-center justify-between my-2">
                <div className="text-sm font-[300] text-gray-300">
                  Safe token balance:{" "}
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
              onClick={async (e) => {
                // Validate inputs
                if (!amount) {
                  toast.error("Please enter an amount");
                  return;
                }

                if (!token) {
                  toast.error("Please select a token");
                  return;
                }

                if ((amount || 0) > selectedTokenBalance) {
                  toast.error("Insufficient balance", {
                    description: "Amount exceeds your available balance",
                  });
                  return;
                }

                console.log("Starting withdrawal process");

                try {
                  // Wait a bit to ensure the modal is visible
                  await new Promise((resolve) => setTimeout(resolve, 500));

                  // Process the withdrawal
                  await withdrawFromEmergencySafe(e);

                  // Show success modal after a short delay
                  setTimeout(() => {
                    openSuccessModal();

                    // Show a toast notification
                    toast.success("Withdrawal Successful", {
                      description: `Successfully withdrew ${amount} ${
                        tokenData[token]?.symbol || "tokens"
                      }`,
                    });
                  }, 1000);
                } catch (error) {
                  console.error("Withdrawal failed:", error);
                  toast.error("Withdrawal Failed", {
                    description:
                      error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
                  });
                }
              }}
              className="text-black px-8 rounded-[2rem]"
              variant="outline"
              disabled={
                isLoading ||
                !amount ||
                !token ||
                (amount || 0) > selectedTokenBalance
              }
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
      {/* Approval Transaction Modal */}
      {/* <ApproveTxModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
        }}
        amount={amount || 0}
        token={tokenData[token]?.symbol || "tokens"}
        text="To Withdraw"
        disableAutoClose={true}
      /> */}

      {/* Success Modal */}
      <SuccessfulTxModal
        transactionType="withdraw"
        amount={amount || 0}
        token={tokenData[token]?.symbol || "tokens"}
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          // Refresh the page or update balances
          window.location.reload();
        }}
        additionalDetails={{
          subText: "Assets will be available in your wallet.",
        }}
      />
    </Dialog>
  );
}
