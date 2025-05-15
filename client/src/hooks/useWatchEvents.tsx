import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { convertTokenAmountToUsd } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import { Contract } from "ethers";
import { jsonRpcProvider } from "@/lib";

type EventHandler = (amountInUsd: number) => void;
type EventHandlerWithFee = (
  amountInUsdToDeduct: number,
  amountInUsdToAdd: number
) => void;

interface UseContractEventsProps {
  address: string;
  onDeposit?: EventHandler;
  onWithdraw?: EventHandler;
  onSave?: EventHandler;
  onClaim?: EventHandler;
  onSavingsWithdrawn?: EventHandlerWithFee;
}

export const useWatchEvents = ({
  address,
  onDeposit,
  onWithdraw,
  onSave,
  onClaim,
  onSavingsWithdrawn,
}: UseContractEventsProps) => {
  const createEventHandler = (
    callback?: EventHandler | EventHandlerWithFee
  ) => {
    return async (logs: any) => {
      try {
        const log = logs[0];
        const { token, amount, fee } = log.args;

        const amountInUsd = await convertTokenAmountToUsd(token, amount);
        if (amountInUsd === 0) return;

        if (callback && callback.length === 2) {
          const amountInUsdToDeduct = await convertTokenAmountToUsd(
            token,
            fee || 0
          );
          (callback as EventHandlerWithFee)?.(amountInUsdToDeduct, amountInUsd);
        } else {
          (callback as EventHandler)?.(amountInUsd);
        }
      } catch (error) {
        console.error("Error processing event logs:", error);
      }
    };
  };

  const eventHandlers = useMemo(
    () => ({
      deposit: createEventHandler(onDeposit),
      withdraw: createEventHandler(onWithdraw),
      save: createEventHandler(onSave),
      claim: createEventHandler(onClaim),
      savingsWithdrawn: createEventHandler(onSavingsWithdrawn),
    }),
    [onDeposit, onWithdraw, onSave, onClaim, onSavingsWithdrawn]
  );

  const handleEvent = (
    user: string,
    callback: (logs: any) => void,
    args: Record<string, any>
  ) => {
    if (user !== address) return;
    callback([{ args }]);
  };

  const eventMappings = [
    {
      event: "DepositSuccessful",
      handler: (user: string, token: string, amount: string) =>
        handleEvent(user, eventHandlers.deposit, { token, amount }),
      abi: facetAbis.fundingFacet,
    },
    {
      event: "Withdrawn",
      handler: (user: string, token: string, amount: number) =>
        handleEvent(user, eventHandlers.withdraw, { token, amount }),
      abi: facetAbis.fundingFacet,
    },
    {
      event: "SavedSuccessfully",
      handler: (user: string, token: string, amount: number) =>
        handleEvent(user, eventHandlers.save, { token, amount }),
      abi: facetAbis.targetSavingsFacet,
    },
    {
      event: "TopUpSuccessful",
      handler: (user: string, _: number, token: string, amount: number) =>
        handleEvent(user, eventHandlers.save, { token, amount }),
      abi: facetAbis.targetSavingsFacet,
    },
    {
      event: "ClaimSuccessful",
      handler: (user: string, token: string, amount: number) =>
        handleEvent(user, eventHandlers.claim, { token, amount }),
      abi: facetAbis.targetSavingsFacet,
    },
    {
      event: "SavingsWithdrawn",
      handler: (
        user: string,
        token: string,
        amount: number,
        fee: number
      ) =>
        handleEvent(user, eventHandlers.savingsWithdrawn, {
          token,
          amount,
          fee,
        }),
      abi: facetAbis.targetSavingsFacet,
    },
    {
      event: "AutomatedPlanUpdated",
      handler: (user: string, token: string, amount: number) =>
        handleEvent(user, eventHandlers.save, { token, amount }),
      abi: facetAbis.automatedSavingsFacet,
    },
    {
      event: "AutomatedPlanCreated",
      handler: (user: string, token: string, amount: number) =>
        handleEvent(user, eventHandlers.save, { token, amount }),
      abi: facetAbis.automatedSavingsFacet,
    },
    {
      event: "SavedToEmergencySuccessfully",
      handler: (user: string, token: string, amount: number) =>
        handleEvent(user, eventHandlers.save, { token, amount }),
      abi: facetAbis.emergencySavingsFacet,
    },
    {
      event: "EmergencyWithdrawalExecuted",
      handler: (user: string, token: string, amount: number) =>
        handleEvent(user, eventHandlers.withdraw, { token, amount }),
      abi: facetAbis.emergencySavingsFacet,
    },
  ];

  useEffect(() => {
    const contracts = eventMappings.map(({ event, handler, abi }) => {
      const contract = new Contract(
        CoinsafeDiamondContract.address as `0x${string}`,
        abi,
        jsonRpcProvider
      );
      contract.on(event, handler);
      return { contract, event, handler };
    });

    return () => {
      contracts.forEach(({ contract, event, handler }) =>
        contract.off(event, handler)
      );
    };
  }, [eventHandlers]);
};
