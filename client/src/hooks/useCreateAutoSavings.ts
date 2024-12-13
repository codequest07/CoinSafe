import { useCallback, useState } from 'react';
import { 
  useWriteContract,
  useConnect 
} from 'wagmi';
import { waitForTransactionReceipt } from "@wagmi/core";
import { injected } from 'wagmi/connectors';
import { config } from '@/lib/config';
import { liskSepolia } from 'viem/chains';

interface SaveState {
    token: string;
    amount: number;
    duration: number;
    typeName: string;
    frequency: number;
}

interface CreateAutoSavingsParams {
  address?: `0x${string}`;
  saveState: SaveState;
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  chainId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface CreateAutoSavingsResult {
  createAutoSavings: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

type TokenDecimals = {
  [key: string]: number;
};

export const usecreateAutoSavings = ({
  address,
  saveState,
  coinSafeAddress,
  coinSafeAbi,
  onSuccess,
  onError
}: CreateAutoSavingsParams): CreateAutoSavingsResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { connectAsync } = useConnect();
  const { writeContractAsync } = useWriteContract();
//   const { waitForTransactionReceipt } = useWaitForTransactionReceipt();

  const tokenDecimals: TokenDecimals = {
    'USDT': 6,
    'DEFAULT': 18
  };

  const getAmountWithDecimals = (amount: number, token: string): bigint => {
    const decimals = tokenDecimals[token] || tokenDecimals.DEFAULT;
    return BigInt(amount * (10 ** decimals));
  };

  const createAutoSavings = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Connect wallet if not connected
      if (!address) {
        try {
          await connectAsync({
            chainId: liskSepolia.id,
            connector: injected(),
          });
        } catch (error) {
          throw new Error('Failed to connect wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      }

      setIsLoading(true);

      // Calculate amount with appropriate decimals
      const amountWithDecimals = getAmountWithDecimals(saveState.amount, saveState.token);

      // Call save function
      const saveResponse = await writeContractAsync({
        chainId: liskSepolia.id,
        address: coinSafeAddress,
        functionName: "createAutomatedSavingsPlan",
        abi: coinSafeAbi,
        args: [saveState.token, amountWithDecimals, saveState.frequency, saveState.duration],
      });

      if (!saveResponse) {
        throw new Error('Auto Save transaction failed');
      }

      // Wait for transaction confirmation
      const saveReceipt = await waitForTransactionReceipt(config, {
        hash: saveResponse,
      });

      if (saveReceipt.status !== 'success') {
        throw new Error('Create Auto Save transaction was not successful');
      }

      onSuccess?.();

    } catch (err) {
      let errorMessage = 'An unknown error occurred';
      
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('InsufficientFunds()')) {
          errorMessage = 'Insufficient funds. Please deposit enough to be able to save.';
        } else if (err.message.includes('userAutomatedPlanExistsAlreadyExists()')) {
          errorMessage = 'You have created an automated savings plan already!';         
        } 
        else {
          errorMessage = err.message;
        }
      }

      const error = new Error(errorMessage);
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    address,
    saveState,
    coinSafeAddress,
    coinSafeAbi,
    onSuccess,
    onError,
    connectAsync,
    writeContractAsync,
    waitForTransactionReceipt
  ]);

  return {
    createAutoSavings,
    isLoading,
    error
  };
};