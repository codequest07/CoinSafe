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
} from "@/store/atoms/safes";
import { supportedTokensState } from "@/store/atoms/balance";
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
  const [isLoading, setIsLoading] = useRecoilState(safesLoadingState);
  const [error, setError] = useRecoilState(safesErrorState);
  const [supportedTokens] = useRecoilState(supportedTokensState);
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

  // const emergencySavingsFacet = useMemo(() => {
  //   return getContract({
  //     client,
  //     address: CoinsafeDiamondContract.address,
  //     chain: liskSepolia,
  //     abi: facetAbis.emergencySavingsFacet as Abi,
  //   });
  // }, []);

  // Track if we've loaded data at least once
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Track the last fetch time to prevent too frequent refreshes
  const [lastFetchTime, setLastFetchTime] = useState(0);

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
        const result = await readContract({
          contract,
          method: resolveMethod("getSafes"),
          params: [],
          from: address,
        });

        // Define fetchEmergencySafe inside the callback
        const fetchEmergencySafe = async () => {
          const rawTxs = supportedTokens.map((token: string) => ({
            address: CoinsafeDiamondContract.address,
            abi: facetAbis.emergencySavingsFacet as Abi,
            args: [address, token],
            functionName: "getEmergencySafeBalance",
          }));

          const results = await publicClient.multicall({
            contracts: rawTxs,
            chain: liskSepolia,
          });

          const tokenAmounts: Token[] = results
            .filter(({ status }: { status: string }) => status === "success")
            .map(({ result }: { result: any }, idx: number) => ({
              token: supportedTokens[idx],
              amount: result,
            }));

          return {
            id: 911n,
            target: "Emergency Safe",
            duration: 0n,
            startTime: 0n,
            unlockTime: 0n,
            tokenAmounts,
          };
        };

        const emergencySafe = await fetchEmergencySafe();

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

  // Only fetch on initial mount, not on every dependency change
  useEffect(() => {
    // This will only run once when the component mounts
    if (safes.length === 0 && !isLoading && address && !initialLoadComplete) {
      fetchSafes(false); // Explicitly pass false to indicate this is not a forced refresh
    }
  }, [
    address,
    safes.length,
    isLoading,
    fetchSafes,
    initialLoadComplete,
    supportedTokens,
  ]); // Include dependencies to avoid lint warnings

  return {
    safes,
    isLoading,
    isError,
    error,
    fetchSafes,
    refetch: () => fetchSafes(true), // Explicitly pass true to force a refresh
  };
}
