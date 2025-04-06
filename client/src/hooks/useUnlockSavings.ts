import { useState } from 'react';
import { 
  useWriteContract, 
  useWaitForTransactionReceipt,
} from 'wagmi';
// import { type Hash } from 'viem';
import { useUserSavings } from './useUserSavings';
import { useActiveAccount } from 'thirdweb/react';

interface WithdrawSavingsParams {
  contractAddress: string;
  abi: any;
}

interface WithdrawSavingsArgs {
  savingsIndex: number;
  acceptEarlyWithdrawalFee: boolean;
}

export function useWithdrawSavings({ contractAddress, abi }: WithdrawSavingsParams) {
  const [isPending, setIsPending] = useState(false);
  const account = useActiveAccount();
    const userAddress = account?.address;
  
  // Get user's savings to check maturity and validate withdrawal
  const { savings, refetch: refetchSavings } = useUserSavings({
    contractAddress,
    abi,
  });

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Validate withdrawal conditions before sending transaction
  const validateWithdrawal = (savingsIndex: number, acceptFee: boolean) => {
    if (!savings || !userAddress) return false;
    
    const safe = savings[savingsIndex];
    if (!safe) {
      throw new Error('Invalid savings index');
    }

    if (safe.amount === 0n) {
      throw new Error('Invalid withdrawal: No savings found');
    }

    const now = BigInt(Math.floor(Date.now() / 1000));
    const isMatured = now >= safe.unlockTime;

    if (!isMatured && !acceptFee) {
      throw new Error('Early withdrawal requires accepting the fee');
    }

    return true;
  };

  const withdraw = async ({ savingsIndex, acceptEarlyWithdrawalFee }: WithdrawSavingsArgs) => {
    try {
      setIsPending(true);

      // Validate withdrawal conditions
      const isValid = validateWithdrawal(savingsIndex, acceptEarlyWithdrawalFee);
      if (!isValid) return;

      // Send transaction
      const result = await writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'withdrawSavings',
        args: [BigInt(savingsIndex), acceptEarlyWithdrawalFee],
      });

      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  // Handle successful transaction
  const onSuccess = async () => {
    await refetchSavings();
  };

  return {
    withdraw,
    isPending: isPending || isWritePending || isConfirming,
    error: writeError || confirmError,
    transaction: {
      hash,
      receipt,
    },
    onSuccess,
  };
}