import { useCallback, useState } from "react";
import { getContract, prepareContractCall, resolveMethod } from "thirdweb";
import { client } from "@/lib/config";
import { toBigInt } from "ethers";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import { facetAbis } from "@/lib/contract";
import { Abi } from "viem";
import { getPublicClient } from "@/lib/client";
import { tokenDecimals } from "@/lib/utils";
import { useSmartAccountTransactionInterceptorContext } from "./useSmartAccountTransactionInterceptor";
import { useChainConfig } from "@/hooks/useChainConfig";

interface SaveState {
  token: string;
  target: string;
  amount: number;
  duration: number;
  typeName: string;
  frequency: number;
}

interface CreateAutoSavingsParams {
  address?: `0x${string}`;
  saveState: SaveState;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface CreateAutoSavingsResult {
  createAutoSavings: (e: React.FormEvent) => Promise<void>;
  addTokenToAutoSafe: (e: React.FormEvent) => Promise<void>;
  extendAutoSafe: (e: React.FormEvent) => Promise<void>;
  hasCreatedAutoSafe: (
    supportedTokens: string[]
  ) => Promise<{ hasAutoSafe: boolean; tokens: string[] }>;
  isLoading: boolean;
  error: Error | null;
}

export const useCreateAutoSavings = ({
  address,
  saveState,
  onSuccess,
  onError,
}: CreateAutoSavingsParams): CreateAutoSavingsResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { sendTransaction } = useSmartAccountTransactionInterceptorContext();
  const { chain, diamondAddress } = useChainConfig();

  const account = useActiveAccount();

  const getAmountWithDecimals = (amount: number, token: string): bigint => {
    const decimals = tokenDecimals[token] || tokenDecimals.DEFAULT;

    // Handle the conversion more safely to avoid overflow
    // First convert to string with the correct number of decimal places
    const amountStr = amount.toString();

    // Check if the amount has a decimal point
    if (amountStr.includes(".")) {
      const [whole, fraction] = amountStr.split(".");
      const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
      return toBigInt(whole + paddedFraction);
    } else {
      // If no decimal point, just add zeros
      return toBigInt(amountStr + "0".repeat(decimals));
    }
  };

  const createAutoSavings = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        setIsLoading(true);

        const contract = getContract({
          client,
          chain: chain,
          address: diamondAddress,
          abi: facetAbis.automatedSavingsFacet as Abi,
        });

        // Calculate amount with appropriate decimals
        const amountWithDecimals = getAmountWithDecimals(
          saveState.amount,
          saveState.token
        );

        const transaction = prepareContractCall({
          contract,
          method: resolveMethod("createAutomatedSavingsPlan"),
          params: [
            saveState.token,
            amountWithDecimals,
            toBigInt(saveState.frequency),
            toBigInt(saveState.duration),
          ],
        });

        if (account) {
          await sendTransaction(transaction);

          toast.success("Save successful!");
        }

        onSuccess?.();
      } catch (err) {
        let errorMessage = "An unknown error occurred";

        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message.includes("InsufficientFunds()")) {
            errorMessage =
              "Insufficient funds. Please deposit enough to be able to save.";
          } else if (
            err.message.includes("userAutomatedPlanExistsAlreadyExists()")
          ) {
            errorMessage =
              "You have created an automated savings plan already!";
          } else {
            errorMessage = err.message;
          }
        }

        console.error("Error writing data to contract:", err);
        toast.error("Error writing data to contract");

        const error = new Error(errorMessage);
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [address, saveState, onSuccess, onError, chain, diamondAddress]
  );

  const addTokenToAutoSafe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        setIsLoading(true);

        const contract = getContract({
          client,
          chain: chain,
          address: diamondAddress,
          abi: facetAbis.automatedSavingsFacet as Abi,
        });

        // Calculate amount with appropriate decimals
        const amountWithDecimals = getAmountWithDecimals(
          saveState.amount,
          saveState.token
        );

        const transaction = prepareContractCall({
          contract,
          method: resolveMethod("addTokenToAutomatedPlan"),
          params: [
            saveState.token,
            amountWithDecimals,
            toBigInt(saveState.frequency),
          ],
        });

        if (account) {
          await sendTransaction(transaction);

          toast.success("Add token to Auto Safe successful!");
        }

        onSuccess?.();
      } catch (err) {
        let errorMessage = "An unknown error occurred";

        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message.includes("InsufficientFunds()")) {
            errorMessage =
              "Insufficient funds. Please deposit enough to be able to save.";
          } else if (
            err.message.includes("userAutomatedPlanExistsAlreadyExists()")
          ) {
            errorMessage =
              "You have created an automated savings plan already!";
          } else {
            errorMessage = err.message;
          }
        }

        console.error("Error writing data to contract:", err);
        toast.error("Error writing data to contract");

        const error = new Error(errorMessage);
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [address, saveState, onSuccess, onError, chain, diamondAddress]
  );

  const extendAutoSafe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        setIsLoading(true);

        const contract = getContract({
          client,
          chain: chain,
          address: diamondAddress,
          abi: facetAbis.automatedSavingsFacet as Abi,
        });

        const transaction = prepareContractCall({
          contract,
          method: resolveMethod("extendAutomatedPlanDuration"),
          params: [toBigInt(saveState.duration)],
        });

        if (account) {
          await sendTransaction(transaction);

          toast.error("Extend Automated plan successful!");
        }

        onSuccess?.();
      } catch (err) {
        let errorMessage = "An unknown error occurred";

        // Handle specific error cases
        if (err instanceof Error) {
          if (err.message.includes("Plan is Archived")) {
            errorMessage =
              "Automated savings plan is archived. Please create a new one.";
          } else if (err.message.includes("DurationTooShort()")) {
            errorMessage = "Duration is too short, choose a longer timeline!";
          } else {
            errorMessage = err.message;
          }
        }

        console.error("Error writing data to contract:", err);
        toast.error("Error writing data to contract");

        const error = new Error(errorMessage);
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [address, saveState, onSuccess, onError, chain, diamondAddress]
  );

  const hasCreatedAutoSafe = async (supportedTokens: string[]) => {
    const rawTxs = supportedTokens.map((token) => ({
      address: diamondAddress as `0x${string}`,
      abi: facetAbis.automatedSavingsFacet as Abi,
      functionName: "isAutosaveEnabledForToken",
      args: [address, token],
    }));

    const currentPublicClient = getPublicClient(chain.id);
    const results = await currentPublicClient.multicall({
      contracts: rawTxs,
    });

    console.log(results);

    let hasAutoSafe: boolean = false;
    const tokens: string[] = [];

    results
      .filter(
        ({ status }: { result?: any; status: string; error?: Error }) =>
          status === "success"
      )
      .map(
        (
          { result }: { result?: any; status: string; error?: Error },
          idx: number
        ) => {
          if (result) {
            hasAutoSafe = true;
            tokens.push(supportedTokens[idx]);
          }
        }
      );

    return { hasAutoSafe, tokens };
  };

  return {
    createAutoSavings,
    addTokenToAutoSafe,
    extendAutoSafe,
    hasCreatedAutoSafe,
    isLoading,
    error,
  };
};

