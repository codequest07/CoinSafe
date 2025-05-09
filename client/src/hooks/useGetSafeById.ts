import { useState, useEffect, useMemo } from "react";
import { useGetSafes } from "@/hooks/useGetSafes";
import { formatUnits } from "viem";
import { tokens } from "@/lib/contract";
import { convertTokenAmountToUsd } from "@/lib/utils";

export interface FormattedSafeDetails {
  id: string;
  target: string;
  duration: number;
  startTime: Date;
  unlockTime: Date;
  nextUnlockDate: string;
  tokenAmounts: {
    token: string;
    tokenSymbol: string;
    amount: number;
    formattedAmount: string;
  }[];
  totalAmountUSD: number;
  isLocked: boolean;
}

export function useGetSafeById(id: string | undefined) {
  const { safes, isLoading, isError, error } = useGetSafes();
  const [safeDetails, setSafeDetails] = useState<FormattedSafeDetails | null>(
    null
  );
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, unknown>>({});
  // const [savingsBalance] = useRecoilState(savingsBalanceState);

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

  // Format date to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!id || !safes || isLoading || isError) return;

    async function run() {
      // Find the safe with the matching ID
      const safe = safes.find((safe) => safe.id.toString() === id);

      if (!safe) return;

      // Format the safe data
      const startTime = new Date(Number(safe.startTime) * 1000);
      const unlockTime = new Date(Number(safe.unlockTime) * 1000);

      // Calculate next unlock date based on duration
      // const durationInDays = Number(safe.duration) / (24 * 60 * 60); // Unused variable
      const nextUnlockDate = new Date(unlockTime);

      // If the unlock time is in the past, calculate the next unlock date
      if (unlockTime < new Date()) {
        const currentTime = new Date();
        const timeSinceUnlock = currentTime.getTime() - unlockTime.getTime();
        const cyclesPassed =
          Math.floor(timeSinceUnlock / Number(safe.duration) / 1000) + 1;
        nextUnlockDate.setTime(
          unlockTime.getTime() + cyclesPassed * Number(safe.duration) * 1000
        );
      }

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
          formattedAmount: Number(formatUnits(token.amount, 18)).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            }
          ),
        };
      });

      // Calculate total amount in USD using asynchronous getTokenPrice function

      let totalAmountUSD = 0;

      const fetchTokenPrices = async () => {
        try {
          const tokenPrices = await Promise.all(
            formattedTokenAmounts.map(async (token) => {
              if (!token || !token.tokenSymbol) {
                return 0;
              }

              console.log("Logging tokens to see ");
              console.log(token.token, token.amount);

              // Fetch the token price using the asynchronous function
              const price = await convertTokenAmountToUsd(
                token.token,
                BigInt(token.amount)
              );

              console.log(price);
              return price;
            })
          );

          console.log("TOken Prices", tokenPrices);

          // Sum up all token values in USD
          totalAmountUSD = tokenPrices.reduce((sum, value) => sum + value, 0);
        } catch (error) {
          // Silent error handling
          console.error("Error fetching token prices:", error);
        }
      };

      // Execute the fetchTokenPrices function
      await fetchTokenPrices();

      console.log("Total amounts in usd for this safeeee", totalAmountUSD);

      setSafeDetails({
        id: safe.id.toString(),
        target: safe.target,
        duration: Number(safe.duration),
        startTime,
        unlockTime,
        nextUnlockDate: formatDate(nextUnlockDate),
        tokenAmounts: formattedTokenAmounts,
        totalAmountUSD,
        isLocked: Number(safe.duration) > 0,
      });
    }

    run();
  }, [id, safes, isLoading, isError, tokenSymbols]);

  return {
    safeDetails,
    tokenAmounts,
    isLoading,
    isError,
    error,
  };
}
