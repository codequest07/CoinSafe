import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { convertTokenAmountToUsd } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import { Contract } from "ethers";
import { jsonRpcProvider } from "@/lib";

type EventHandler = (amountInUsd: number) => void;

interface UseContractEventsProps {
  onDeposit?: EventHandler;
  onWithdraw?: EventHandler;
  onSave?: EventHandler;
}

export const useWatchEvents = ({
  onDeposit,
  onWithdraw,
  onSave,
}: UseContractEventsProps) => {
  // Main event handler function
  const createEventHandler = (callback?: EventHandler) => {
    return async (logs: any) => {
      try {
        console.log("Logs:::", logs);
        const log = logs[0];
        const { token, amount } = log.args;

        const amountInUsd = await convertTokenAmountToUsd(token, amount);
        if (amountInUsd === 0) return;

        callback?.(amountInUsd);
      } catch (error) {
        console.error("Error processing event logs:", error);
      }
    };
  };

  const saveEventHandler = useMemo(() => createEventHandler(onSave), [onSave]);
  const withdrawEventHandler = useMemo(
    () => createEventHandler(onWithdraw),
    [onWithdraw]
  );
  const depositEventHandler = useMemo(
    () => createEventHandler(onDeposit),
    [onDeposit]
  );

  const handleDeposited = (user: string, token: string, amount: string) => {
    console.log(user);
    const logs = [{ args: { token, amount } }];

    depositEventHandler(logs);
  };

  const handleWithdrawn = (user: string, tokenType: string, amount: number) => {
    console.log(user);

    const logs = [{ args: { token: tokenType, amount } }];

    withdrawEventHandler(logs);
  };

  const handleSaved = (
    user: string,
    token: string,
    amount: number,
    duration: number
  ) => {
    console.log(user, duration);

    const logs = [{ args: { token, amount } }];

    saveEventHandler(logs);
  };

  useEffect(() => {
    const contract = new Contract(
      CoinsafeDiamondContract.address as `0x${string}`, // Address of the contract
      facetAbis.fundingFacet,
      jsonRpcProvider
    );

    contract.on("DepositSuccessful", handleDeposited);

    return () => {
      contract.off("DepositSuccessful", handleDeposited);
    };
  }, []);

  useEffect(() => {
    const contract = new Contract(
      CoinsafeDiamondContract.address as `0x${string}`, // Address of the contract
      facetAbis.targetSavingsFacet,
      jsonRpcProvider
    );

    contract.on("SavedSuccessfully", handleSaved);

    return () => {
      contract.off("SavedSuccessfully", handleSaved);
    };
  }, []);

  useEffect(() => {
    const contract = new Contract(
      CoinsafeDiamondContract.address as `0x${string}`, // Address of the contract
      facetAbis.fundingFacet,
      jsonRpcProvider
    );

    contract.on("Withdrawn", handleWithdrawn);

    return () => {
      contract.off("Withdrawn", handleWithdrawn);
    };
  }, []);
};
