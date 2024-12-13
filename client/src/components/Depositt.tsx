import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DepositProps {
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (isOpen: boolean) => void;
  onBack: () => void;
}

const Depositt: React.FC<DepositProps> = ({
  isDepositModalOpen,
  setIsDepositModalOpen,
  onBack,
}) => {
  console.log("Deposit modal rendered, isOpen:", isDepositModalOpen);

  return (
    <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Deposit content goes here</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onBack}>Back</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Depositt;
