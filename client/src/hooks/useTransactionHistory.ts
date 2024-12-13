import { useCallback, useState } from 'react'
import { 
  useReadContract,
  useAccount,
} from 'wagmi'

// Types for the transaction history
export interface Transaction {
  // Add your transaction properties here based on your contract's Transaction struct
  // Example:
  id: bigint
  amount: bigint
  timestamp: bigint
  typeOfTransaction: string
  token: string
  user: string
  status: number

  // ... other fields
}

interface TransactionHistoryParams {
  contractAddress: string
  abi: any // Replace with your contract's ABI type
  offset?: number
  limit?: number
}

interface TransactionHistoryReturn {
  transactions: Transaction[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
  fetchNextPage: () => void
  fetchPreviousPage: () => void
  hasMore: boolean
  hasPrevious: boolean
  currentOffset: number
  currentLimit: number
}

export function useTransactionHistory({
  contractAddress,
  abi,
  offset = 0,
  limit = 10,
}: TransactionHistoryParams): TransactionHistoryReturn {
  const [currentOffset, setCurrentOffset] = useState(offset)
  const [currentLimit] = useState(limit)
  const { address } = useAccount()

  // Read contract using wagmi's useReadContract hook
  const {
    data: transactions,
    isError,
    error,
    isLoading,
    refetch,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi,
    functionName: 'getTransactionHistory',
    args: [BigInt(currentOffset), BigInt(currentLimit)],
    query: {
      enabled: Boolean(address), // Only fetch if user is connected
    //   staleTime: 30_000, // Consider data stale after 30 seconds
    //   cacheTime: 5 * 60_000, // Keep data in cache for 5 minutes
    },
    account: address,
  }) as {
    data: Transaction[]
    isError: boolean
    error: Error | null
    isLoading: boolean
    refetch: () => void
  }

  // Pagination handlers
  const fetchNextPage = useCallback(() => {
    setCurrentOffset((prev) => prev + currentLimit)
  }, [currentLimit])

  const fetchPreviousPage = useCallback(() => {
    setCurrentOffset((prev) => Math.max(0, prev - currentLimit))
  }, [currentLimit])

  // Determine if there are more pages
  const hasMore = transactions && transactions.length === currentLimit
  const hasPrevious = currentOffset > 0

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
  }
}