import { useCallback, useMemo, useEffect } from "react";
import { getContract, readContract, resolveMethod } from "thirdweb";
import { Abi } from "viem";
import { useRecoilState } from "recoil";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/config";
import { facetAbis } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import {
  safesState,
  safesLoadingState,
  safesErrorState,
  targetedSafesState,
} from "@/store/atoms/safes";
import { supportedTokensState } from "@/store/atoms/balance";
import { getPublicClient } from "@/lib/client";
import { useChainConfig } from "@/hooks/useChainConfig";

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
  feePercentage: number;
  initialShares: Token[];
}

export function useGetSafes() {
  const [, setSafes] = useRecoilState(safesState);
  const [, setTargetedSafes] = useRecoilState(targetedSafesState);
  const [, setIsLoading] = useRecoilState(safesLoadingState);
  const [, setError] = useRecoilState(safesErrorState);
  const [supportedTokens] = useRecoilState(supportedTokensState);

  const account = useActiveAccount();
  const address = account?.address;
  const { chain, diamondAddress } = useChainConfig();

  const contract = useMemo(() => {
    return getContract({
      client,
      address: diamondAddress,
      chain: chain,
      abi: facetAbis.targetSavingsFacet as Abi,
    });
  }, [diamondAddress, chain]);

  const fetchEmergencySafe = useCallback(async () => {
    // Prepare multicall requests
    const rawTxs = supportedTokens.map((token: string) => ({
      address: diamondAddress as `0x${string}`,
      abi: facetAbis.emergencySavingsFacet as Abi,
      args: [address, token],
      functionName: "getEmergencySafeBalance",
    }));

    try {
      const currentPublicClient = getPublicClient(chain.id);
      const results = await currentPublicClient.multicall({
        contracts: rawTxs,
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
  }, [address, chain.id, diamondAddress, supportedTokens]);

  const {
    data: queryData,
    isLoading: queryIsLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["safes", address, chain.id],
    queryFn: async () => {
      if (!address) return [];

      // Get regular safes
      const result = await readContract({
        contract,
        method: resolveMethod("getSafes"),
        params: [],
        from: address,
      });

      // Update targeted safes state directly here if needed, or in useEffect
      const targetedSafesData = result as SafeDetails[];

      // Fetch emergency safe
      const emergencySafe = await fetchEmergencySafe();

      return [emergencySafe, ...targetedSafesData] as SafeDetails[];
    },
    enabled: !!address && supportedTokens.length > 0,
    staleTime: 1000 * 30, // 30 seconds stale time
  });

  // Sync with Recoil state for backward compatibility
  useEffect(() => {
    if (queryData) {
      setSafes(queryData);
      // Extract targeted safes (excluding emergency safe id 911)
      const targeted = queryData.filter((safe) => safe.id !== 911n);
      setTargetedSafes(targeted);
    }
  }, [queryData, setSafes, setTargetedSafes]);

  useEffect(() => {
    setIsLoading(queryIsLoading);
  }, [queryIsLoading, setIsLoading]);

  useEffect(() => {
    setError(queryError as Error | null);
  }, [queryError, setError]);

  return {
    safes: queryData || [],
    targetedSafes: queryData ? queryData.filter((s) => s.id !== 911n) : [],
    isLoading: queryIsLoading,
    isError: !!queryError,
    error: queryError,
    fetchEmergencySafe,
    fetchSafes: refetch, // Alias for refetch
    refetch,
  };
}
