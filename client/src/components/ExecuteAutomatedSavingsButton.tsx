import { client, liskSepolia } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import { useMemo, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Abi } from "viem";
import {
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { toast } from "sonner"; // Assuming you're using react-toastify for notifications

export function ExecuteAutomatedSavingsButton() {
  // State for button loading and transaction status
  const [isExecuting, setIsExecuting] = useState(false);

  const smartAccount = useActiveAccount();

  // Initialize contract
  const contract = useMemo(
    () =>
      getContract({
        client,
        chain: liskSepolia,
        address: CoinsafeDiamondContract.address,
        abi: facetAbis.automatedSavingsFacet as Abi,
      }),
    []
  );

  // Use Thirdweb's useSendTransaction hook for executing the transaction
  //   const { mutate: sendTransaction, error } = useSendTransaction();

  // Handle button click to execute the function
  const handleExecute = async () => {
    setIsExecuting(true);

    // try {
    //     const contract = getContract({
    //       client,
    //       chain: liskSepolia,
    //       address: coinSafeAddress,
    //       abi: facetAbis.fundingFacet as Abi,
    //     });

    //     if (!amount) {
    //       toast({
    //         title: "Please input a value for amount to deposit",
    //         variant: "destructive",
    //       });
    //       setIsLoading(false);
    //       return;
    //     }

    //     if (!token) {
    //       toast({
    //         title: "Please select token to deposit",
    //         variant: "destructive",
    //       });
    //       setIsLoading(false);
    //       return;
    //     }

    //     const tokenContract = getContract({
    //       client,
    //       address: token,
    //       chain: liskSepolia,
    //       abi: erc20Abi,
    //     });

    //     const decimals = getTokenDecimals(token);

    //     // Handle the conversion more safely to avoid overflow
    //     // First convert to string with the correct number of decimal places
    //     const amountStr = amount.toString();
    //     let amountWithDecimals: bigint;

    //     // Check if the amount has a decimal point
    //     if (amountStr.includes(".")) {
    //       const [whole, fraction] = amountStr.split(".");
    //       const paddedFraction = fraction
    //         .padEnd(decimals, "0")
    //         .slice(0, decimals);
    //       amountWithDecimals = BigInt(whole + paddedFraction);
    //     } else {
    //       amountWithDecimals = BigInt(amountStr + "0".repeat(decimals));
    //     }

    //     if (account) {
    //       try {
    //         const approveTx = prepareContractCall({
    //           contract: tokenContract,
    //           method: "approve",
    //           params: [coinSafeAddress, amountWithDecimals], // Use the same amount with decimals
    //         });

    //         onApprove?.();

    //         await sendAndConfirmTransaction({
    //           transaction: approveTx,
    //           account,
    //         });
    //       } catch (error: any) {
    //         console.error("Approval failed:", error);
    //         throw new Error(
    //           `Approve token spend transaction failed: ${error?.message ?? error}`
    //         );
    //       } finally {
    //         setIsLoading(false);
    //       }

    //       setIsLoading(true);
    //       try {
    //         const depositTx = prepareContractCall({
    //           contract,
    //           method:
    //             "function depositToPool(uint256 _amount, address _token) external",
    //           params: [amountWithDecimals, token as `0x${string}`],
    //         });

    //         await sendAndConfirmTransaction({
    //           transaction: depositTx,
    //           account,
    //         });

    //         onSuccess?.();
    //       } catch (error) {
    //         console.error("Deposit failed:", error);
    //         toast({
    //           title: `Deposit failed:", ${error}`,
    //           variant: "destructive",
    //         });
    //         onError?.(error as Error);
    //       } finally {
    //         setIsLoading(false);
    //       }
    //     } else {
    //       toast({
    //         title: "No account. Connect an account",
    //         variant: "destructive",
    //       });
    //       throw new Error(`Approve transaction failed: ${error?.message}`);
    //     }
    //   } catch (err) {
    //     const error =
    //       err instanceof Error ? err : new Error("An unknown error occurred");
    //     setError(error);
    //     onError?.(error);
    //     console.error("Deposit asset error:", error);
    //   } finally {
    //     setIsLoading(false);
    //   }

    try {
      // Prepare the contract call for getAndExecuteAutomatedSavingsPlansDue
      const transaction = prepareContractCall({
        contract,
        method: "getAndExecuteAutomatedSavingsPlansDue",
        params: [],
      });

      if (smartAccount) {
        await sendAndConfirmTransaction({ transaction, account: smartAccount });
      }
      // Execute the transaction
    } catch (err) {
      toast.error(`Error preparing transaction: ${(err as Error).message}`);
      setIsExecuting(false);
    }
  };

  return (
    <button
      onClick={handleExecute}
      disabled={isExecuting}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {isExecuting ? "Executing..." : "Execute Automated Savings"}
    </button>
  );
}
