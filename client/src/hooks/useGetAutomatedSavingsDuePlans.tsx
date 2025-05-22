import { client, liskSepolia } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useMemo } from "react";
import { getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { Abi } from "viem";

// Custom hook to fetch AutomatedSavingsPlanDetails for a user
export function useGetAutomatedSavingsDuePlans() {
  // Initialize contract
  const contract = useMemo(
    () =>
      getContract({
        client,
        chain: liskSepolia,
        address: CoinsafeDiamondContract.address, // Replace with your contract address
        abi: facetAbis.automatedSavingsFacet as Abi,
      }),
    []
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
