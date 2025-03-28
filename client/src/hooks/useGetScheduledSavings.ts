import { useEffect, useState } from "react";
import { getContract } from "thirdweb";
import { liskSepolia } from "@/lib/config";
import { client } from "@/lib/config";
import { useReadContract } from "thirdweb/react";
import { CoinsafeDiamondContract, tokens } from "@/lib/contract";
import { formatUnits } from "viem";
import { getSafuToUsd } from "@/lib";
import { useActiveAccount } from "thirdweb/react";

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
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;
  const [scheduledSavings, setScheduledSavings] = useState<ScheduledSaving[]>(
    []
  );
  const [error, setError] = useState<Error | null>(null);

  const contract = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskSepolia,
  });

  const { data: result, isLoading } = useReadContract({
    contract,
    method:
      "function getScheduledSavings() external view returns (LibDiamond.ScheduledSaving[] memory)",
    queryOptions: {
      enabled: Boolean(address),
    },
    from: address,
  });

  useEffect(() => {
    async function run() {
      console.log("====================================");
      console.log("Runningggggggg");
      console.log("====================================");

      if (isConnected) {
        try {
          console.log("====================================");
          console.log("Tryingggg");
          console.log("====================================");
          console.log(result);
          if (result) {
            console.log("====================================");
            console.log();
            console.log("====================================");
            console.log(result);
            const scheduledSavingsRes = await transformArrayData(result as []);
            setScheduledSavings(
              scheduledSavingsRes.filter(
                (item) => item.scheduledDate >= new Date().getTime()
              )
            );
          }
        } catch (err: any) {
          setError(err);
        }
      }
    }
    run();
  }, [isConnected, result]);

  return {
    scheduledSavings,
    isLoading,
    error,
  };
};
