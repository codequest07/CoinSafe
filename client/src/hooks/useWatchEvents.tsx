import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { convertTokenAmountToUsd } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import { Contract } from "ethers";
import { jsonRpcProvider } from "@/lib";

type EventHandler = (amountInUsd: number) => void;
type StreakEventHandler = (streak: number) => void;
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
  onStreakUpdate?: StreakEventHandler;
}

export const useWatchEvents = ({
  address,
  onDeposit,
  onWithdraw,
  onSave,
  onClaim,
  onSavingsWithdrawn,
  onStreakUpdate,
}: UseContractEventsProps) => {
  // Create event handler function
  const createEventHandler = (
    callback?: EventHandler | EventHandlerWithFee | StreakEventHandler
  ) => {
    return async (logs: any) => {
      try {
        console.log("Logs:: ", logs);
        const log = logs[0];
        const { token, amount, fee, type, currentStreak, longestStreak } = log;

        if (type == "streak-event") {
          console.log("Streak event Emitted", log);
          if (currentStreak) {
            (callback as StreakEventHandler)(currentStreak);
          } else if (longestStreak) {
            (callback as StreakEventHandler)(longestStreak);
          } else {
            (callback as StreakEventHandler)(1);
          }
          return;
        }
        
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

  // All event handlers
  const eventHandlers = useMemo(
    () => ({
      deposit: createEventHandler(onDeposit),
      withdraw: createEventHandler(onWithdraw),
      save: createEventHandler(onSave),
      claim: createEventHandler(onClaim),
      savingsWithdrawn: createEventHandler(onSavingsWithdrawn),
      streakUpdate: createEventHandler(onStreakUpdate),
    }),
    [onDeposit, onWithdraw, onSave, onClaim, onSavingsWithdrawn, onStreakUpdate]
  );

  // short helper to handle events
  const handleEvent = (
    user: string,
    callback: (logs: any) => void,
    args: Record<string, any>,
    type?: "streak-event"
  ) => {
    if (user !== address) return;
    callback([{ ...args, type }]);
  };

  // all event mappings
  const eventMappings = [
    // Funding facets events
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

    // Target Savings Events
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
      handler: (user: string, token: string, amount: number, fee: number) =>
        handleEvent(user, eventHandlers.savingsWithdrawn, {
          token,
          amount,
          fee,
        }),
      abi: facetAbis.targetSavingsFacet,
    },

    // Automated savings events
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
      event: "TokenCancelledFromAutomatedPlan",
      handler: (user: string, token: string) =>
        handleEvent(user, eventHandlers.withdraw, { user, token }),
      abi: facetAbis.automatedSavingsFacet,
    },
    {
      event: "AutomatedDurationExtended",
      handler: (user: string, additionalTime: number, isUnlocked: boolean) =>
        handleEvent(user, eventHandlers.withdraw, {
          user,
          additionalTime,
          isUnlocked,
        }),
      abi: facetAbis.automatedSavingsFacet,
    },
    {
      event: "AutomatedPlanTerminated",
      handler: (user: string) =>
        handleEvent(user, eventHandlers.withdraw, { user }),
      abi: facetAbis.automatedSavingsFacet,
    },
    {
      event: "WithdrawalFromAutomatedSafe",
      handler: (user: string, token: string, netAmount: number) =>
        handleEvent(user, eventHandlers.withdraw, { user, token, netAmount }),
      abi: facetAbis.automatedSavingsFacet,
    },
    {
      event: "ClaimedFromAutomatedSafe",
      handler: (user: string, token: string, amount: number) =>
        handleEvent(user, eventHandlers.withdraw, { user, token, amount }),
      abi: facetAbis.automatedSavingsFacet,
    },

    // Emergency Savings events
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

    // Streak events
    {
      event: "StreakIncremented",
      handler: (user: string, currentStreak: number) =>
        handleEvent(
          user,
          eventHandlers.streakUpdate,
          { user, currentStreak },
          "streak-event"
        ),
      abi: facetAbis.automatedSavingsFacet,
    },
    {
      event: "StreakStarted",
      handler: (user: string) =>
        handleEvent(user, eventHandlers.streakUpdate, { user }, "streak-event"),
      abi: facetAbis.automatedSavingsFacet,
    },
    {
      event: "StreakReset",
      handler: (user: string) =>
        handleEvent(user, eventHandlers.streakUpdate, { user }, "streak-event"),
      abi: facetAbis.automatedSavingsFacet,
    },
    {
      event: "LongestStreakUpdated",
      handler: (user: string, longestStreak: number) =>
        handleEvent(
          user,
          eventHandlers.streakUpdate,
          { user, longestStreak },
          "streak-event"
        ),
      abi: facetAbis.automatedSavingsFacet,
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
