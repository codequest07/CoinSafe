"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

type CreateSavingsTargetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (target: SavingsTarget) => void;
  itemName: string;
  value: string;
  onChange: (value: string) => void;
};

interface SavingsTarget {
  id: string;
  name: string;
  description?: string;
}

export default function CreateSavingsTargetModal({
  isOpen,
  onClose,
  onCreate,
  itemName,
}: //   value,
//   onChange,
CreateSavingsTargetModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTarget, setNewTarget] = useState<Omit<SavingsTarget, "id">>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCreateTarget = () => {
    if (newTarget.name) {
      onCreate({ ...newTarget, id: Date.now().toString() });
      setNewTarget({ name: "", description: "" });
      setIsModalOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
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
              defaultValue={itemName}
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
  );
}

{
  /* <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17171C] text-[#F1F1F1] border-[#FFFFFF21] bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create Custom Target</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="new-item"
              className="block text-sm font-medium mb-1"
            >
              Name of target
            </label>
            <input
              ref={inputRef}
              id="new-item"
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Add {itemName}
            </button>
          </div>
        </div>
      </div>
    </div> */
}
