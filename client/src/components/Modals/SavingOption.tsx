"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SaveAsset from "./SaveAsset";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { SaveSenseModalManager } from "./SaveSenseModalManager";
import { useNavigate } from "react-router-dom";

interface SavingOptionProps {
  isFirstModalOpen: boolean;
  setIsFirstModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSecondModalOpen: boolean;
  setIsSecondModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tab?: string;
}

export default function SavingOption({
  isFirstModalOpen,
  setIsFirstModalOpen,
  isSecondModalOpen,
  setIsSecondModalOpen,
  tab,
}: SavingOptionProps) {
  const [saveState, setSaveState] = useRecoilState(saveAtom);
  // Map the saveState.typeName to our selectedOption state for the UI
  const [selectedOption, setSelectedOption] = useState<
    "manual" | "personalized-ai"
  >((saveState.typeName as "manual" | "personalized-ai") || "manual");

  const navigate = useNavigate();

  const modalManagerRef = useRef<{
    fetchData: () => void;
    download: () => void;
  }>(null);

  const handleButtonClick = () => {
    // Trigger fetch data method on modal manager
    modalManagerRef.current?.fetchData();
  };

  const openSecondModal = () => {
    if (saveState.typeName === "personalized-ai") {
      setIsFirstModalOpen(false);
      handleButtonClick();
      return;
    }
    setIsSecondModalOpen(true);
  };

  const handleSaveAssetOption = () => {
    if (saveState.typeName === "personalized-ai") {
      setIsFirstModalOpen(false);
      handleButtonClick();
      return;
    }
    navigate("/dashboard/save-assets");
  };

  // Update the Recoil state when the UI selection changes
  const handleOptionSelect = (option: "manual" | "personalized-ai") => {
    setSelectedOption(option);
    setSaveState((prevState) => ({
      ...prevState,
      typeName: option,
    }));
  };

  useEffect(() => {
    if (isFirstModalOpen && tab === "autosave") {
      openSecondModal();
    }
  }, [isFirstModalOpen]);

  return (
    <Dialog open={isFirstModalOpen} onOpenChange={setIsFirstModalOpen}>
      <DialogContent className="sm:max-w-[600px] border-1 border-[#FFFFFF21] text-white bg-[#17171C]">
        <DialogHeader>
          <DialogTitle className="text-white font-[500]">
            How would you like to save?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`p-6 rounded-xl cursor-pointer ${
              selectedOption === "manual"
                ? "bg-[#3F3F3F99] border border-[#FFFFFF29]"
                : "bg-[#272727B2]"
            }`}
            onClick={() => handleOptionSelect("manual")}>
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === "manual"
                    ? "border-[#79E7BA]"
                    : "border-[#FFFFFF3D]"
                }`}>
                {selectedOption === "manual" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#79E7BA]"></div>
                )}
              </div>
              <h3 className="text-[#FFFFFF] text-[16px] font-medium">
                Manual savings
              </h3>
            </div>
            <p className="text-[#C7C7D1] text-[13px] mt-2 ml-9">
              Manage your savings on your term
            </p>
          </div>

          <div
            className={`p-6 rounded-xl cursor-pointer ${
              selectedOption === "personalized-ai"
                ? "bg-[#3F3F3F99] border border-[#FFFFFF29]"
                : "bg-[#272727B2]"
            }`}
            onClick={() => handleOptionSelect("personalized-ai")}>
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === "personalized-ai"
                    ? "border-[#79E7BA]"
                    : "border-[#FFFFFF3D]"
                }`}>
                {selectedOption === "personalized-ai" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#79E7BA]"></div>
                )}
              </div>
              <h3 className="text-[#FFFFFF] text-[16px] font-medium">
                Personalized savings
              </h3>
            </div>
            <p className="text-[#C7C7D1] text-[13px] mt-2 ml-9">
              We use a trustless AI to analyze your past activities and choose
              the best savings pattern for you
            </p>
          </div>
        </div>

        <DialogFooter>
          <div className="w-full flex items-center justify-between">
            <Button
              className="bg-[#1E1E1E99] hover:bg-[#1E1E1E99] px-8 rounded-[2rem]"
              type="button"
              onClick={() => setIsFirstModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-white hover:bg-white px-8 text-black rounded-[2rem]"
              type="button"
              onClick={handleSaveAssetOption}>
              Proceed
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <SaveAsset
        isOpen={isSecondModalOpen}
        onClose={() => {
          setIsSecondModalOpen(false);
          setIsFirstModalOpen(false);
        }}
        onBack={() => {
          setIsSecondModalOpen(false);
          setIsFirstModalOpen(true);
        }}
        tab={tab}
      />
      {/* Modal Manager Component */}
      <SaveSenseModalManager
        trigger={modalManagerRef}
        onClose={() => {
          // Optional: Add any cleanup or additional logic when modals close
        }}
      />
    </Dialog>
  );
}
