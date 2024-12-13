import { useCallback, useState } from "react";
import { useWriteContract, useConnect } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { injected } from "wagmi/connectors";
import { liskSepolia } from "viem/chains";
import { config } from "@/lib/config";
import { readContract } from '@wagmi/core'
import { CoinSafeContract } from "@/lib/contract";

export interface ScheduledSaving {
  token: string;
  amount: number;
  scheduledDate: number;
}

interface ScheduledSavingsResult {
  scheduledSavings: ScheduledSaving[];
  isLoading: boolean;
  error: Error | null;
}

export const useGetScheduledSavings = (): ScheduledSavingsResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  let scheduledSavings: ScheduledSaving[] = [];

  async function fetchResult() {
      const result = await readContract(config, {
        abi: CoinSafeContract.abi.abi,
        address: CoinSafeContract.address as `0x${string}`,
        functionName: 'getScheduledSavings',
      });

      console.log(result);
      
  }



  return {
    scheduledSavings,
    isLoading,
    error,
  };
};
