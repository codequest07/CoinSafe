import { useCallback, useState } from 'react';
import { 
  useWriteContract,
  useConnect 
} from 'wagmi';
import { waitForTransactionReceipt } from "@wagmi/core";
import { injected } from 'wagmi/connectors';
import { liskSepolia } from 'viem/chains';
import { config } from '@/lib/config';

interface UseWithdrawAssetParams {
  address?: `0x${string}`;
  token?: `0x${string}`;
  amount?: number;
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  chainId?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast: (props: { title: string; variant: 'default' | 'destructive' }) => void;
}

interface WithdrawAssetResult {
  withdrawAsset: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useWithdrawAsset = ({
  address,
  token,
  amount,
  coinSafeAddress,
  coinSafeAbi,
  onSuccess,
  onError,
  toast
}: UseWithdrawAssetParams): WithdrawAssetResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { connectAsync } = useConnect();
  const { writeContractAsync } = useWriteContract();

  const getTokenDecimals = (token: string): number => {
    const tokenDecimals: Record<string, number> = {
      'USDT': 6,
      'DEFAULT': 18
    };
    
    return tokenDecimals[token] || tokenDecimals.DEFAULT;
  };

  const withdrawAsset = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);

      if (!address) {
        try {
          await connectAsync({
            chainId: liskSepolia.id,
            connector: injected(),
          });
        } catch (error) {
            toast({
                title: "Error Connecting Wallet",
                variant: "destructive",
            });
            console.log("Error", error);
          throw new Error('Failed to connect wallet: ' + error);
        }
      }

      if (!amount) {
        toast({
          title: "Please input a value for amount to Withdraw",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!token) {
        toast({
          title: "Please select token to Withdraw",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const decimals = getTokenDecimals(token);
      const amountWithDecimals = BigInt(amount * (10 ** decimals));

      // Withdraw
      const WithdrawResponse = await writeContractAsync({
        chainId: liskSepolia.id,
        address: coinSafeAddress as `0x${string}`,
        functionName: "withdrawFromPool",
        abi: coinSafeAbi,
        args: [token, amountWithDecimals],
      });

      if (!WithdrawResponse) {
        throw new Error('Withdraw transaction failed');
      }

      const WithdrawReceipt = await waitForTransactionReceipt(config, {
        hash: WithdrawResponse,
      });

      if (WithdrawReceipt.status !== 'success') {
        toast({
            title: "Error Withdrawing token",
            variant: "destructive",
        });
        throw new Error('Withdraw transaction was not successful');
      }

      onSuccess?.();

    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      onError?.(error);
      console.error('Withdraw asset error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    address,
    token,
    amount,
    coinSafeAddress,
    coinSafeAbi,
    onSuccess,
    onError,
    toast,
    connectAsync,
    writeContractAsync,
    waitForTransactionReceipt
  ]);

  return {
    withdrawAsset,
    isLoading,
    error
  };
};