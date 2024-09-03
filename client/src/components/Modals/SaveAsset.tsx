import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import MemoBackIcon from "@/icons/BackIcon";
import MemoRipple from "@/icons/Ripple";
import MemoCalenderIcon from "@/icons/CalenderIcon";
import ApproveTransaction from "./ApproveTransaction";

export default function SaveAsset({
  isOpen,
  onClose,
  onBack,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}) {
  const [selectedOption, setSelectedOption] = useState("manual");
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false);

  const openThirdModal = () => {
    setIsThirdModalOpen(true);
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-0 text-white bg-[#13131373]">
        <DialogTitle className="text-white flex items-center space-x-3">
          <MemoBackIcon onClick={onBack} className="w-6 h-6 cursor-pointer" />
          <p>Save your assets</p>
        </DialogTitle>
        <Tabs defaultValue="one-time" className="w-full">
          <TabsList className="sm:flex space-x-4 text-center justify-between bg-[#1E1E1E99] rounded-[2rem] p-2 mb-4">
            <TabsTrigger
              value="one-time"
              className="flex justify-center rounded-2xl items-center flex-1">
              One-time Save
            </TabsTrigger>
            <TabsTrigger
              value="autosave"
              className="flex justify-center rounded-2xl items-center flex-1">
              Autosave
            </TabsTrigger>
          </TabsList>
          <TabsContent value="one-time">
            <div className="p-8 text-gray-700">
              {/* Amount Section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <label htmlFor="amount" className="text-sm text-gray-400">
                    Amount
                  </label>
                  <div className="flex flex-col items-center justify-center">
                    <input
                      type="text"
                      id="amount"
                      defaultValue="345,000.67 XRP"
                      className="bg-transparent text-base font-light text-gray-200 border-none focus:outline-none text-center w-full"
                    />
                    <div className="text-xs text-gray-400 text-center">
                      ≈ $400.56
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <Select>
                    <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                      <div className="flex items-center">
                        <MemoRipple className="mr-2" />
                        <SelectValue placeholder="Ripple" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ripple">
                        <div className="flex items-center space-x-2">
                          <p>Ripple</p>
                        </div>
                      </SelectItem>
                      <SelectItem value="bitcoin">Bitcoin</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Wallet Balance Section */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-[300] text-gray-300">
                  Wallet balance:{" "}
                  <span className="text-gray-400">3000 XRP</span>
                </div>
                <div className="text-sm text-green-400 cursor-pointer">
                  Save all
                </div>
              </div>

              {/* Duration Section */}
              <div className="space-y-4 py-6 text-white">
                <div className="space-y-2 relative">
                  <Label htmlFor="duration">Duration</Label>
                  <div className="relative">
                    <Input
                      id="duration"
                      defaultValue="7days"
                      type="text"
                      placeholder="Days"
                      className="pl-3 pr-4"
                    />
                    <MemoCalenderIcon className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Unlock Date Section */}
              <div className="text-sm text-gray-300">
                Unlocks on 24 Sept, 2024
              </div>
            </div>
          </TabsContent>
          <TabsContent value="autosave">
            <div className="space-y-4 py-4">
              <p className="font-[200] text-base">Choose savings method</p>
              <div className="flex gap-2">
                <Label
                  htmlFor="manual"
                  className="flex items-center gap-2 rounded-md border-0 px-4 py-3 h-24 bg-[#131313B2] text-gray-400">
                  <input
                    type="radio"
                    id="manual"
                    name="savingOption"
                    value="manual"
                    checked={selectedOption === "manual"}
                    onChange={() => setSelectedOption("manual")}
                    className="appearance-none h-4 w-4 border-2 border-gray-400 rounded-full checked:bg-[#79E7BA] checked:border-[#79E7BA] focus:outline-none"
                  />
                  <div className="flex-1 ml-3">
                    <div className="font-medium mb-1">Per transaction</div>
                    <p className="text-xs font-[400] text-muted-foreground">
                      Save a percentage of every transaction
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="personalized"
                  className="flex items-center gap-2 rounded-md border-0 px-4 py-3 h-24 bg-[#131313B2] text-gray-400">
                  <input
                    type="radio"
                    id="personalized"
                    name="savingOption"
                    value="personalized"
                    checked={selectedOption === "personalized"}
                    onChange={() => setSelectedOption("personalized")}
                    className="appearance-none h-4 w-4 border-2 border-gray-400 rounded-full checked:bg-[#79E7BA] checked:border-[#79E7BA] focus:outline-none"
                  />
                  <div className="flex-1 ml-3">
                    <div className="font-medium mb-1">By frequency</div>
                    <p className="text-xs font-[400] text-white">
                      Save a fixed amount by frequency
                    </p>
                  </div>
                </Label>
              </div>

              {/* Conditionally Rendered Content */}
              {selectedOption === "manual" && (
                <div className="space-y-4 py-2 text-white">
                  <Label htmlFor="transactionPercentage">
                    Transaction Percentage
                  </Label>
                  <Input
                    id="transactionPercentage"
                    defaultValue="% 20"
                    type="text"
                    placeholder="Percentage"
                    className="pl-3 pr-4"
                  />
                </div>
              )}

              {selectedOption === "personalized" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                      <label htmlFor="amount" className="text-sm text-gray-400">
                        Amount
                      </label>
                      <div className="flex flex-col items-center justify-center">
                        <input
                          type="text"
                          id="amount"
                          defaultValue="345,000.67 XRP"
                          className="bg-transparent text-base font-light text-gray-200 border-none focus:outline-none text-center w-full"
                        />
                        <div className="text-xs text-gray-400 text-center">
                          ≈ $400.56
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Select>
                        <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-lg">
                          <div className="flex items-center">
                            <MemoRipple className="mr-2" />
                            <SelectValue placeholder="Ripple" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ripple">
                            <div className="flex items-center space-x-2">
                              <p>Ripple</p>
                            </div>
                          </SelectItem>
                          <SelectItem value="bitcoin">Bitcoin</SelectItem>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 py-2 text-white">
                    <Label htmlFor="frequencyAmount">Frequency</Label>
                    <Select>
                      <SelectTrigger className="w-full bg-gray-700 border bg-transparent  text-white rounded-lg">
                        <div className="flex items-center">
                          <SelectValue placeholder="Monthly" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jan">
                          <div className="flex items-center space-x-2">
                            <p>Jan</p>
                          </div>
                        </SelectItem>
                        <SelectItem value="feb">Feb</SelectItem>
                        <SelectItem value="mar">Mar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Common Duration Section */}
              <div className="space-y-2 relative">
                <Label htmlFor="duration">Duration</Label>
                <div className="relative">
                  <Input
                    id="duration"
                    defaultValue="7 days"
                    type="text"
                    placeholder="Days"
                    className="pl-3 pr-4"
                  />
                  <MemoCalenderIcon className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                </div>
                <div className="text-sm text-gray-300">
                  Unlocks on 24 Sept, 2024
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-[#1E1E1E99] px-8 rounded-[2rem] hover:bg-[#1E1E1E99]"
            type="submit">
            Cancel
          </Button>
          <div>
            <Button
              onClick={openThirdModal}
              className="text-black px-8 rounded-[2rem]"
              variant="outline">
              Save assets
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <ApproveTransaction
        isOpen={isThirdModalOpen}
        onClose={() => setIsThirdModalOpen(false)}
      />
    </Dialog>
  );
}
