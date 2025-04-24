"use client";

import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export interface SuccessfulTxModalProps {
  isOpen?: boolean;
  onClose: () => void;
  transactionType?:
    | "deposit"
    | "withdraw"
    | "save"
    | "setup-recurring-save"
    | "top-up"
    | "claim";
  amount?: number | string | bigint;
  token?: string;
  title?: string;
  description?: string;
  additionalDetails?: {
    frequency?: string;
    savingGoal?: number | bigint;
    poolName?: string;
    subText?: string;
  };
}

const SuccessfulTxModal: React.FC<SuccessfulTxModalProps> = ({
  isOpen = true,
  onClose,
  transactionType,
  amount,
  token,
  title,
  description,
  additionalDetails,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Close modal after 5 seconds (increased from 3 seconds)

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isOpen, onClose]);

  // Format amount to handle different types (number, string, bigint)
  const formatAmount = (value?: number | string | bigint): string => {
    if (value === undefined) return "";
    if (typeof value === "bigint") {
      return Number(value).toLocaleString();
    }
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return String(value);
  };

  // Generate transaction description based on type
  const renderTransactionDescription = (): JSX.Element => {
    // If a custom description is provided, use that
    if (description) {
      return <>{description}</>;
    }

    const formattedAmount = formatAmount(amount);

    // Otherwise, generate based on transaction type
    switch (transactionType) {
      case "deposit":
        return (
          <>
            You deposited{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>
          </>
        );
      case "withdraw":
        return (
          <>
            You've withdrawn{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>
          </>
        );
      case "save":
        return (
          <>
            You saved{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>{" "}
            {additionalDetails?.poolName
              ? `to ${additionalDetails.poolName}`
              : ""}
          </>
        );
      case "top-up":
        return (
          <>
            You topped up{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>{" "}
            to your safe
          </>
        );
      case "claim":
        return (
          <>
            You claimed{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>{" "}
            from your safe
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
              {formattedAmount} {token}
            </span>{" "}
            <span className="font-semibold lowercase">
              {additionalDetails?.frequency || "every day"}
            </span>
          </>
        );
      default:
        return (
          <>
            Transaction of{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>{" "}
            completed
          </>
        );
    }
  };

  // Generate transaction title based on type
  const getTransactionTitle = (): string => {
    // If a custom title is provided, use that
    if (title) {
      return title;
    }

    // Otherwise, generate based on transaction type
    switch (transactionType) {
      case "deposit":
        return "Deposit Transaction Successful";
      case "withdraw":
        return "Withdrawal Transaction Successful";
      case "save":
        return "Saving Transaction Successful";
      case "top-up":
        return "Top-up Successful!";
      case "claim":
        return "Claim Successful!";
      case "setup-recurring-save":
        return "Create Automated Savings Successful";
      default:
        return "Transaction Successful";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[360px] sm:max-w-[410px] p-6 border-1 border-[#FFFFFF21] text-white bg-[#17171C] rounded-lg shadow-lg"
        noX={true}>
        <DialogTitle className="text-center">
          {getTransactionTitle()}
        </DialogTitle>

        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <img
            src="/assets/empty-wallet-tick.png"
            alt="Success"
            className="w-24 h-24"
          />

          {/* Description */}
          <p className="text-center text-lg">
            {renderTransactionDescription()}
          </p>

          {additionalDetails?.savingGoal && (
            <div className="text-center text-sm text-gray-500">
              Saving Goal: {formatAmount(additionalDetails.savingGoal)} {token}
            </div>
          )}
        </div>
        <div className="text-center text-sm text-[#B5B5B5]">
          {additionalDetails?.subText}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessfulTxModal;
