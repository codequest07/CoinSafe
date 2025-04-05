import { useCallback, useState } from "react";
import { getContract } from "thirdweb";

import { liskSepolia } from "@/lib/config";
import { client } from "@/lib/config";
import { useReadContract } from "thirdweb/react";
import { CoinsafeDiamondContract, diamondContractAbi, facetAbis } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";
import { Abi } from "viem";

// Types for the transaction history
export interface Transaction {
  // Add your transaction properties here based on your contract's Transaction struct
  // Example:
  id: bigint;
  amount: bigint;
  timestamp: bigint;
  typeOfTransaction: string;
  token: string;
  user: string;
  status: number;

  // ... other fields
}

interface TransactionHistoryParams {
  offset?: number;
  limit?: number;
}

interface TransactionHistoryReturn {
  transactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  hasMore: boolean;
  hasPrevious: boolean;
  currentOffset: number;
  currentLimit: number;
}

export function useTransactionHistory({
  offset = 0,
  limit = 10,
}: TransactionHistoryParams): TransactionHistoryReturn {
  const [currentOffset, setCurrentOffset] = useState(offset);
  const [currentLimit] = useState(limit);
  const account = useActiveAccount();
  const address = account?.address;

  console.log("Diamond Contract Composite Abi", diamondContractAbi);

  // Read contract using wagmi's useReadContract hook
  // const {
  //   data: transactions,
  //   isError,
  //   error,
  //   isLoading,
  //   refetch,
  // } = useReadContract({
  //   address: contractAddress as `0x${string}`,
  //   abi,
  //   functionName: 'getTransactionHistory',
  //   args: [BigInt(currentOffset), BigInt(currentLimit)],
  //   query: {
  //     enabled: Boolean(address), // Only fetch if user is connected
  //   //   staleTime: 30_000, // Consider data stale after 30 seconds
  //   //   cacheTime: 5 * 60_000, // Keep data in cache for 5 minutes
  //   },
  //   account: address,
  // }) as {
  //   data: Transaction[]
  //   isError: boolean
  //   error: Error | null
  //   isLoading: boolean
  //   refetch: () => void
  // }

  const contract = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskSepolia,
    abi: facetAbis.savingsFacet as unknown as Abi,
  });

  const {
    data: transactions,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    contract,
    method:
      "function getTransactionHistory(uint256 offset, uint256 limit) external view returns (LibDiamond.Transaction[] memory)",
    params: [BigInt(currentOffset), BigInt(currentLimit)],
    queryOptions: {
      enabled: Boolean(address),
    },
    from: address,
  }) as unknown as {
    data: Transaction[];
    isError: boolean;
    error: Error | null;
    isLoading: boolean;
    refetch: () => void;
  };

  // Pagination handlers
  const fetchNextPage = useCallback(() => {
    setCurrentOffset((prev) => prev + currentLimit);
  }, [currentLimit]);

  const fetchPreviousPage = useCallback(() => {
    setCurrentOffset((prev) => Math.max(0, prev - currentLimit));
  }, [currentLimit]);

  // Determine if there are more pages
  const hasMore = transactions && transactions.length === currentLimit;
  const hasPrevious = currentOffset > 0;

  return {
    transactions: transactions ?? [],
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    hasMore,
    hasPrevious,
    currentOffset,
    currentLimit,
  };
}
