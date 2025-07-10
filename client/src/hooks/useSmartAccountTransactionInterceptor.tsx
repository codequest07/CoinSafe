import { useCallback, useState, useRef } from "react";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { X, Wallet } from "lucide-react";
import React, { createContext, useContext } from "react";
import { sendAndConfirmTransaction } from "thirdweb";

type SendTransactionInput = any;

type TransactionInterceptorResult = {
  approvalError: string | null;
  clearError: () => void;
  ApprovalModal: React.ComponentType;
  sendTransaction: (
    tx: SendTransactionInput,
    options?: any
  ) => Promise<any | null>;
  closeApproveModal: () => void;
};

/**
 * Global transaction interceptor for smart accounts.
 * This hook should be used once at the app level to intercept all transactions
 * and show approval modal for smart accounts.
 */
export function useSmartAccountTransactionInterceptor(): TransactionInterceptorResult {
  const wallet = useActiveWallet();
  const account = useActiveAccount();

  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [pendingTx, setPendingTx] = useState<{
    tx: SendTransactionInput;
    options?: any;
  } | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false); // Track pending transaction

  // Use ref to store the resolver to avoid stale closure issues
  const approvalResolverRef = useRef<((approved: boolean) => void) | null>(
    null
  );

  // Async function to check if wallet is a smart account
  const isSmartAccount = useCallback(async () => {
    if (!wallet) return false;

    const smartWalletIds = ["inApp"];
    if (smartWalletIds.includes(wallet.id)) {
      // console.log("Smart wallet detected via ID:", wallet.id);
      return true;
    }
    return false;
  }, [wallet]);

  const clearError = useCallback(() => {
    setApprovalError(null);
  }, []);

  const openApproveModal = useCallback(() => {
    // Prevent re-opening if already open
    if (!isApproveModalOpen) {
      setApproveModalOpen(true);
    }
  }, [isApproveModalOpen]);

  const closeApproveModal = useCallback(() => {
    setApproveModalOpen(false);
    setPendingTx(null);
    setIsTransactionPending(false); // Clear pending transaction state
    if (approvalResolverRef.current) {
      approvalResolverRef.current(false);
      approvalResolverRef.current = null;
    }
  }, []);

  // Internal approval handler
  const handleApproval = useCallback((approved: boolean) => {
    if (approvalResolverRef.current) {
      approvalResolverRef.current(approved);
      approvalResolverRef.current = null;
    }
    setApproveModalOpen(false);
    setIsTransactionPending(false); // Clear pending transaction state
    if (!approved) {
      setPendingTx(null);
      setApprovalError("Transaction Cancelled by User");
      throw new Error("Transaction Cancelled by User"); // Throw error for cancellation
    }
    setPendingTx(null); // Clear pending transaction on approval
  }, []);

  // Main transaction interceptor
  const sendTransaction = useCallback(
    async (tx: SendTransactionInput, options?: any) => {
      // console.log("Intercepting transaction:", tx, options);
      setApprovalError(null);

      // Block new transactions if one is already pending
      if (isTransactionPending) {
        setApprovalError("Another transaction is awaiting approval.");
        return null;
      }

      try {
        // Check if this is a smart account and requires approval
        if (await isSmartAccount()) {
          // console.log("Detected smart account, opening approval modal");
          setPendingTx({ tx, options });
          setIsTransactionPending(true); // Mark transaction as pending
          openApproveModal();

          // Create a promise that resolves when user approves/cancels
          const approved = await new Promise<boolean>((resolve) => {
            approvalResolverRef.current = resolve;
          });

          if (!approved) {
            throw new Error("Transaction Cancelled by User"); // Propagate error to caller
          }
        }

        // Execute the transaction
        if (!account) {
          setPendingTx(null);
          setIsTransactionPending(false);
          setApprovalError("No active account found for transaction.");
          throw new Error("No active account found for transaction.");
        }

        const result = await sendAndConfirmTransaction({
          transaction: tx,
          account,
        });
        setPendingTx(null);
        setIsTransactionPending(false); // Clear pending state
        return result;
      } catch (err: any) {
        setPendingTx(null);
        setIsTransactionPending(false); // Clear pending state on error
        const errorMessage = err?.message || "Transaction failed.";
        setApprovalError(errorMessage);
        // console.error("Transaction failed:", err);
        throw err; // Propagate error to caller
      }
    },
    [isSmartAccount, openApproveModal, account]
  );

  // Enhanced Modal Component with better UX
  const ApprovalModal = useCallback(() => {
    if (!isApproveModalOpen || !pendingTx) return null;

    const getWalletDisplayName = () => {
      if (!wallet) return "Unknown Wallet";
      const walletNames: Record<string, string> = {
        inApp: "In-App Wallet",
        "thirdweb.embedded": "Social/Phone Login",
        "thirdweb.smart": "Smart Wallet",
        "thirdweb.account": "Account Abstraction",
        "global.safe": "Safe Wallet",
        "xyz.argent": "Argent",
        "xyz.sequence": "Sequence",
        "com.coin98": "Coin98",
        "com.ambire": "Ambire",
        "com.kresus": "Kresus",
        "io.blocto": "Blocto",
        "io.getclave": "Clave",
        "tech.okto": "Okto",
        "app.backpack": "Backpack",
        "money.unstoppable": "Unstoppable",
        "xyz.frontier.wallet": "Frontier",
      };

      return walletNames[wallet.id] || wallet.id;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={(e) => {
              e.stopPropagation();
              handleApproval(false);
            }}
          ></div>
          <div className="relative w-full max-w-md rounded-xl bg-[#17171C] text-white shadow-lg p-5 border border-white/15">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-[500]">Approve transaction</h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproval(false);
                }}
                className="rounded-full p-1 bg-white "
                aria-label="Close"
              >
                <X className="h-4 w-4 text-black" />
              </button>
            </div>

            <div className="mt-8">
              <div className="bg-[#1D1D1D73]/[10] rounded-lg p-4 mb-6 border border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {account?.address && (
                    <span className="text-sm font-mono">
                      {account?.address?.slice(0, 8)}...
                      {account?.address?.slice(-6)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 items-center text-sm text-gray-400">
                  <Wallet className="text-gray-400" size={18} />
                  {getWalletDisplayName()}
                </div>
              </div>
            </div>

            <div className="mt-8 bg-[#1D1D1D73]/[10] rounded-lg p-4 mb-6 border border-white/15">
              <h3 className="font-medium mb-1">Smart Account Detected</h3>
              <p className="text-gray-400 text-sm">
                Your wallet requires explicit approval for transactions. This
                adds an extra layer of security.
              </p>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproval(false);
                }}
                className="rounded-full bg-[#FFFFFF2B]  text-[14px] px-5 py-2.5 text-white "
              >
                Reject
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproval(true);
                }}
                // disabled={extending}
                className="rounded-full bg-white text-[14px] py-2.5 transition text-black px-6"
              >
                Sign Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [isApproveModalOpen, pendingTx, wallet, account, handleApproval]);

  return {
    approvalError,
    clearError,
    ApprovalModal,
    sendTransaction,
    closeApproveModal,
  };
}

// Create context for the interceptor
const SmartAccountTransactionInterceptorContext = createContext<
  TransactionInterceptorResult | undefined
>(undefined);

export function SmartAccountTransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const interceptor = useSmartAccountTransactionInterceptor();

  return (
    <SmartAccountTransactionInterceptorContext.Provider value={interceptor}>
      {children}
      <interceptor.ApprovalModal />
    </SmartAccountTransactionInterceptorContext.Provider>
  );
}

// Custom hook to use the interceptor context
export function useSmartAccountTransactionInterceptorContext() {
  const ctx = useContext(SmartAccountTransactionInterceptorContext);
  if (!ctx) {
    throw new Error(
      "useSmartAccountTransactionInterceptorContext must be used within a SmartAccountTransactionProvider"
    );
  }
  return ctx;
}
