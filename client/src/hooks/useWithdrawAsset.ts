import { useCallback, useState } from 'react';
import { 
  useSendTransaction,
  useActiveAccount,
  useConnect,
} from 'thirdweb/react';
// import { liskSepolia } from 'viem/chains'; // Still used for chain ID reference
import { getContract, prepareContractCall, sendTransaction } from 'thirdweb';
import { client, liskSepolia } from '@/lib/config';
import { Account } from 'thirdweb/wallets';
// import { toast } from './use-toast';
// import { config } from '@/lib/config'; // Assuming this contains Thirdweb client config

interface UseWithdrawAssetParams {
  address?: `0x${string}`;
  account: Account | undefined;
  token?: `0x${string}`;
  amount?: number;
  coinSafeAddress: `0x${string}`;
  coinSafeAbi: any;
  chainId?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  toast: (props: { title: string; variant: "default" | "destructive" }) => void;
}

interface WithdrawAssetResult {
  withdrawAsset: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useWithdrawAsset = ({
  address: providedAddress,
  token,
  amount,
  coinSafeAddress,
  coinSafeAbi,
  onSuccess,
  onError,
  toast,
}: UseWithdrawAssetParams): WithdrawAssetResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { connect } = useConnect();
  const account = useActiveAccount();
  const address = account?.address || providedAddress; // Use active account address
  // const account = useActiveAccount();
  // const wallet = useWallet(); // Reference to the wallet (e.g., smart account)
  // const { contract } = useContract({ address: coinSafeAddress, abi: coinSafeAbi });
  const { mutateAsync: writeContractAsync, isPending: writeLoading } = useSendTransaction();

  const contract = getContract({
            client,
            chain: liskSepolia,
            address: coinSafeAddress,
        });

  const getTokenDecimals = (token: string): number => {
    const tokenDecimals: Record<string, number> = {
      USDT: 6,
      DEFAULT: 18,
    };

    return tokenDecimals[token] || tokenDecimals.DEFAULT;
  };

  const withdrawAsset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

    try {
      setIsLoading(true);

      if (!address) {
        try {
          // await connect(async () => ({
          //   chainId: liskSepolia.id,
          //   // Assuming a smart wallet setup; adjust based on your configuration
          //   wallet: wallet || { id: "inApp" }, // Fallback to in-app wallet if none specified
          //   client: config.client, // Assuming config.client contains Thirdweb client
          // }));
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

      if (!contract) {
        throw new Error('Contract not initialized');
      }

        const decimals = getTokenDecimals(token);
        const amountWithDecimals = BigInt(amount * 10 ** decimals);

      // Prepare the contract call for withdrawFromPool
      const transaction = prepareContractCall({
        contract,
        method: "function withdrawFromPool(address token, uint256 amount)",
        params: [token, amountWithDecimals],
      });

      if(account) {
        const { transactionHash } = await sendTransaction({
          transaction,
          account,
        })

        alert(`Save successful! Tx Hash: ${transactionHash}`);
        toast({ title: "Withdrawal successful", variant: "default" });
      }

      // Send the transaction (using smart account if configured)
      // const withdrawResponse = await writeContractAsync(transaction);

      // if (!withdrawResponse) {
      //   throw new Error('Withdraw transaction failed');
      // }

      // Wait for transaction confirmation
      // const waitForTransactionReceipt = async (txHash: string) => {
      //   let receipt;
      //   while (!receipt) {
      //     try {
      //       receipt = await contract?.client.getTransactionReceipt({ hash: txHash });
      //       if (receipt?.status === "success") return receipt;
      //       await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second
      //     } catch (err) {
      //       console.error('Error polling transaction:', err);
      //     }
      //   }
      //   return receipt;
      // };

      // const withdrawReceipt = await waitForTransactionReceipt(withdrawResponse.transactionHash);

      // if (withdrawReceipt?.status !== 'success') {
      //   toast({
      //     title: "Error Withdrawing token",
      //     variant: "destructive",
      //   });
      //   throw new Error('Withdraw transaction was not successful');
      // }

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
    connect,
    writeContractAsync,
    contract,
  ]);

  return {
    withdrawAsset,
    isLoading: isLoading || writeLoading,
    error
  };
};


// import { useCallback, useState } from 'react';
// import { 
//   useWriteContract,
//   useConnect 
// } from 'wagmi';
// import { waitForTransactionReceipt } from "@wagmi/core";
// import { injected } from 'wagmi/connectors';
// import { liskSepolia } from 'viem/chains';
// import { config } from '@/lib/config';

// interface UseWithdrawAssetParams {
//   address?: `0x${string}`;
//   token?: `0x${string}`;
//   amount?: number;
//   coinSafeAddress: `0x${string}`;
//   coinSafeAbi: any;
//   chainId?: number;
//   onSuccess?: () => void;
//   onError?: (error: Error) => void;
//   toast: (props: { title: string; variant: 'default' | 'destructive' }) => void;
// }

// interface WithdrawAssetResult {
//   withdrawAsset: (e: React.FormEvent) => Promise<void>;
//   isLoading: boolean;
//   error: Error | null;
// }

// export const useWithdrawAsset = ({
//   address,
//   token,
//   amount,
//   coinSafeAddress,
//   coinSafeAbi,
//   onSuccess,
//   onError,
//   toast
// }: UseWithdrawAssetParams): WithdrawAssetResult => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<Error | null>(null);

//   const { connectAsync } = useConnect();
//   const { writeContractAsync } = useWriteContract();

//   const getTokenDecimals = (token: string): number => {
//     const tokenDecimals: Record<string, number> = {
//       'USDT': 6,
//       'DEFAULT': 18
//     };
    
//     return tokenDecimals[token] || tokenDecimals.DEFAULT;
//   };

//   const withdrawAsset = useCallback(async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     try {
//       setIsLoading(true);

//       if (!address) {
//         try {
//           await connectAsync({
//             chainId: liskSepolia.id,
//             connector: injected(),
//           });
//         } catch (error) {
//             toast({
//                 title: "Error Connecting Wallet",
//                 variant: "destructive",
//             });
//             console.log("Error", error);
//           throw new Error('Failed to connect wallet: ' + error);
//         }
//       }

//       if (!amount) {
//         toast({
//           title: "Please input a value for amount to Withdraw",
//           variant: "destructive",
//         });
//         setIsLoading(false);
//         return;
//       }

//       if (!token) {
//         toast({
//           title: "Please select token to Withdraw",
//           variant: "destructive",
//         });
//         setIsLoading(false);
//         return;
//       }

//       const decimals = getTokenDecimals(token);
//       const amountWithDecimals = BigInt(amount * (10 ** decimals));

//       // Withdraw
//       const WithdrawResponse = await writeContractAsync({
//         chainId: liskSepolia.id,
//         address: coinSafeAddress as `0x${string}`,
//         functionName: "withdrawFromPool",
//         abi: coinSafeAbi,
//         args: [token, amountWithDecimals],
//       });

//       if (!WithdrawResponse) {
//         throw new Error('Withdraw transaction failed');
//       }

//       const WithdrawReceipt = await waitForTransactionReceipt(config, {
//         hash: WithdrawResponse,
//       });

//       if (WithdrawReceipt.status !== 'success') {
//         toast({
//             title: "Error Withdrawing token",
//             variant: "destructive",
//         });
//         throw new Error('Withdraw transaction was not successful');
//       }

//       onSuccess?.();

//     } catch (err) {
//       const error = err instanceof Error ? err : new Error('An unknown error occurred');
//       setError(error);
//       onError?.(error);
//       console.error('Withdraw asset error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [
//     address,
//     token,
//     amount,
//     coinSafeAddress,
//     coinSafeAbi,
//     onSuccess,
//     onError,
//     toast,
//     connectAsync,
//     writeContractAsync,
//     waitForTransactionReceipt
//   ]);

//   return {
//     withdrawAsset,
//     isLoading,
//     error
//   };
// };