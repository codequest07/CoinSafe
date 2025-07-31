import { AssetTabs } from "@/components/Asset-tabs";
import TopUpEmergencySafe from "@/components/Modals/TopUpEmegencySafe";
import WithdrawEmergencySafe from "@/components/Modals/WithdrawEmergencySafe";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { publicClient } from "@/lib/client";
import { liskSepolia } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis, tokens } from "@/lib/contract";
import { convertTokenAmountToUsd, getTokenDecimals } from "@/lib/utils";
import { savingsBalanceState, supportedTokensState } from "@/store/atoms/balance";
import { formatUnits } from "ethers";
import { ArrowLeft, Badge } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { useActiveAccount } from "thirdweb/react";
import { Abi } from "viem";

interface Token {
  token: string;
  amount: bigint;
}

const EmergencySafe = () => {
  const navigate = useNavigate();
  const [safeDetails, setSafeDetails] = useState<any | null>(null);
  const [savingsBalance] = useRecoilState(savingsBalanceState);
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, unknown>>({});
  const [supportedTokens] = useRecoilState(supportedTokensState);

  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const address = account?.address;
  const isConnected = !!account?.address;

  const fetchEmergencySafe = async () => {
    // Prepare multicall requests
    const rawTxs = supportedTokens.map((token: string) => ({
      address: CoinsafeDiamondContract.address,
      abi: facetAbis.emergencySavingsFacet as Abi,
      args: [address, token],
      functionName: "getEmergencySafeBalance",
    }));

    // console.log("Preparing multicall with contracts:", rawTxs);

    try {
      const results = await publicClient.multicall({
        contracts: rawTxs,
        chain: liskSepolia,
      });

      // console.log("Multicall results:", results);

      const tokenAmounts: Token[] = results
        .filter(({ status }: { status: string }) => status === "success")
        .map(({ result }: { result: any }, idx: number) => ({
          token: supportedTokens[idx],
          amount: result,
        }));

      // console.log("Processed token amounts:", tokenAmounts);

      return {
        id: 911n,
        target: "Emergency Safe",
        duration: 0n,
        startTime: 0n,
        unlockTime: 0n,
        tokenAmounts,
      };
    } catch (err) {
      console.error("Error in multicall for emergency safe:", err);
      // Return empty emergency safe on error
      return {
        id: 911n,
        target: "Emergency Safe",
        duration: 0n,
        startTime: 0n,
        unlockTime: 0n,
        tokenAmounts: [],
      };
    }
  };

  // Token address to symbol mapping
  const tokenSymbols: Record<string, string> = useMemo(() => {
    const mapping = Object.entries(tokens).reduce((acc, [symbol, address]) => {
      if (typeof address === "string") {
        acc[address.toLowerCase()] = symbol;
      }
      return acc;
    }, {} as Record<string, string>);
    return mapping;
  }, []);

  useEffect(() => {
    async function run() {
      setIsLoading(true);
      setIsError(false);
      try {
        const safe = await fetchEmergencySafe();

        // Format token amounts
        setTokenAmounts(
          safe.tokenAmounts.reduce((acc, token) => {
            if (token && token.token) acc[token.token] = token.amount;
            return acc;
          }, {} as Record<string, unknown>)
        );

        const formattedTokenAmounts = safe.tokenAmounts.map((token) => {
          if (!token || !token.token) {
            return {
              token: "unknown",
              tokenSymbol: "Unknown",
              amount: 0,
              formattedAmount: "0.00",
            };
          }
          const tokenAddress = token.token.toLowerCase();
          const symbol = tokenSymbols[tokenAddress] || "Unknown";

          return {
            token: token.token,
            tokenSymbol: symbol,
            amount: Number(token.amount),
            formattedAmount: Number(
              formatUnits(token.amount, getTokenDecimals(token.token))
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            }),
          };
        });

        // Calculate total amount in USD using asynchronous getTokenPrice function
        let totalAmountUSD = 0;

        try {
          const tokenPrices = await Promise.all(
            formattedTokenAmounts.map(async (token) => {
              if (!token || !token.tokenSymbol) {
                return 0;
              }
              const price = await convertTokenAmountToUsd(
                token.token,
                BigInt(token.amount)
              );
              return price;
            })
          );
          totalAmountUSD = tokenPrices.reduce((sum, value) => sum + value, 0);
        } catch (error) {
          console.error("Error fetching token prices:", error);
        }

        setSafeDetails({
          id: safe.id.toString(),
          target: safe.target,
          tokenAmounts: formattedTokenAmounts,
          totalAmountUSD,
        });
      } catch (error) {
        setIsError(true);
        setSafeDetails(null);
        console.error("Error loading safe details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savingsBalance]);

  // const [isLoading, setIsLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-64 ml-[3.3rem] mt-1" />

            <div className="flex gap-4 pr-4 pb-2 mt-6">
              <div className="flex-1 border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
                <div className="flex justify-between items-center pb-4">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex-1 border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
                <div className="flex justify-between items-center pb-4">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-10 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="text-red-500 text-center py-8">
            Error loading safe details. Please try again.
          </div>
        ) : !safeDetails && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src="/assets/not-found.gif"
              alt="Safe not found"
              className="w-full max-w-md h-auto mb-6"
            />
            <div className="text-white text-center">
              Safe not found.{" "}
              <Button variant="link" onClick={() => navigate(-1)}>
                Go back
              </Button>
            </div>
          </div>
        ) : (
          safeDetails && (
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl">{safeDetails.target}</h1>
                  <Badge className="bg-[#79E7BA33] inline-block px-2 py-2 rounded-[2rem] text-xs">
                    Flexible
                  </Badge>
                </div>
              </div>
              <p className="text-base my-1 ml-[3.3rem] text-gray-300">
                Withdraw anytime
              </p>
            </div>
          )
        )}

        {safeDetails && !isLoading && (
          <div className="flex gap-4 pr-4 pb-2">
            <div className="flex-1 flex gap-2">
              <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
                <div className="flex justify-between items-center pb-4">
                  <div className="text-[#CACACA] font-light">
                    Savings Balance
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div>
                      <span className="text-[#F1F1F1] pr-2 text-3xl">
                        {safeDetails?.totalAmountUSD?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-[#CACACA] text-xs">USD</span>
                    </div>
                    <div>
                      <div className="pt-2">
                        <p className="text-[#7F7F7F] text-xs">
                          Total value of all tokens in this safe
                        </p>
                      </div>
                    </div>
                  </div>
                  {isConnected && (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowTopUpModal(true)}
                        className="rounded-[100px] px-8 py-[8px] bg-[#FFFFFFE5] h-[40px] text-sm text-[#010104]"
                      >
                        Top up
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
              <div className="flex justify-between items-center pb-4">
                <div className="text-[#CACACA] font-light">
                  Claimable Balance
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div>
                    <span className="text-[#F1F1F1] pr-2 text-3xl">
                      {safeDetails?.totalAmountUSD?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-[#CACACA] text-xs">USD</span>
                  </div>
                  <div>
                    <div className="pt-2">
                      <p className="text-[#7F7F7F] text-xs">
                        Available to withdraw anytime
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="rounded-[100px] px-8 py-[8px] bg-[#3F3F3F99] h-[40px] text-sm text-[#F1F1F1]"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="py-2 mt-4">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full rounded-[12px] border-[1px] border-[#FFFFFF17] p-6" />
          </div>
        ) : (
          safeDetails && (
            <div className="py-2">
              <AssetTabs safeDetails={safeDetails} />
            </div>
          )
        )}
      </div>

      {showTopUpModal && (
        <TopUpEmergencySafe
          onClose={() => setShowTopUpModal(false)}
          onTopUp={() => setShowTopUpModal(false)}
        />
      )}

      {showWithdrawModal && (
        <WithdrawEmergencySafe
          isWithdrawModalOpen={showWithdrawModal}
          setIsWithdrawModalOpen={setShowWithdrawModal}
          AvailableBalance={tokenAmounts}
        />
      )}
    </div>
  );
};

export default EmergencySafe;
