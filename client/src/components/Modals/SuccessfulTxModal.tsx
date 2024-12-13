import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MemoLogo2 from "@/icons/Logo2";

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
            You withdrew{" "}
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
            You set up an <span className="text-[#20FFAF] font-semibold">automated savings</span> plan to save{" "}
            <span className="text-[#20FFAF] font-semibold">
              {amount} {token}
            </span>{" "}
            <span className="font-semibold lowercase">{additionalDetails?.frequency || "every day"}</span>
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
        return "Deposit Successful";
      case "withdraw":
        return "Withdrawal Successful";
      case "save":
        return "Saving Successful";
      case "setup-recurring-save":
        return "Create Automated Savings Successful";
      default:
        return "Transaction Successful";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-6 bg-black text-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-left text-lg font-semibold">
            {getTransactionTitle()}
          </DialogTitle>
        </div>

        <div className="flex flex-col items-center space-y-6 mb-4">
          {/* Logo */}
          <MemoLogo2 className="md:w-[25rem] h-28" />

          {/* Description */}
          <p className="text-center text-lg">{getTransactionDescription()}</p>

          {additionalDetails?.savingGoal && (
            <div className="text-center text-sm text-gray-500">
              Saving Goal: {additionalDetails.savingGoal} {token}
            </div>
          )}
        </div>

        <div className="text-center text-2xl">🥳💃</div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessfulTxModal;
