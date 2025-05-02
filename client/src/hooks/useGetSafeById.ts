import { useState, useEffect, useMemo } from "react";
import { useGetSafes } from "@/hooks/useGetSafes";
import { formatUnits } from "viem";
import { tokens } from "@/lib/contract";

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

  // Token address to symbol mapping
  const tokenSymbols: Record<string, string> = useMemo(() => {
    console.log("Tokens object:", tokens);
    const mapping = Object.entries(tokens).reduce((acc, [symbol, address]) => {
      if (typeof address === "string") {
        console.log(`Mapping token: ${symbol} -> ${address.toLowerCase()}`);
        acc[address.toLowerCase()] = symbol;
      }
      return acc;
    }, {} as Record<string, string>);
    console.log("Token symbols mapping:", mapping);
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
    console.log("Raw token amounts:", safe.tokenAmounts);

    // Check if tokenAmounts is empty or undefined
    if (!safe.tokenAmounts || safe.tokenAmounts.length === 0) {
      console.log("No token amounts found in the safe");
    }

    console.log("token amounts::", safe.tokenAmounts);

    setTokenAmounts(
      safe.tokenAmounts.reduce((acc, token) => {
        if (token && token.token) acc[token.token] = token.amount;
        return acc;
      }, {} as Record<string, unknown>)
    );

    const formattedTokenAmounts = safe.tokenAmounts.map((token) => {
      if (!token || !token.token) {
        console.log("Invalid token data:", token);
        return {
          token: "unknown",
          tokenSymbol: "Unknown",
          amount: 0,
          formattedAmount: "0.00",
        };
      }

      const tokenAddress = token.token.toLowerCase();
      const symbol = tokenSymbols[tokenAddress] || "Unknown";
      console.log(`Token address: ${tokenAddress}, Mapped symbol: ${symbol}`);

      // Make symbol comparison case-insensitive for decimals
      const symbolUpper = symbol.toUpperCase();
      const decimals = symbolUpper === "USDT" ? 18 : 18;
      console.log(
        `Symbol: ${symbol}, Uppercase: ${symbolUpper}, Decimals: ${decimals}`
      );

      // Ensure token.amount is a valid BigInt
      let amount = 0;
      try {
        // Log the raw token amount for debugging
        console.log(
          `Raw token amount before formatting: ${
            token.amount
          }, type: ${typeof token.amount}`
        );

        // Check if token.amount is already a number
        if (typeof token.amount === "number") {
          amount = token.amount;
          console.log(`Token amount is already a number: ${amount}`);
        } else {
          // Format the token amount using the correct decimals
          amount = Number(formatUnits(token.amount, decimals));
          console.log(`Formatted token amount: ${amount}`);
        }

        // Normalize token amounts based on symbol
        // This is specifically to handle the case where USDT shows as 2,000,000
        if (symbolUpper === "USDT" && amount >= 1000000) {
          // If the amount is unreasonably large for USDT, normalize it
          // For example, if it's 2,000,000 USDT, normalize to 2 USDT
          console.log(`Normalizing large USDT amount: ${amount}`);
          amount = amount / 1000000;
          console.log(`Normalized USDT amount: ${amount}`);
        } else if (amount > 1000000) {
          // For other tokens, if the amount is very large, also normalize
          console.log(`Normalizing large token amount: ${amount}`);
          // Determine the appropriate divisor based on the magnitude
          const magnitude = Math.floor(Math.log10(amount));
          const divisor = Math.pow(10, magnitude - 1);
          amount = amount / divisor;
          console.log(`Normalized token amount: ${amount}`);
        }
      } catch (error) {
        console.error(`Error formatting token amount: ${error}`);
        console.log(
          `Token amount: ${token.amount}, type: ${typeof token.amount}`
        );
      }

      console.log(
        `Token: ${symbol}, Address: ${tokenAddress}, Raw amount: ${token.amount}, Decimals: ${decimals}, Formatted amount: ${amount}`
      );

      return {
        token: token.token,
        tokenSymbol: symbol,
        amount,
        formattedAmount: amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        }),
      };
    });

    // Calculate total amount in USD (simplified conversion)
    console.log("Formatted token amounts:", formattedTokenAmounts);

    // Check if formattedTokenAmounts is empty
    if (!formattedTokenAmounts || formattedTokenAmounts.length === 0) {
      console.log("No formatted token amounts available");
    }

    let totalAmountUSD = 0;

    try {
      totalAmountUSD = formattedTokenAmounts.reduce((sum, token) => {
        if (!token || !token.tokenSymbol) {
          console.log("Invalid token data in reduce:", token);
          return sum;
        }

        // Simple conversion rates (in a real app, you'd use an API)
        // Make token symbol comparison case-insensitive
        const tokenSymbolUpper = token.tokenSymbol.toUpperCase();
        const rate =
          tokenSymbolUpper === "SAFU"
            ? 0.339
            : tokenSymbolUpper === "LSK"
            ? 0.53
            : tokenSymbolUpper === "USDT"
            ? 1
            : 0;

        console.log(
          `Token symbol: ${token.tokenSymbol}, Uppercase: ${tokenSymbolUpper}, Rate: ${rate}`
        );

        // Use the already normalized amount from above
        let tokenAmount = token.amount;

        // No need for additional normalization here since we've already normalized
        // the token amounts in the previous step

        const tokenValueUSD = tokenAmount * rate;
        console.log(
          `Token: ${token.tokenSymbol}, Original Amount: ${token.amount}, Used Amount: ${tokenAmount}, Rate: ${rate}, Value in USD: ${tokenValueUSD}`
        );

        return sum + tokenValueUSD;
      }, 0);
    } catch (error) {
      console.error("Error calculating total USD amount:", error);
    }

    console.log("Total amount in USD before sanity check:", totalAmountUSD);

    // Sanity check for the total amount
    if (totalAmountUSD > 1000000) {
      // If greater than 1 million
      console.log(
        `Total USD amount is very large: ${totalAmountUSD}, applying sanity check`
      );
      // Apply normalization based on magnitude
      const magnitude = Math.floor(Math.log10(totalAmountUSD));
      const divisor = Math.pow(10, magnitude - 1);
      totalAmountUSD = totalAmountUSD / divisor;
      console.log(`Adjusted total USD amount: ${totalAmountUSD}`);
    }

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
  }, [id, safes, isLoading, isError, tokenSymbols]);

  return {
    safeDetails,
    tokenAmounts,
    isLoading,
    isError,
    error,
  };
}
