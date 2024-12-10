import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SavingsOverviewData } from "@/lib/data";
import { SaveSenseModalManager } from "./SaveSenseModalManager";
import { useAccount } from "wagmi";
import { toast } from "@/hooks/use-toast";

export default function SmarterSavingCard({
  setIsConnectModalOpen
}: {
  setIsConnectModalOpen?: (open: boolean) => void;
}) {
  const { address } = useAccount();
  const modalManagerRef = useRef<{ 
    fetchData: () => void; 
    download: () => void; 
  }>(null);

  const handleButtonClick = (buttonText: string) => {
    if (buttonText === "Get started") {
      if (!address) {
        toast({
          title: "No wallet connected",
          variant: "destructive",
        });
        setIsConnectModalOpen && setIsConnectModalOpen(true);
        return;
      }
      
      // Trigger fetch data method on modal manager
      modalManagerRef.current?.fetchData();
    } else if (buttonText === "Download") {
      // Trigger download method on modal manager
      modalManagerRef.current?.download();
    }
  };

  return (
    <div className="grid grid-col-1 sm:grid-cols-2 gap-3 pb-2">
      {SavingsOverviewData.map((items, index) => (
        <div
          key={index}
          className="flex border-0 items-center space-x-4 justify-between bg-[#092324] rounded-[12px] p-4 text-[#F1F1F1]">
          <div>
            <items.icon className="w-9 h-9 text-[#20FFAF]" />
          </div>
          <div>
            <div className="text-sm">{items.title}</div>
            <div className="text-xs font-[300]">{items.description}</div>
          </div>
          <div>
            <Button
              onClick={() => handleButtonClick(items.buttonText)}
              className="px-4 py-2 text-white bg-[#FFFFFF2B] text-sm text-nowrap rounded-[100px]">
              {items.buttonText}
            </Button>
          </div>
        </div>
      ))}
      
      {/* Modal Manager Component */}
      <SaveSenseModalManager 
        trigger={modalManagerRef}
        onClose={() => {
          // Optional: Add any cleanup or additional logic when modals close
        }} 
      />
    </div>
  );
}