import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export interface SuccessfulTxModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: "deposit" | "withdraw" | "save" | "setup-recurring-save";
  amount: number | string;
  token: string;
  additionalDetails?: {
    frequency?: string;
    savingGoal?: number;
    poolName?: string;
    subText?: string
  };
}

const SuccessfulTxModal: React.FC<SuccessfulTxModalProps> = ({
  isOpen,
  onClose,
  transactionType,
  amount,
  token,
  additionalDetails,
}) => {

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Close modal after 3 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isOpen, onClose]);
  // Generate transaction description based on type
  const getTransactionDescription = () => {
    switch (transactionType) {
      case "deposit":
        return (
          <>
            You deposited{" "}
            {
              <span className="text-[#20FFAF] font-semibold">
                {amount} {token}
              </span>
            }
          </>
        );
      case "withdraw":
        return (
          <>
            You've withdrawn{" "}
            {
              <span className="text-[#20FFAF] font-semibold">
                {amount} {token}
              </span>
            }
          </>
        );
      case "save":
        return (
          <>
            You saved
            {
              <span className="text-[#20FFAF] font-semibold">
                {amount} {token}
              </span>
            }{" "}
            $
            {additionalDetails?.poolName
              ? `to ${additionalDetails.poolName}`
              : ""}
          </>
        );
      case "setup-recurring-save":
        return (
          <>
            You set up an{" "}
            <span className="text-[#20FFAF] font-semibold">
              automated savings
            </span>{" "}
            plan to save{" "}
            <span className="text-[#20FFAF] font-semibold">
              {amount} {token}
            </span>{" "}
            <span className="font-semibold lowercase">
              {additionalDetails?.frequency || "every day"}
            </span>
          </>
        );
      default:
        return (
          <>
            Transaction of
            {
              <span className="text-[#20FFAF] font-semibold">
                {amount} {token}
              </span>
            }{" "}
            completed
          </>
        );
    }
  };

  // Generate transaction title based on type
  const getTransactionTitle = () => {
    switch (transactionType) {
      case "deposit":
        return "Deposit Transaction Successful";
      case "withdraw":
        return "Withdrawal Transaction Successful";
      case "save":
        return "Saving Transaction Successful";
      case "setup-recurring-save":
        return "Create Automated Savings Successful";
      default:
        return "Transaction Successful";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[360px] sm:max-w-[410px] p-6 border-1 border-[#FFFFFF21] text-white bg-[#17171C] rounded-lg shadow-lg" noX={true}>
        <DialogTitle className="text-center">
          {getTransactionTitle()}
        </DialogTitle>

        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <img src="/assets/empty-wallet-tick.png" className="w-24 h-24" />

          {/* Description */}
          <p className="text-center text-lg">{getTransactionDescription()}</p>

          {additionalDetails?.savingGoal && (
            <div className="text-center text-sm text-gray-500">
              Saving Goal: {additionalDetails.savingGoal} {token}
            </div>
          )}
        </div>
        <div className="text-center text-sm text-[#B5B5B5]">{additionalDetails?.subText}</div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessfulTxModal;
