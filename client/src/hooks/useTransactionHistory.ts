import { useCallback, useEffect, useMemo, useState } from "react";
import { getContract, readContract, resolveMethod } from "thirdweb";
import { Abi } from "viem";

import { liskMainnet, client } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";

export interface Transaction {
  id: bigint;
  amount: bigint;
  timestamp: bigint;
  typeOfTransaction: string;
  token: string;
  user: string;
  status: number;
}

interface TransactionHistoryParams {
  offset?: number;
  limit?: number;
  safeId?: number;
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
  safeId,
}: TransactionHistoryParams): TransactionHistoryReturn {
  const [currentOffset, setCurrentOffset] = useState(offset);
  const [currentLimit] = useState(limit);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const account = useActiveAccount();
  const address = account?.address;

  const contract = useMemo(() => {
    return getContract({
      client,
      address: CoinsafeDiamondContract.address,
      chain: liskMainnet,
      abi: facetAbis.fundingFacet as Abi,
    });
  }, []); // <-- Only create once

  const fetchTransactions = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await readContract({
        contract,
        method: resolveMethod("getTransactionHistory"),
        params: [address, BigInt(currentOffset), BigInt(currentLimit)],
      });

      // Filter transactions by safeId if provided
      let filteredTransactions = result as Transaction[];
      if (safeId !== undefined) {
        filteredTransactions = filteredTransactions.filter((tx) => {
          return (
            tx.typeOfTransaction.toLowerCase().includes("save") ||
            tx.typeOfTransaction.toLowerCase().includes("topup")
          );
        });
      }

      setTransactions(filteredTransactions);
    } catch (err: any) {
      setIsError(true);
      setError(err);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, currentOffset, currentLimit, safeId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchNextPage = useCallback(() => {
    setCurrentOffset((prev) => prev + currentLimit);
  }, [currentLimit]);

  const fetchPreviousPage = useCallback(() => {
    setCurrentOffset((prev) => Math.max(0, prev - currentLimit));
  }, [currentLimit]);

  const hasMore = transactions.length === currentLimit;
  const hasPrevious = currentOffset > 0;

  return {
    transactions,
    isLoading,
    isError,
    error,
    refetch: fetchTransactions,
    fetchNextPage,
    fetchPreviousPage,
    hasMore,
    hasPrevious,
    currentOffset,
    currentLimit,
  };
}
