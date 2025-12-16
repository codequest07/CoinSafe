"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SavingsOverviewData } from "@/lib/data";
import { SaveSenseModalManager } from "./Modals/SaveSenseModalManager";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";
import MemoGreenMagicPen from "@/icons/GreenMagicPen";


export default function SmarterSaving({
  setIsConnectModalOpen,
}: {
  setIsConnectModalOpen?: (open: boolean) => void;
}) {
  const account = useActiveAccount();
  const address = account?.address;
  const modalManagerRef = useRef<{
    fetchData: () => void;
    download: () => void;
  }>(null);

  const handleButtonClick = (buttonText: string) => {
    if (buttonText === "Get started") {
      if (!address) {
        toast.error("No wallet connected");
        setIsConnectModalOpen?.(true);
        return;
      }

      // Trigger fetch data method on modal manager
      modalManagerRef.current?.fetchData();
    }
  };

  return (
    <>
      <div className="sm:grid max-w-[98%] mx-auto sm:grid-cols-2 gap-3 pb-2">
        {SavingsOverviewData.map((items) => (
          <Button
            key={items.buttonText}
            onClick={() => handleButtonClick(items.buttonText)}
            className="fixed z-10 sm:bottom-8 bottom-12 sm:right-4 right-2 animate-pulse hover:animate-none focus:animate-none transition-all bg-transparent hover:bg-transparent">
            <MemoGreenMagicPen className="w-12 h-12" />
          </Button>
        ))}
      </div>

      {/* Modal Manager Component */}
      <SaveSenseModalManager trigger={modalManagerRef} onClose={() => {}} />
    </>
  );
}
