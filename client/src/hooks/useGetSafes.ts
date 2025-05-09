import { useCallback, useMemo, useEffect, useState } from "react";
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
  targetedSafesState,
} from "@/store/atoms/safes";
import { savingsBalanceState, supportedTokensState } from "@/store/atoms/balance";
import { publicClient } from "@/lib/client";
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
  const [targetedSafes, setTargetedSafes] = useRecoilState(targetedSafesState);
  const [isLoading, setIsLoading] = useRecoilState(safesLoadingState);
  const [error, setError] = useRecoilState(safesErrorState);
  const [supportedTokens] = useRecoilState(supportedTokensState);
  // Derive isError from error state
  const isError = error !== null;

  const account = useActiveAccount();
  const [savingsBalance] = useRecoilState(savingsBalanceState);
  const address = account?.address;

  const contract = useMemo(() => {
    return getContract({
      client,
      address: CoinsafeDiamondContract.address,
      chain: liskSepolia,
      abi: facetAbis.targetSavingsFacet as Abi,
    });
  }, []); // <-- Only create once

  // Track if we've loaded data at least once
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Track the last fetch time to prevent too frequent refreshes
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Define fetchEmergencySafe inside the callback
  const fetchEmergencySafe = async () => {
    console.log(
      "Fetching emergency safe with supported tokens:",
      supportedTokens
    );

    // // Create a contract instance specifically for emergency savings
    // const emergencyContract = getContract({
    //   client,
    //   address: CoinsafeDiamondContract.address,
    //   chain: liskSepolia,
    //   abi: facetAbis.emergencySavingsFacet as Abi,
    // });

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

  const fetchSafes = useCallback(
    async (force = false) => {
      if (!address) {
        return;
      }

      // Prevent fetching too frequently (at least 5 seconds between any refreshes)
      const now = Date.now();
      if (now - lastFetchTime < 5000) {
        return;
      }

      // Only fetch if we don't already have data or we're forcing a refresh
      if (safes.length > 0 && !force && !isLoading) {
        return;
      }

      // If we're already loading, don't start another fetch
      if (isLoading) {
        return;
      }

      // Only set loading to true on initial load
      if (!initialLoadComplete) {
        setIsLoading(true);
      }
      setError(null);
      setLastFetchTime(now);

      try {
        // First, ensure we have supported tokens
        if (!supportedTokens || supportedTokens.length === 0) {
          console.warn("No supported tokens available, fetching from contract");
        }

        // Get regular safes
        // console.log("Fetching regular safes for address:", address);
        const result = await readContract({
          contract,
          method: resolveMethod("getSafes"),
          params: [],
          from: address,
        });
        // console.log("Regular safes fetched:", result);
        setTargetedSafes(result as SafeDetails[]);

        // Fetch emergency safe
        const emergencySafe = await fetchEmergencySafe();
        // console.log("Emergency safe fetched:", emergencySafe);

        // Combine and update state for both targeted and emergency safes
        setSafes([emergencySafe, ...result] as SafeDetails[]);
      } catch (err: any) {
        setError(err);
        setSafes([]);
      } finally {
        setIsLoading(false);
        setInitialLoadComplete(true);
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
      initialLoadComplete,
      setInitialLoadComplete,
      lastFetchTime,
      setLastFetchTime,
      supportedTokens,
    ]
  );
  
  useEffect(() => {
    fetchSafes(true);
  }, [savingsBalance])
  // Add an effect to monitor supportedTokens changes
  useEffect(() => {
    // console.log("supportedTokens changed in useGetSafes:", supportedTokens);
    // If we have tokens and safes are already loaded, consider refreshing
    if (supportedTokens.length > 0 && safes.length > 0) {
      // Check if emergency safe has token amounts
      const emergencySafe = safes.find((safe) => safe.id === 911n);
      if (
        emergencySafe &&
        (!emergencySafe.tokenAmounts || emergencySafe.tokenAmounts.length === 0)
      ) {
        // console.log("Emergency safe has no token amounts, refreshing...");
        fetchSafes(true); // Force refresh to get emergency safe with tokens
      }
    }
  }, [supportedTokens, safes, fetchSafes]);

  // Only fetch on initial mount, not on every dependency change
  useEffect(() => {
    // This will only run once when the component mounts
    if (safes.length === 0 && !isLoading && address && !initialLoadComplete) {
      fetchSafes(false); // Explicitly pass false to indicate this is not a forced refresh
    }
  }, [address, safes.length, isLoading, fetchSafes, initialLoadComplete]); // Include dependencies to avoid lint warnings

  return {
    safes,
    targetedSafes,
    isLoading,
    isError,
    error,
    fetchSafes,
    refetch: () => fetchSafes(true), // Explicitly pass true to force a refresh
  };
}
