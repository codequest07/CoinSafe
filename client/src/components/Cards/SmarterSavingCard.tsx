import { CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavingsOverviewData } from "@/lib/data";
import { main } from "../../apps/index.ts";
import { useAccount } from "wagmi";
import { useState } from "react";
import Loading from "../Modals/loading-screen.tsx";
import SaveSenseResp from "../Modals/SaveSenseResp.tsx";

export default function SmarterSavingCard() {
  const { address } = useAccount();
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isSaveSenseModalOpen, setIsSaveSenseModalOpen] = useState(false);

  const openLoadingModal = () => {
    setIsLoadingModalOpen(true);

    setTimeout(() => {
      setIsLoadingModalOpen(false);
      setIsSaveSenseModalOpen(true);
    }, 10000);
  };

  const closeSaveSenseModal = () => setIsSaveSenseModalOpen(false);

  const handleButtonClick = async () => {
    if (!address) {
      console.log("No wallet address available.");
      return;
    }

    try {
      const savingsPlan = await main(`0x${address}`);
      if (savingsPlan) {
        console.log("Savings plan generated successfully:", savingsPlan);
      } else {
        console.log("No savings plan was generated.");
      }
    } catch (error) {
      console.error(
        "Error generating savings plan:",
        error instanceof Error ? error.message : error
      );
    } finally {
      console.log("Process completed.");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 pb-2">
      {SavingsOverviewData.map((items, index) => (
        <div
          key={index}
          className="flex border-0 items-center justify-between bg-[#092324] rounded-[12px] p-4 text-[#F1F1F1]">
          <div>
            <items.icon className="w-12 h-12 text-[#20FFAF]" />
          </div>
          <div>
            <CardTitle className="text-sm"> {items.title}</CardTitle>
            <CardDescription className="text-xs">
              {items.description}
            </CardDescription>
          </div>
          <div>
            <Button
              onClick={openLoadingModal}
              className="px-4 py-2 text-white bg-[#FFFFFF2B] text-sm text-nowrap rounded-[100px]">
              {items.buttonText}
            </Button>
          </div>
        </div>
      ))}

      {/* Loading Modal */}
      <Loading
        isOpen={isLoadingModalOpen}
        onClose={() => setIsLoadingModalOpen(false)}
      />

      {/* SaveSense Response Modal */}
      <SaveSenseResp
        isOpen={isSaveSenseModalOpen}
        onClose={closeSaveSenseModal}
      />
    </div>
  );
}
