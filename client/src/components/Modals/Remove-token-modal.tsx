"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
// import { Badge } from "@/components/ui/badge";
import { useAutomatedSafeForUser } from "@/hooks/useGetAutomatedSafe";
import { useActiveAccount } from "thirdweb/react";
import {
  convertFrequency,
  convertTokenAmountToUsd,
  getTokenDecimals,
  tokenData,
} from "@/lib/utils";
import { formatUnits } from "ethers"; // Added for amount formatting
import { useRemoveTokenFromAutomatedPlan } from "@/hooks/useRemoveTokenFromAutomatedPlan";
import { CoinsafeDiamondContract } from "@/lib/contract";
import { toast } from "sonner";
import { format } from "date-fns";
import SuccessfulTxModal from "./SuccessfulTxModal";

interface Token {
  token: string; // Token address
  amountToSave: bigint; // Amount as BigInt
  frequency?: any; // Optional period (e.g., "per month")
  selected?: boolean; // Added for selection state
}

interface RemoveTokenModalProps {
  onClose: () => void;
  closeAllModals?: () => void; // Optional success callback
  open: boolean;
}

export default function RemoveTokenModal({
  open,
  onClose,
  closeAllModals,
}: RemoveTokenModalProps) {
  if (!open) return null; // If the modal is not open, return null
  const account = useActiveAccount();
  const userAddress = account?.address;
  const [tokens, setTokens] = useState<Token[]>([]); // Initialize empty, populated from details
  const [showSuccessModal, setShowSucessModal] = useState(false);
  // const [selectedTokenAddress, setSelectedTokenAddress] = useState<
  //   string | null
  // >(null); // Track selected token address

  const {
    details,
    isLoading: automatedSafeLoading,
    error: automatedSafeError,
  } = useAutomatedSafeForUser(userAddress as `0x${string}`);

  // State for USD values and errors, keyed by token address
  const [usdValues, setUsdValues] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sync tokens state with details.tokenDetails and manage selection
  useEffect(() => {
    if (details?.tokenDetails) {
      setTokens(
        details.tokenDetails.map((item: Token, index: number) => ({
          ...item,
          selected: index === 0, // Select first token by default
        }))
      );
    }
  }, [details?.tokenDetails]);

  // Fetch USD values for each token
  useEffect(() => {
    const fetchUsdValues = async () => {
      if (!details?.tokenDetails) return;

      const newUsdValues: { [key: string]: string } = {};
      const newErrors: { [key: string]: string } = {};

      await Promise.all(
        details.tokenDetails.map(async (item: Token) => {
          try {
            const usdValue = await convertTokenAmountToUsd(
              item.token,
              item.amountToSave
            );
            newUsdValues[item.token] = usdValue.toFixed(2); // Format to 2 decimals
          } catch (err) {
            console.error(`Error for token ${item.token}:`, err);
            newErrors[item.token] = "Failed to load USD value";
            newUsdValues[item.token] = "0.00"; // Fallback value
          }
        })
      );

      setUsdValues(newUsdValues);
      setErrors(newErrors);
    };

    fetchUsdValues();
  }, [details?.tokenDetails]); // Depend on tokenDetails, not tokenData

  // Select a token by token address
  const selectToken = (tokenAddress: string) => {
    setTokens(
      tokens.map((token) => ({
        ...token,
        selected: token.token === tokenAddress,
      }))
    );
  };

  const onSuccess = () => {
    setShowSucessModal(true);

    setTimeout(() => {
      setShowSucessModal(false);
      closeAllModals?.();
    }, 5000); // Close success modal after 3 seconds
  };

  const { removeTokenFromPlan, isLoading } = useRemoveTokenFromAutomatedPlan({
    account,
    token: tokens.find((token) => token.selected)?.token! as `0x${string}`,
    coinSafeAddress: CoinsafeDiamondContract.address as `0x${string}`,
    toast: ({ title, variant }) => {
      console.log(`${variant.toUpperCase()}: ${title}`);
      toast(title);
      // Replace with your preferred toast library (e.g., react-toastify)
    },
    onSuccess: () => {
      console.log("Token removed successfully");
      onSuccess();
    },
    onError: (err) => console.error("Transaction error:", err),
  });

  // Select a token by token address
  // const selectToken = (tokenAddress: string) => {
  //   setSelectedTokenAddress(tokenAddress);
  // };

  console.log("TOKEN DETAILS:", details);
  console.log("RemoveTokenModal component rendered");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
      <div
        className="absolute inset-0 bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      ></div>
      <div className="relative w-full max-w-md rounded-xl border border-white/15 p-2 bg-[#17171C] text-white shadow-lg">
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-xl font-medium">Remove token from safe</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full p-1 bg-white"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-black" />
          </button>
        </div>

        <div className="px-5 pb-7">
          <p className="mb-5 text-[14px] text-gray-400">
            This will stop the autosaving on the selected token
          </p>

          <div className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Auto savings</span>
              {/* <Badge className="bg-[#79E7BA33] hover:bg-[#79E7BA33] rounded-full px-3 py-1 text-sm text-gray-300">
                Unlocks every 30 days
              </Badge> */}
            </div>
            <div className="mt-1 text-[13px] text-gray-400">
              Next unlock date:{" "}
              {details?.unlockTime
                ? format(new Date(Number(details.unlockTime) * 1000), "PPP")
                : "N/A"}
            </div>
          </div>

          {automatedSafeLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : (
            automatedSafeError && (
              <div className="text-red-500">
                Error loading automated savings plan:{" "}
                {automatedSafeError.message}
              </div>
            )
          )}

          <div className="mt-10 space-y-4">
            {tokens.map((token) => (
              <div
                key={token.token} // Use token address as key
                className="flex items-center justify-between border-b border-gray-800 pb-4"
                onClick={() => selectToken(token.token)}
              >
                <div className="flex items-center">
                  <div className="mr-3 h-8 w-8 rounded-full flex items-center justify-center">
                    <img
                      src={tokenData[token.token]?.image}
                      alt={tokenData[token.token]?.symbol}
                      className="h-8 w-8 rounded-full"
                    />
                  </div>
                  <div>
                    <div className="font-medium">
                      {tokenData[token.token]?.symbol}
                    </div>
                    <div className="text-sm text-gray-400">
                      {tokenData[token.token]?.chain}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 text-right">
                    <div className="font-medium">
                      {formatUnits(
                        token.amountToSave,
                        tokenData[token.token]?.decimals ||
                          getTokenDecimals(token.token)
                      )}{" "}
                      {tokenData[token.token]?.symbol}
                    </div>
                    <div className="flex gap-2">
                      <div className="text-sm text-gray-400">
                        $
                        {usdValues[token.token] !== undefined
                          ? usdValues[token.token]
                          : "Loading..."}
                        {errors[token.token] && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors[token.token]}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{`${convertFrequency(
                        Number(token.frequency)!
                      )}`}</div>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      token.selected
                        ? "border-[#79E7BA] bg-gray-900 flex items-center justify-center"
                        : "border-gray-600"
                    }`}
                  >
                    {token.selected && (
                      <div className="h-2 w-2 rounded-full bg-[#79E7BA]"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full bg-[#FFFFFF2B] px-4 py-2 text-[14px] text-white"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Remove token logic here
                removeTokenFromPlan(e);
                // onClose();
              }}
              className="rounded-full bg-white px-4 py-2 text-[14px] text-black hover:bg-gray-200"
              disabled={isLoading}
              aria-label="Remove token"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Remove token"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Successful Transaction modal */}
      {showSuccessModal && (
        <div
          className="modal-container z-[9999]"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          {/* Successful Transaction Modal */}
          <SuccessfulTxModal
            isOpen={showSuccessModal}
            onClose={() => setShowSucessModal(false)}
            transactionType="remove-token"
            token={
              tokenData[tokens.find((token) => token.selected)?.token || ""]
                ?.symbol || "Unknown"
            }
            additionalDetails={{
              subText: `Effective immediately, we will stop autosaving ${formatUnits(
                details.tokenDetails.find(
                  ({ token }: { token: string }) =>
                    token == tokens.find((token) => token.selected)?.token
                )?.amountToSave ?? 0n,
                getTokenDecimals(
                  tokens.find((token) => token.selected)?.token || ""
                )
              )} ${
                tokenData[tokens.find((token) => token.selected)?.token || ""]
                  ?.symbol || "Unknown"
              } per month`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// "use client";

// import { X } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { useAutomatedSafeForUser } from "@/hooks/useGetAutomatedSafe";
// import { useActiveAccount } from "thirdweb/react";
// import { convertTokenAmountToUsd, tokenData } from "@/lib/utils";

// interface Token {
//   id: number;
//   name: string;
//   network: string;
//   amount: string;
//   period: string;
//   selected: boolean;
// }

// interface RemoveTokenModalProps {
//   onClose: () => void;
// }

// export default function RemoveTokenModal({ onClose }: RemoveTokenModalProps) {
//   const account = useActiveAccount();
//   const userAddress = account?.address;
//   const [tokens, setTokens] = useState<Token[]>([
//     {
//       id: 1,
//       name: "AVAX",
//       network: "Avalanche",
//       amount: "0.00234 AVAX",
//       period: "per month",
//       selected: true,
//     },
//     {
//       id: 2,
//       name: "AVAX",
//       network: "Avalanche",
//       amount: "0.00234 AVAX",
//       period: "per month",
//       selected: false,
//     },
//     {
//       id: 3,
//       name: "AVAX",
//       network: "Avalanche",
//       amount: "0.00234 AVAX",
//       period: "per month",
//       selected: false,
//     },
//   ]);

//   const {
//     details,
//     isLoading: automatedSafeLoading,
//     error: automatedSafeError,
//   } = useAutomatedSafeForUser(userAddress as `0x${string}`);

//   console.log("TOKEN DETAILS:", details);

//   const [usdValues, setUsdValues] = useState({});
//   const [errors, setErrors] = useState({});

//   const selectToken = (id: number) => {
//     setTokens(
//       tokens.map((token) => ({
//         ...token,
//         selected: token.id === id,
//       }))
//     );
//   };

//   useEffect(() => {
//     const fetchUsdValues = async () => {
//       const newUsdValues: { [key: string]: string } = {};
//       const newErrors: { [key: string]: string } = {};

//       // Map over tokenData to fetch USD values for each item
//       await Promise.all(
//         details?.tokenDetails?.map(async (item: { token: string; amount: bigint; }, index: string | number) => {
//           try {
//             const usdValue = await convertTokenAmountToUsd(item.token, item.amount);
//             newUsdValues[index] = usdValue.toFixed(2); // Format to 2 decimals
//           } catch (err) {
//             console.error(`Error for token ${item.token}:`, err);
//             newErrors[index] = 'Failed to load USD value';
//             newUsdValues[index] = '0.00'; // Fallback value
//           }
//         })
//       );

//       setUsdValues(newUsdValues);
//       setErrors(newErrors);
//     };

//     fetchUsdValues();
//   }, [tokenData]); // Re-run if tokenData changes

//   console.log("RemoveTokenModal component rendered");

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
//       <div
//         className="absolute inset-0 bg-transparent"
//         onClick={(e) => {
//           e.stopPropagation();
//           onClose();
//         }}
//       ></div>
//       <div className="relative w-full max-w-md rounded-lg bg-[#17171C] text-white shadow-lg">
//         <div className="flex items-center justify-between px-5 py-3">
//           <h2 className="text-xl font-medium">Remove token from safe</h2>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onClose();
//             }}
//             className="rounded-full p-1 bg-white"
//             aria-label="Close"
//           >
//             <X className="h-4 w-4 text-black" />
//           </button>
//         </div>

//         <div className="px-5 pb-7">
//           <p className="mb-5 text-[14px] text-gray-400">
//             This will stop the autosaving on the selected token
//           </p>

//           <div className="mb-2">
//             <div className="flex items-center justify-between">
//               <span className="text-lg font-medium">Auto savings</span>
//               <Badge className="bg-[#79E7BA33] hover:bg-[#79E7BA33] rounded-full px-3 py-1 text-sm text-gray-300">
//                 Unlocks every 30 days
//               </Badge>
//             </div>
//             <div className="mt-1 text-[13px] text-gray-400">
//               Next unlock date: 25th December, 2025
//             </div>
//           </div>

//           <div className="mt-10 space-y-4">
//             {/* {tokens.map((token) => (
//               <div
//                 key={token.id}
//                 className="flex items-center justify-between border-b border-gray-800 pb-4"
//                 onClick={() => selectToken(token.id)}
//               >
//                 <div className="flex items-center">
//                   <div className="mr-3 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
//                     <span className="text-white text-xs">A</span>
//                   </div>
//                   <div>
//                     <div className="font-medium">{token.name}</div>
//                     <div className="text-sm text-gray-400">{token.network}</div>
//                   </div>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="mr-4 text-right">
//                     <div className="font-medium">{token.amount}</div>
//                     <div className="text-sm text-gray-400">{token.period}</div>
//                   </div>
//                 </div>
//                 <div
//                   className={`h-5 w-5 rounded-full border-2 ${
//                     token.selected
//                       ? "border-[#79E7BA] bg-gray-900 flex items-center justify-center"
//                       : "border-gray-600"
//                   }`}
//                 >
//                   {token.selected && (
//                     <div className="h-2 w-2 rounded-full bg-[#79E7BA]"></div>
//                   )}
//                 </div>
//               </div>
//             ))} */}
//             {details?.tokenDetails?.map((token: any) => (
//               <div
//                 key={token.token}
//                 className="flex items-center justify-between border-b border-gray-800 pb-4"
//                 onClick={() => selectToken(token.id)}
//               >
//                 <div className="flex items-center">
//                   <div className="mr-3 h-8 w-8 rounded-full flex items-center justify-center">
//                     {/* <span className="text-white text-xs"></span> */}
//                     <img
//                       src={tokenData[token.token]?.image}
//                       alt={tokenData[token.token]?.symbol}
//                     />
//                   </div>
//                   <div>
//                     <div className="font-medium">
//                       {tokenData[token.token]?.symbol}
//                     </div>
//                     <div className="text-sm text-gray-400">
//                       {tokenData[token.token]?.chain}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center">
//                   <div className="mr-4 text-right">
//                     <div className="font-medium">{convertTokenAmountToUsd(token.token, token.amountToSave)}</div>
//                     <div className="text-sm text-gray-400">{token.period}</div>
//                   </div>
//                 </div>
//                 <div
//                   className={`h-5 w-5 rounded-full border-2 ${
//                     token.selected
//                       ? "border-[#79E7BA] bg-gray-900 flex items-center justify-center"
//                       : "border-gray-600"
//                   }`}
//                 >
//                   {token.selected && (
//                     <div className="h-2 w-2 rounded-full bg-[#79E7BA]"></div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-8 flex justify-between">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onClose();
//               }}
//               className="rounded-full bg-[#FFFFFF2B] px-4 py-2 text-[14px] text-white"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 // Remove token logic here
//                 onClose();
//               }}
//               className="rounded-full bg-white px-4 py-2 text-[14px] text-black hover:bg-gray-200"
//             >
//               Remove token
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
