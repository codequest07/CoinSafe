import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { SavingsOverviewData } from "@/lib/data";
import Loading from "../Modals/loading-screen";
import SaveSenseResp from "../Modals/SaveSenseResp";
import KitchenLoading from "../Modals/kitchen-loading";
import { toast } from "@/hooks/use-toast";

export default function SmarterSavingCard({setIsConnectModalOpen}:{setIsConnectModalOpen?: (open: boolean) => void;}) {
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isSaveSenseModalOpen, setIsSaveSenseModalOpen] = useState(false);
  const [saveSenseData, setSaveSenseData] = useState(null);
  const [showKitchenLoading, setShowKitchenLoading] = useState(false);

  const { address } = useAccount();

  const handleGetStarted = async () => {
    if (!address) {
      toast({
        title: "No wallet connected",
        variant: "destructive",
      });
      console.error("No wallet connected");
      setIsConnectModalOpen && setIsConnectModalOpen(true);
      return;
    }

    setIsLoadingModalOpen(true);

    try {
      const response = await fetch(
        `https://coinsafe-0q0m.onrender.com/main/${address}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();

      setSaveSenseData(data);
      setIsLoadingModalOpen(false);
      setIsSaveSenseModalOpen(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoadingModalOpen(false);
    }
  };

  const handleDownload = () => {
    setShowKitchenLoading(true);
  };

  const handleButtonClick = (buttonText: string) => {
    if (buttonText === "Get started") {
      handleGetStarted();
    } else if (buttonText === "Download") {
      handleDownload();
    }
  };

  const closeSaveSenseModal = () => setIsSaveSenseModalOpen(false);

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

      <Loading
        isOpen={isLoadingModalOpen}
        onClose={() => setIsLoadingModalOpen(false)}
      />

      <SaveSenseResp
        isOpen={isSaveSenseModalOpen}
        onClose={closeSaveSenseModal}
        data={saveSenseData}
      />

      <KitchenLoading
        isOpen={showKitchenLoading}
        onClose={() => setShowKitchenLoading(false)}
      />
    </div>
  );
}
