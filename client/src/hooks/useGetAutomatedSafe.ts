import { client } from "@/lib/config";
import { facetAbis } from "@/lib/contract";
import { useMemo } from "react";
import { getContract, readContract } from "thirdweb";
import { Abi } from "viem";
import { useChainConfig } from "@/hooks/useChainConfig";
import { useQuery } from "@tanstack/react-query";

// Custom hook to fetch AutomatedSavingsPlanDetails for a user
export function useAutomatedSafeForUser(userAddress: `0x${string}`) {
  const { chain, diamondAddress } = useChainConfig();

  // Initialize contract
  const contract = useMemo(
    () =>
      getContract({
        client,
        chain: chain,
        address: diamondAddress, // Replace with your contract address
        abi: facetAbis.automatedSavingsFacet as Abi,
      }),
    [chain, diamondAddress],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["automatedSafe", userAddress, chain.id],
    queryFn: async () => {
      if (!userAddress) return null;
      return await readContract({
        contract,
        method: "getAutomatedSafeForUser",
        params: [userAddress],
      });
    },
    enabled: !!userAddress,
  });

  return {
    details: data as any | undefined,
    isLoading,
    error,
    refetch,
  };
}
