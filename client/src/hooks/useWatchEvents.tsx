import { facetAbis } from "@/lib/contract";
import { convertTokenAmountToUsd } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Interface, JsonRpcProvider, LogDescription } from "ethers";
import { useChainConfig } from "@/hooks/useChainConfig";

type EventHandler = (amountInUsd: number) => void;
type StreakEventHandler = (streak: number) => void;
type EventHandlerWithFee = (
  amountInUsdToDeduct: number,
  amountInUsdToAdd: number,
) => void;
type SwapEventHandler = (
  tokenIn: string,
  tokenOut: string,
  amountInUsd: number,
  amountOutUsd: number,
) => void;

interface UseContractEventsProps {
  address: string;
  onDeposit?: EventHandler;
  onWithdraw?: EventHandler;
  onSave?: EventHandler;
  onClaim?: EventHandler;
  onSavingsWithdrawn?: EventHandlerWithFee;
  onStreakUpdate?: StreakEventHandler;
  onSwap?: SwapEventHandler;
}

// Build a combined ABI Interface from all facets (done once at module level)
const allAbis = Object.values(facetAbis).flatMap((abi: any) => {
  const abiArray = abi?.abi || abi;
  return Array.isArray(abiArray) ? abiArray : [];
});
const combinedInterface = new Interface(allAbis);

// Map event names to the callback ref key and processing type
type EventConfig = {
  callbackKey: string;
  type: "standard" | "withFee" | "streak" | "swap";
  indices?: number[];
};

const EVENT_CONFIGS: Record<string, EventConfig> = {
  // Funding
  DepositSuccessful: { callbackKey: "deposit", type: "standard" },
  Withdrawn: { callbackKey: "withdraw", type: "standard" },
  // Target Savings
  SavedSuccessfully: { callbackKey: "save", type: "standard" },
  TopUpSuccessful: { callbackKey: "save", type: "standard", indices: [2, 3] }, // user, id, token, amount
  ClaimSuccessful: { callbackKey: "claim", type: "standard" },
  SavingsWithdrawn: {
    callbackKey: "savingsWithdrawn",
    type: "withFee",
    indices: [1, 2, 3],
  }, // user, token, amount, fee
  // Automated savings
  AutomatedPlanUpdated: { callbackKey: "save", type: "standard" },
  AutomatedPlanCreated: { callbackKey: "save", type: "standard" },
  TokenCancelledFromAutomatedPlan: {
    callbackKey: "withdraw",
    type: "standard",
    indices: [1, -1],
  }, // user, token. No amount (-1)
  AutomatedDurationExtended: {
    callbackKey: "withdraw",
    type: "standard",
    indices: [-1, -1],
  }, // user, time, unlocked. No token/amount
  AutomatedPlanTerminated: {
    callbackKey: "withdraw",
    type: "standard",
    indices: [-1, -1],
  }, // user only
  WithdrawalFromAutomatedSafe: { callbackKey: "withdraw", type: "standard" },
  ClaimedFromAutomatedSafe: { callbackKey: "withdraw", type: "standard" },
  // Emergency
  SavedToEmergencySuccessfully: { callbackKey: "save", type: "standard" },
  EmergencyWithdrawalExecuted: { callbackKey: "withdraw", type: "standard" },
  // Streaks
  StreakIncremented: { callbackKey: "streakUpdate", type: "streak" },
  StreakStarted: { callbackKey: "streakUpdate", type: "streak" },
  StreakReset: { callbackKey: "streakUpdate", type: "streak" },
  LongestStreakUpdated: { callbackKey: "streakUpdate", type: "streak" },
  // Swap
  SwapExecuted: { callbackKey: "swap", type: "swap" },
};

export const useWatchEvents = ({
  address,
  onDeposit,
  onWithdraw,
  onSave,
  onClaim,
  onSavingsWithdrawn,
  onStreakUpdate,
  onSwap,
}: UseContractEventsProps) => {
  const { chain, diamondAddress } = useChainConfig();

  // Use refs so the polling loop always has the latest callbacks
  // without needing to re-subscribe
  const callbackRefs = useRef({
    deposit: onDeposit,
    withdraw: onWithdraw,
    save: onSave,
    claim: onClaim,
    savingsWithdrawn: onSavingsWithdrawn,
    streakUpdate: onStreakUpdate,
    swap: onSwap,
  });

  useEffect(() => {
    callbackRefs.current = {
      deposit: onDeposit,
      withdraw: onWithdraw,
      save: onSave,
      claim: onClaim,
      savingsWithdrawn: onSavingsWithdrawn,
      streakUpdate: onStreakUpdate,
      swap: onSwap,
    };
  }, [
    onDeposit,
    onWithdraw,
    onSave,
    onClaim,
    onSavingsWithdrawn,
    onStreakUpdate,
    onSwap,
  ]);

  const addressRef = useRef(address);
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  useEffect(() => {
    const rpcVal = chain?.rpc;
    const rpcUrl = Array.isArray(rpcVal)
      ? rpcVal[0]
      : rpcVal || "https://rpc.api.lisk.com";
    if (!diamondAddress || !rpcUrl) return;

    let cleanedUp = false;
    let lastBlockChecked = 0;

    let provider: JsonRpcProvider;
    try {
      const chainId = chain?.id || 1135;
      provider = new JsonRpcProvider(rpcUrl, chainId, { staticNetwork: true });
    } catch (e) {
      console.error("Failed to initialize provider:", e);
      return;
    }

    const processLog = async (parsed: LogDescription) => {
      const eventName = parsed.name;
      const config = EVENT_CONFIGS[eventName];
      if (!config) return;

      const callbacks = callbackRefs.current;
      const userAddress = addressRef.current;
      const cb = (callbacks as any)[config.callbackKey];
      if (!cb) return;

      // Extract user from first arg (convention across all events)
      const user = parsed.args[0] as string;
      if (user.toLowerCase() !== userAddress.toLowerCase()) return;

      try {
        const indices = config.indices || [1, 2];

        switch (config.type) {
          case "standard": {
            const tokenIdx = indices[0];
            const amountIdx = indices[1];

            let token: string | undefined;
            let amount: bigint | undefined;

            if (tokenIdx >= 0) token = parsed.args[tokenIdx];
            if (amountIdx >= 0) amount = parsed.args[amountIdx];

            // If we have token, we can convert. If amount is missing, assume 0 (helpful for pure invalidations)
            if (token) {
              const amountVal = amount || 0n;
              const amountInUsd = await convertTokenAmountToUsd(
                token,
                amountVal,
              );
              if (amountInUsd === 0 && amountVal > 0n) return; // Only return if conversion failed for non-zero amount
              cb(amountInUsd);
            } else if (amountIdx === -1 && tokenIdx === -1) {
              // Special case like AutomatedPlanTerminated - just trigger callback with 0 to invalidate
              cb(0);
            }
            break;
          }
          case "withFee": {
            const token = parsed.args[indices[0]] as string;
            const amount = parsed.args[indices[1]] as bigint;
            const fee = parsed.args[indices[2]!] as bigint;

            if (!token) break;
            const amountInUsd = await convertTokenAmountToUsd(token, amount);
            const feeInUsd = await convertTokenAmountToUsd(token, fee || 0n);

            // Trigger even if 0 to ensure invalidation?
            // Previous logic: if (amountInUsd === 0) return;
            // Let's stick to safe logic
            if (amountInUsd === 0 && amount > 0n) return;

            (cb as EventHandlerWithFee)(feeInUsd, amountInUsd);
            break;
          }
          case "streak": {
            const currentStreak = parsed.args["currentStreak"];
            const longestStreak = parsed.args["longestStreak"];
            if (currentStreak !== undefined) {
              (cb as StreakEventHandler)(Number(currentStreak));
            } else if (longestStreak !== undefined) {
              (cb as StreakEventHandler)(Number(longestStreak));
            } else {
              (cb as StreakEventHandler)(1);
            }
            break;
          }
          case "swap": {
            // Swap has fixed structure usually
            const tokenIn = parsed.args["tokenIn"] || parsed.args[1];
            const tokenOut = parsed.args["tokenOut"] || parsed.args[2];
            const amountIn = parsed.args["amountIn"] || parsed.args[3];
            const amountOut = parsed.args["amountOut"] || parsed.args[4];

            const amountInUsd = await convertTokenAmountToUsd(
              tokenIn,
              amountIn,
            );
            const amountOutUsd = await convertTokenAmountToUsd(
              tokenOut,
              amountOut,
            );

            if (amountInUsd === 0 && amountOutUsd === 0) return;
            (cb as SwapEventHandler)(
              tokenIn,
              tokenOut,
              amountInUsd,
              amountOutUsd,
            );
            break;
          }
        }
      } catch (err) {
        console.error(`Error processing ${eventName} event:`, err);
      }
    };

    const pollForEvents = async () => {
      if (cleanedUp) return;
      try {
        const currentBlock = await provider.getBlockNumber();
        if (lastBlockChecked === 0) {
          // First poll: start watching from current block forward
          lastBlockChecked = currentBlock;
          return;
        }
        if (currentBlock <= lastBlockChecked) return;

        const fromBlock = lastBlockChecked + 1;
        const toBlock = currentBlock;
        lastBlockChecked = currentBlock;

        // SINGLE RPC call to get ALL logs from the diamond contract
        console.log(
          `Polling events for ${diamondAddress} from block ${fromBlock} to ${toBlock}...`,
        );

        let logs;
        try {
          logs = await provider.getLogs({
            address: diamondAddress,
            fromBlock,
            toBlock,
          });
        } catch (e) {
          console.error("RPC getLogs failed:", e);
          return;
        }

        if (logs && logs.length > 0) {
          // Parse all logs against the combined interface
          for (const log of logs) {
            if (cleanedUp) return;
            try {
              const parsed = combinedInterface.parseLog({
                topics: log.topics as string[],
                data: log.data,
              });
              if (parsed && EVENT_CONFIGS[parsed.name]) {
                await processLog(parsed);
              }
            } catch {
              // Log doesn't match any known event - skip
            }
          }
        }
      } catch (err) {
        // Silently handle errors (network issues, etc.)
        console.warn("Event polling cycle error:", err);
      }
    };

    // Poll every 10 seconds
    const pollingInterval = setInterval(pollForEvents, 10000);
    // Initial poll after short delay
    const initialTimeout = setTimeout(pollForEvents, 1000);

    return () => {
      cleanedUp = true;
      clearInterval(pollingInterval);
      clearTimeout(initialTimeout);
    };
  }, [chain, diamondAddress]); // Restore chain dependency
};
