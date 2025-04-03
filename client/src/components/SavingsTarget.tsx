"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// import CreateSavingsTargetModal from "./Modals/CreateSavingsTarget";
// import SavingsTargetInput from "./SavingsTargetInput";

interface SavingsTarget {
  id: string;
  name: string;
  description?: string;
}

interface SavingsTargetSelectProps {
  label?: string;
  options: SavingsTarget[];
  onSelect: (target: SavingsTarget) => void;
  onCreate: (target: SavingsTarget) => void;
  className?: string;
  buttonClassName?: string;
  selectClassName?: string;
}

export function SavingsTargetSelect({
  label = "Savings target",
  options,
  onSelect,
  onCreate,
  className = "",
  buttonClassName = "text-[#79E7BA] hover:text-[#79E7BA] hover:bg-transparent",
  selectClassName = "",
}: SavingsTargetSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTarget, setNewTarget] = useState<Omit<SavingsTarget, "id">>({
    name: "",
    description: "",
  });

  const handleCreateTarget = () => {
    if (newTarget.name) {
      onCreate({ ...newTarget, id: Date.now().toString() });
      setNewTarget({ name: "", description: "" });
      setIsModalOpen(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <Label htmlFor="savings-target">{label}</Label>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="ghost"
          size="sm"
          className={buttonClassName}
        >
          Create savings target
        </Button>
      </div>
      <Select
        onValueChange={(value) =>
          onSelect(options.find((opt) => opt.id === value) as SavingsTarget)
        }
      >
        <SelectTrigger className={`w-full ${selectClassName}`}>
          <SelectValue placeholder="Select a savings target" />
        </SelectTrigger>
        <SelectContent className="bg-[#141415] text-[#FFFFFF]">
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#17171C] text-[#F1F1F1] border-[#FFFFFF21]">
          <DialogHeader>
            <DialogTitle>Create Custom Target</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="target-name">Name of target</Label>
              <Input
                id="target-name"
                value={newTarget.name}
                onChange={(e) =>
                  setNewTarget((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter target name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-description">Description (optional)</Label>
              <Textarea
                id="target-description"
                value={newTarget.description}
                onChange={(e) =>
                  setNewTarget((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter target description"
                className="bg-[#17171C]"
              />
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="bg-[#FFFFFF2B] border-[#FFFFFF2B] rounded-[100px] text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTarget}
                className="rounded-[100px] bg-white text-[#010104] hover:text-white"
              >
                Create Target
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <CreateSavingsTargetModal /> */}
    </div>
  );
}
