import { useCallback, useMemo, useEffect } from "react";
import { getContract, readContract, resolveMethod } from "thirdweb";
import { Abi } from "viem";
import { useRecoilState } from "recoil";

import { liskSepolia, client } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import {
  safesState,
  safesLoadingState,
  safesErrorState,
} from "@/store/atoms/safes";

// Define the SafeDetails interface based on the provided struct
interface Token {
  token: string;
  amount: bigint;
}

export interface SafeDetails {
  id: bigint;
  target: string;
  duration: bigint;
  startTime: bigint;
  unlockTime: bigint;
  tokenAmounts: Token[];
}

export function useGetSafes() {
  // Use Recoil state instead of local state
  const [safes, setSafes] = useRecoilState(safesState);
  const [isLoading, setIsLoading] = useRecoilState(safesLoadingState);
  const [error, setError] = useRecoilState(safesErrorState);
  // Derive isError from error state
  const isError = error !== null;

  const account = useActiveAccount();
  const address = account?.address;

  const contract = useMemo(() => {
    return getContract({
      client,
      address: CoinsafeDiamondContract.address,
      chain: liskSepolia,
      abi: facetAbis.targetSavingsFacet as Abi,
    });
  }, []); // <-- Only create once

  const fetchSafes = useCallback(
    async (force = false) => {
      if (!address) return;

      // Only fetch if we don't already have data or we're forcing a refresh
      if (safes.length > 0 && !force && !isLoading) {
        console.log("Using cached safes data");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching safes from blockchain...");

        const result = await readContract({
          contract,
          method: resolveMethod("getSafes"),
          params: [],
          from: address,
        });

        console.log("====================================");
        console.log("Safes:", result);
        console.log("====================================");

        setSafes(result as SafeDetails[]);
      } catch (err: any) {
        console.error("Transaction fetch failed:", err);
        setError(err);
        setSafes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      contract,
      address,
      safes.length,
      isLoading,
      setSafes,
      setError,
      setIsLoading,
    ]
  );

  // Only fetch on initial mount, not on every dependency change
  useEffect(() => {
    // This will only run once when the component mounts
    if (safes.length === 0 && !isLoading) {
      fetchSafes();
    }
  }, []); // Empty dependency array

  return {
    safes,
    isLoading,
    isError,
    error,
    fetchSafes,
    refetch: fetchSafes,
  };
}
