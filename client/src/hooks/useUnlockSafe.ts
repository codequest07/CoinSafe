import { useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client, liskMainnet } from "@/lib/config";
import { toBigInt } from "ethers";
import { toast } from "./use-toast";
import { useRecoilState } from "recoil";
import {
  unlockStateAtom,
  unlockPendingState,
  unlockErrorState,
  unlockSuccessState,
  UnlockState,
} from "@/store/atoms/unlock";
import { tokenDecimals } from "@/lib/utils";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";

// Using the UnlockState interface from the Recoil atom

interface UseUnlockSafeProps {
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseUnlockSafeResult {
  unlockSafe: (e: React.FormEvent) => Promise<any>;
  isPending: boolean;
  error: Error | null;
  isSuccess: boolean;
  setUnlockState: (
    stateOrUpdater: Partial<UnlockState> | ((prev: UnlockState) => UnlockState)
  ) => void;
  resetUnlockState: () => void;
}

export const useUnlockSafe = ({
  coinSafeAddress,
  coinSafeAbi,
  onSuccess,
  onError,
}: UseUnlockSafeProps): UseUnlockSafeResult => {
  // Use Recoil state instead of local state
  const [unlockState, setUnlockState] = useRecoilState(unlockStateAtom);
  const [isPending, setIsPending] = useRecoilState(unlockPendingState);
  const [error, setError] = useRecoilState(unlockErrorState);
  const [isSuccess, setIsSuccess] = useRecoilState(unlockSuccessState);
  const account = useActiveAccount();
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();

  const getAmountWithDecimals = (amount: number, token: string): bigint => {
    // Ensure amount is greater than zero
    if (!amount || amount <= 0) {
      console.error("Attempted to convert zero or negative amount to BigInt");
      throw new Error("Amount must be greater than zero");
    }

    try {
      const decimals = tokenDecimals[token] || tokenDecimals.DEFAULT;

      // Handle the conversion more safely to avoid overflow
      // First convert to string with the correct number of decimal places
      const amountStr = amount.toString();

      // Check if the amount has a decimal point
      if (amountStr.includes(".")) {
        const [whole, fraction] = amountStr.split(".");
        const paddedFraction = fraction
          .padEnd(decimals, "0")
          .slice(0, decimals);
        const result = toBigInt(whole + paddedFraction);

        // Double-check that we didn't end up with zero
        if (result === BigInt(0) && amount > 0) {
          // If amount is very small but non-zero, return at least 1
          return BigInt(1);
        }
        return result;
      } else {
        // If no decimal point, just add zeros
        return toBigInt(amountStr + "0".repeat(decimals));
      }
    } catch (error) {
      console.error("Error converting amount to BigInt:", error);
      // Fallback to a safer method for large numbers
      const decimals = tokenDecimals[token] || tokenDecimals.DEFAULT;
      // Use a more conservative approach for large numbers
      const factor = BigInt(10) ** BigInt(decimals);
      const result = BigInt(Math.floor(amount)) * factor;

      // Double-check that we didn't end up with zero
      if (result === BigInt(0) && amount > 0) {
        // If amount is very small but non-zero, return at least 1
        return BigInt(1);
      }
      return result;
    }
  };

  const unlockSafe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      console.log("Starting unlockSafe process");

      if (!account) {
        console.error("No connected account found");
        const error = new Error("No connected account");
        setError(error);
        onError?.(error);
        return;
      }

      // Get the latest state directly from Recoil with null check
      console.log("Current unlockState:", unlockState);

      if (!unlockState || !unlockState.token || !unlockState.safeId) {
        console.error("Invalid unlock state detected:", {
          state: unlockState,
          token: unlockState?.token,
          safeId: unlockState?.safeId,
        });
        const error = new Error("Invalid unlock state");
        setError(error);
        toast({
          title: "Error",
          description: "Please ensure token and safe ID are set correctly",
          variant: "destructive",
        });
        onError?.(error);
        return;
      }

      const currentState = unlockState;

      // Log the current unlock state for debugging
      console.log("useUnlockSafe - Proceeding with state:", {
        safeId: currentState.safeId,
        token: currentState.token,
        amount: currentState.amount,
        acceptEarlyWithdrawalFee: currentState.acceptEarlyWithdrawalFee,
      });

      // Validate amount is greater than zero
      if (!currentState.amount || currentState.amount <= 0) {
        console.error(
          "useUnlockSafe - Amount validation failed:",
          currentState.amount
        );
        const error = new Error("Amount must be greater than zero");
        setError(error);
        toast({
          title: `Error: Amount must be greater than zero`,
          variant: "destructive",
        });
        onError?.(error);
        return;
      }

      // Validate token and safeId
      if (!currentState.token) {
        const error = new Error("Token is not set in the unlock state");
        setError(error);
        toast({
          title: "Error",
          description: "Please select a valid token to unlock.",
          variant: "destructive",
        });
        onError?.(error);
        return;
      }

      if (!currentState.safeId) {
        const error = new Error("Safe ID is not set in the unlock state");
        setError(error);
        toast({
          title: "Error",
          description: "Safe ID is missing. Please try again.",
          variant: "destructive",
        });
        onError?.(error);
        return;
      }

      setIsPending(true);
      try {
        // Validate token and safeId before preparing the transaction
        if (!currentState.token) {
          throw new Error("Token is null or undefined in the unlock state");
        }

        if (!currentState.safeId) {
          throw new Error("Safe ID is null or undefined in the unlock state");
        }

        // Log the current state for debugging
        console.log("Preparing transaction with state:", {
          safeId: currentState.safeId,
          token: currentState.token,
          amount: currentState.amount,
          acceptFee: currentState.acceptEarlyWithdrawalFee,
        });

        // Ensure token and safeId are valid before proceeding
        if (
          typeof currentState.token !== "string" ||
          currentState.token.trim() === ""
        ) {
          throw new Error("Invalid token value in the unlock state");
        }

        if (
          typeof currentState.safeId !== "number" ||
          currentState.safeId <= 0
        ) {
          throw new Error("Invalid safe ID value in the unlock state");
        }

        const contract = getContract({
          client,
          chain: liskMainnet,
          address: coinSafeAddress,
          abi: coinSafeAbi, // Explicitly provide the ABI
        });

        const amountWithDecimals = getAmountWithDecimals(
          currentState.amount,
          currentState.token
        );

        console.log(
          "Using amount with decimals:",
          amountWithDecimals.toString()
        );

        const transaction = prepareContractCall({
          contract,
          method:
            "function withdrawSavings(uint256 _safeId, address _tokenAddress, uint256 _amount, bool _acceptEarlyWithdrawalFee)",
          params: [
            toBigInt(currentState.safeId),
            currentState.token,
            amountWithDecimals,
            currentState.acceptEarlyWithdrawalFee,
          ],
        });

        console.log("Transaction prepared with params:", {
          safeId: currentState.safeId,
          token: currentState.token,
          amount: amountWithDecimals.toString(),
          acceptFee: currentState.acceptEarlyWithdrawalFee,
        });

        const result = await sendTransaction(transaction);

        toast({
          title: "Unlock successful!",
          variant: "default",
        });

        // Set success state
        setIsSuccess(true);

        // Call onSuccess callback if provided
        onSuccess?.();

        // Reset success state after a delay
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);

        return result;
      } catch (error: any) {
        setError(error);

        console.error("Unlock transaction failed:", error);

        // Create a more user-friendly error message
        let errorMessage = error.message;
        if (
          errorMessage.includes("overflow") ||
          errorMessage.includes("INVALID_ARGUMENT")
        ) {
          errorMessage =
            "The amount is too large. Please try a smaller amount.";
        } else if (errorMessage.toLowerCase().includes("user rejected")) {
          errorMessage = "Transaction was rejected.";
        } else if (errorMessage.includes("AbiErrorSignatureNotFoundError")) {
          // Handle the specific error we're seeing
          if (errorMessage.includes("0x9cf8540c")) {
            errorMessage =
              "The safe is not ready to be unlocked yet or there was an issue with the withdrawal fee.";
          } else {
            errorMessage =
              "There was an issue with the contract interaction. Please try again.";
          }
        } else if (errorMessage.includes("ZeroValueNotAllowed")) {
          errorMessage = "Amount must be greater than zero.";
        }

        toast({
          title: `Error: ${errorMessage}`,
          variant: "destructive",
        });

        onError?.(error);
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [
      account,
      unlockState,
      coinSafeAddress,
      coinSafeAbi,
      onSuccess,
      onError,
      setUnlockState,
    ]
  );

  return {
    unlockSafe,
    isPending,
    error,
    isSuccess,
    // Add methods to update the unlock state
    setUnlockState: (
      stateOrUpdater:
        | Partial<UnlockState>
        | ((prev: UnlockState) => UnlockState)
    ) => {
      if (typeof stateOrUpdater === "function") {
        // If it's a function updater, pass it directly
        setUnlockState(stateOrUpdater);
      } else {
        // If it's a partial state object, merge it with previous state
        setUnlockState((prev) => ({ ...prev, ...stateOrUpdater }));
      }
    },
    resetUnlockState: () => {
      setUnlockState({
        safeId: 0,
        token: "",
        amount: 0,
        acceptEarlyWithdrawalFee: true,
      });
      setError(null);
      setIsPending(false);
      setIsSuccess(false);
    },
  };
};
