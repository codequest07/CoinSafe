import { useCallback, useMemo, useState } from "react";
import { getContract, readContract, resolveMethod } from "thirdweb";
import { Abi } from "viem";

import { liskSepolia, client } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useActiveAccount } from "thirdweb/react";

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
  // const [currentOffset, setCurrentOffset] = useState(offset);
  // const [currentLimit] = useState(limit);
  const [safes, setSafes] = useState<SafeDetails[]>([]);
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
      abi: facetAbis.targetSavingsFacet as Abi,
    });
  }, []); // <-- Only create once

  const fetchSafes = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      console.log("fetching safes");

      const result = await readContract({
        contract,
        // @ts-expect-error type error
        method: resolveMethod("getSafes"),
        params: [],
      });

      console.log('====================================');
      console.log('Safes:', result);
      console.log('====================================');

      setSafes(result as SafeDetails[]);

    } catch (err: any) {

      console.error("Transaction fetch failed:", err);
      setIsError(true);
      setError(err);
      setSafes([]);

    } finally {
      setIsLoading(false);
    }
  }, [contract, address]);

  // useEffect(() => {
  //   fetchSafes();
  // }, [fetchSafes]);

  return {
    safes,
    isLoading,
    isError,
    error,
    fetchSafes,
    refetch: fetchSafes
  };
}
