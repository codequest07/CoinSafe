import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import SaveAsset from "./SaveAsset";
import { useRecoilState } from "recoil";
import { saveAtom } from "@/store/atoms/save";
import { SaveSenseModalManager } from "./SaveSenseModalManager";

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

  const handleChange = (event: any) => {
    setSaveState((prevState) => ({
      ...prevState,
      typeName: event.target.value,
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
          <DialogTitle className="text-white">
            How would you like to save?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup defaultValue="manual" className="flex flex-col gap-2">
            <Label
              htmlFor="manual"
              className="flex items-center gap-2 rounded-md border-0 px-4 py-3 h-24 bg-[#131313B2] text-gray-400 [&:has(input:checked)]:border [&:has(input:checked)]:border-[#FFFFFF29] [&:has(input:checked)]:bg-[#1E1E1E99] [&:has(input:checked)]:text-white">
              <input
                type="radio"
                id="manual"
                name="savingOption"
                value="manual"
                onChange={handleChange}
                className="peer appearance-none h-4 w-4 border-2 border-gray-400 rounded-full checked:bg-[#79E7BA] checked:border-[#79E7BA] focus:outline-none"
              />
              <div className="flex-1 ml-3">
                <div className="font-medium mb-1">Manual Savings</div>
                <p className="text-sm font-[400] text-muted-foreground">
                  You have all the control
                </p>
              </div>
            </Label>
            <Label
              htmlFor="personalized"
              className="flex items-center gap-2 rounded-md border-0 px-4 py-3 h-24 bg-[#131313B2] text-gray-400 [&:has(input:checked)]:border [&:has(input:checked)]:border-[#FFFFFF29] [&:has(input:checked)]:bg-[#1E1E1E99] [&:has(input:checked)]:text-primary-foreground">
              <input
                type="radio"
                id="personalized-ai"
                name="savingOption"
                value="personalized-ai"
                onChange={handleChange}
                className="peer appearance-none h-4 w-4 border-2 border-gray-400 rounded-full checked:bg-[#79E7BA] checked:border-[#79E7BA] focus:outline-none"
              />
              <div className="flex-1 ml-3">
                <div className="font-medium mb-1">Personalized Savings</div>
                <p className="text-sm font-[400] text-white">
                  We use a trustless AI to access your past activities and pick
                  the best saving pattern for you
                </p>
              </div>
            </Label>
          </RadioGroup>
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
              onClick={openSecondModal}>
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
