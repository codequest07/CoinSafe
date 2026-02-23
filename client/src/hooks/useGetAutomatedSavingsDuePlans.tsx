import { client } from "@/lib/config";
import { facetAbis } from "@/lib/contract";
import { useMemo } from "react";
import { getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { Abi } from "viem";
import { useChainConfig } from "@/hooks/useChainConfig";

// Custom hook to fetch AutomatedSavingsPlanDetails for a user
export function useGetAutomatedSavingsDuePlans() {
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
    [chain, diamondAddress]
  );

  // Call getAutomatedSafeForUser using useReadContract
  const { data, isLoading, error } = useReadContract({
    contract,
    method: "getAutomatedSavingsDuePlans",
    params: [],
  });

  return {
    duePlanDetails: data as any | undefined,
    isLoading,
    error,
  };
}
