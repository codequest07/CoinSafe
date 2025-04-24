"use client";

import { useEffect } from "react";
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

const SuccessfulTxModal = ({
  isOpen = true,
  onClose,
  transactionType,
  amount,
  token,
  title,
  description,
  additionalDetails,
}: SuccessfulTxModalProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Close modal after 5 seconds

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isOpen, onClose]);

  // Format amount to handle different types
  const formatAmount = (value: any): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "bigint") {
      return Number(value).toLocaleString();
    }
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return String(value);
  };

  // Get formatted amount
  const formattedAmount = formatAmount(amount);

  // Get transaction title
  let transactionTitle = "Transaction Successful";

  if (title) {
    transactionTitle = title;
  } else {
    switch (transactionType) {
      case "deposit":
        transactionTitle = "Deposit Transaction Successful";
        break;
      case "withdraw":
        transactionTitle = "Withdrawal Transaction Successful";
        break;
      case "save":
        transactionTitle = "Saving Transaction Successful";
        break;
      case "top-up":
        transactionTitle = "Top-up Successful!";
        break;
      case "claim":
        transactionTitle = "Claim Successful!";
        break;
      case "setup-recurring-save":
        transactionTitle = "Create Automated Savings Successful";
        break;
    }
  }

  // Prepare description content
  let descriptionContent: JSX.Element;

  if (description) {
    descriptionContent = <>{description}</>;
  } else {
    switch (transactionType) {
      case "deposit":
        descriptionContent = (
          <>
            You deposited{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>
          </>
        );
        break;
      case "withdraw":
        descriptionContent = (
          <>
            You've withdrawn{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>
          </>
        );
        break;
      case "save":
        descriptionContent = (
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
        break;
      case "top-up":
        descriptionContent = (
          <>
            You topped up{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>{" "}
            to your safe
          </>
        );
        break;
      case "claim":
        descriptionContent = (
          <>
            You claimed{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>{" "}
            from your safe
          </>
        );
        break;
      case "setup-recurring-save":
        descriptionContent = (
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
        break;
      default:
        descriptionContent = (
          <>
            Transaction of{" "}
            <span className="text-[#20FFAF] font-semibold">
              {formattedAmount} {token}
            </span>{" "}
            completed
          </>
        );
    }
  }

  // Format saving goal if present
  const savingGoalText = additionalDetails?.savingGoal
    ? `Saving Goal: ${formatAmount(additionalDetails.savingGoal)} ${token}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[360px] sm:max-w-[410px] p-6 border-1 border-[#FFFFFF21] text-white bg-[#17171C] rounded-lg shadow-lg"
        noX={true}>
        <DialogTitle className="text-center">{transactionTitle}</DialogTitle>

        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <img
            src="/assets/empty-wallet-tick.png"
            alt="Success"
            className="w-24 h-24"
          />

          {/* Description */}
          <p className="text-center text-lg">{descriptionContent}</p>

          {savingGoalText && (
            <div className="text-center text-sm text-gray-500">
              {savingGoalText}
            </div>
          )}
        </div>

        {additionalDetails?.subText && (
          <div className="text-center text-sm text-[#B5B5B5]">
            {additionalDetails.subText}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SuccessfulTxModal;
