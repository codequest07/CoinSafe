import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client, liskSepolia } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { Abi } from "viem";

interface Token {
  token: string;
  amount: bigint;
}

interface ClaimableBalanceResult {
  balances: Token[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useClaimableBalanceAutomatedSafe = (): ClaimableBalanceResult => {
  const contract = getContract({
    client,
    chain: liskSepolia,
    address: CoinsafeDiamondContract.address,
    abi: facetAbis.automatedSavingsFacet as Abi,
  });

  const { data, isLoading, error, refetch } = useReadContract({
    contract,
    method:
      "function claimableBalanceAutomatedSafe() view returns ((address token, uint256 amount)[])",
    params: [],
  });

  //   console.log("claimableBalanceAutomatedSafe data:", data);

  const balances: Token[] = data
    ? data.map((item: { token: string; amount: bigint }) => ({
        token: item.token,
        amount: item.amount,
      }))
    : [];

  return {
    balances,
    isLoading,
    error,
    refetch,
  };
};
