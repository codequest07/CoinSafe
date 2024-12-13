import { useEffect, useState } from "react";
// import { useWriteContract, useConnect } from "wagmi";
// import { waitForTransactionReceipt } from "@wagmi/core";
// import { injected } from "wagmi/connectors";
// import { liskSepolia } from "viem/chains";
import { config } from "@/lib/config";
import { readContract } from "@wagmi/core";
import { CoinSafeContract, tokens } from "@/lib/contract";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { getSafuToUsd } from "@/lib";

export interface ScheduledSaving {
  token: string;
  amount: string;
  scheduledDate: number;
  value: number;
}

interface ScheduledSavingsResult {
  scheduledSavings: ScheduledSaving[];
  isLoading: boolean;
  error: Error | null;
}

export function transformArrayData(
  data: Array<{ token: string; amount: bigint; scheduledDate: bigint }>
): ScheduledSaving[] {
  // Create a token mapping for quick lookup
  const tokenMap = Object.entries(tokens).reduce<Record<string, string>>(
    (map, [key, address]) => {
      map[address.toLowerCase()] = key; // Lowercase the address for case-insensitive comparison
      return map;
    },
    {}
  );

  return data.map((item) => ({
    token: tokenMap[item.token.toLowerCase()] || "unknown", // Map token address to name
    amount: formatUnits(item.amount, 18), // Convert BigInt to number
    scheduledDate: Number(item.scheduledDate) * 1000, // Convert seconds to milliseconds
    value: getSafuToUsd(Number(formatUnits(item.amount, 18))),
  }));
}

export const useGetScheduledSavings = (): ScheduledSavingsResult => {
  const { isConnected, address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledSavings, setScheduledSavings] = useState<ScheduledSaving[]>(
    []
  );
  const [error, setError] = useState<Error | null>(null);

  async function fetchResult() {
    const result = (await readContract(config, {
      abi: CoinSafeContract.abi.abi,
      address: CoinSafeContract.address as `0x${string}`,
      functionName: "getScheduledSavings",
      account: address,
    })) as Array<{ token: string; amount: bigint; scheduledDate: bigint }>;
    console.log("Scheduled Savings fetched: ", result);
    return result;
  }

  useEffect(() => {
    async function run() {
      if (isConnected) {
        try {
          setIsLoading(true);
          const result = await fetchResult();
          console.log("Before", result, scheduledSavings);
          const scheduledSavingsRes = await transformArrayData(result);
          setScheduledSavings(scheduledSavingsRes);
          console.log("After", result, scheduledSavingsRes);
          setIsLoading(false);
        } catch (err: any) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    run();
    console.log("Scheduled Savings", scheduledSavings);
  }, [isConnected]);

  return {
    scheduledSavings,
    isLoading,
    error,
  };
};
