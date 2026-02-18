import { useMemo, useEffect } from "react";
import { useGetSafes } from "@/hooks/useGetSafes";
import { useAutomatedSafeForUser } from "@/hooks/useGetAutomatedSafe";
import { useActiveAccount } from "thirdweb/react";
import { useTokenPrices } from "@/lib/price-service";
import { getTokenDecimals } from "@/lib/utils";
import { formatUnits } from "viem";

export const useSavingsCardsData = () => {
  const account = useActiveAccount();
  const userAddress = account?.address;

  const {
    safes,
    isLoading: safesLoading,
    isError: safesError,
    fetchSafes,
  } = useGetSafes();
  const {
    details,
    isLoading: automatedSafeLoading,
    error: automatedSafeError,
  } = useAutomatedSafeForUser(userAddress as `0x${string}`);

  const hasActiveAutoSavings =
    details?.tokenDetails?.some(
      (token: { amountToSave: number }) => token.amountToSave > 0n,
    ) ?? false;

  // --- Price Fetching Integration ---
  const allTokenAddresses = useMemo(() => {
    const tokens = new Set<string>();
    if (details?.tokenDetails) {
      details.tokenDetails.forEach((t: any) => tokens.add(t.token));
    }
    if (safes) {
      safes.forEach((safe: any) => {
        safe.tokenAmounts.forEach((t: any) => tokens.add(t.token));
      });
    }
    return Array.from(tokens);
  }, [details, safes]);

  const priceQueries = useTokenPrices(allTokenAddresses);

  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};
    allTokenAddresses.forEach((addr, idx) => {
      map[addr] = priceQueries[idx].data || 0;
    });
    return map;
  }, [allTokenAddresses, priceQueries]);

  // Derive totalUsdValue synchronously
  const totalUsdValue = useMemo(() => {
    if (!details?.tokenDetails || details.tokenDetails.length === 0) {
      return "0.00";
    }
    let total = 0;
    details.tokenDetails.forEach((item: any) => {
      const price = priceMap[item.token] || 0;
      const decimals = getTokenDecimals(item.token);
      // item.amountSaved is BigInt
      const amount = Number(formatUnits(item.amountSaved, decimals));
      total += amount * price;
    });
    return total.toFixed(2);
  }, [details, priceMap]);

  const displaySafes = useMemo(() => {
    if (!safes) return [];

    return safes.map((safe) => {
      const totalAmount = safe.tokenAmounts.reduce((sum, token) => {
        const decimals = getTokenDecimals(token.token);
        const amount = Number(formatUnits(token.amount, decimals));
        const price = priceMap[token.token] || 0;
        return sum + amount * price;
      }, 0);

      let formattedDate = "N/A";
      if (safe.unlockTime) {
        const unlockDate = new Date(Number(safe.unlockTime) * 1000);
        formattedDate = unlockDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      const status =
        Number(safe.duration) > 0
          ? Number(safe.unlockTime) * 1000 > Date.now()
            ? "Locked"
            : "Matured"
          : "Flexible";

      return {
        id: safe.id.toString(),
        name: safe.target,
        amount: totalAmount,
        status: status as "Locked" | "Flexible" | "Matured",
        isLocked: Number(safe.unlockTime) * 1000 > Date.now(),
        unlockDate: safe.unlockTime
          ? `Unlocks on ${formattedDate}`
          : "Unlocks Anytime",
      };
    });
  }, [safes, priceMap]);

  // Force refresh safes when component mounts
  useEffect(() => {
    fetchSafes();
  }, [fetchSafes]);

  return {
    safes,
    displaySafes,
    totalUsdValue,
    isLoading: safesLoading || automatedSafeLoading,
    isError: safesError || !!automatedSafeError,
    hasActiveAutoSavings,
    fetchSafes,
  };
};
