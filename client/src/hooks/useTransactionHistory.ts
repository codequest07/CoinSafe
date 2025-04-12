import { useCallback, useEffect, useMemo, useState } from "react";
import { getContract, readContract, resolveMethod } from "thirdweb";
import { Abi } from "viem";

import { liskSepolia, client } from "@/lib/config";
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
      chain: liskSepolia,
      abi: facetAbis.fundingFacet as Abi,
    });
  }, []); // <-- Only create once

  const fetchTransactions = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      console.log('====================================');
      console.log("trying to fetch transactions");
      console.log('====================================');
      const result = await readContract({
        contract,
        // @ts-expect-error type error
        method: resolveMethod("getTransactionHistory"),
        params: [address, BigInt(currentOffset), BigInt(currentLimit)],
      });

      console.log('====================================');
      console.log('Transaction History:', result);
      console.log('====================================');
      setTransactions(result as Transaction[]);
    } catch (err: any) {
      console.error("Transaction fetch failed:", err);
      setIsError(true);
      setError(err);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [contract, address, currentOffset, currentLimit]);

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
