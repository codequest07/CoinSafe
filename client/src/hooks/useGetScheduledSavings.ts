import { useEffect, useState } from "react";
import { getContract, resolveMethod } from "thirdweb";
import { liskSepolia } from "@/lib/config";
import { client } from "@/lib/config";
import { useReadContract } from "thirdweb/react";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { Abi, formatUnits } from "viem";
import { useActiveAccount } from "thirdweb/react";
import { convertTokenAmountToUsd } from "@/lib/utils";

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

export async function transformArrayData(
  data: Array<{ token: string; amount: bigint; scheduledDate: bigint }>
): Promise<ScheduledSaving[]> {
  if (!data || data.length === 0) return [];
  return Promise.all(
    data.map(async (item) => ({
      token: item.token, 
      amount: formatUnits(item.amount, 18), 
      scheduledDate: Number(item.scheduledDate) * 1000,
      value: await convertTokenAmountToUsd(item.token, item.amount),
    }))
  );
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
    abi: facetAbis.automatedSavingsFacet as Abi,
  });

  const { data: result, isLoading } = useReadContract({
    contract,
    method: resolveMethod("getScheduledSavings"),
    params: [address, 4],
  });

  useEffect(() => {
    async function run() {
      console.log("====================================");
      console.log("Runningggggggg");
      console.log("====================================");
      if (!isConnected || !result) return;
      try {
        console.log("====================================");
        console.log("Tryingggg");
        console.log("====================================");
        console.log(result);
        if (result) {
          const scheduledSavingsRes = await transformArrayData(result as []);
          console.log("Scheduled savings res from contract already transformed", scheduledSavingsRes);
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
    run();
  }, [isConnected, result]);

  return {
    scheduledSavings,
    isLoading,
    error,
  };
};
