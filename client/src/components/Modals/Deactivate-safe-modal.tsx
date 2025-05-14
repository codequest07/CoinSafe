"use client";

import { X } from "lucide-react";

interface DeactivateSafeModalProps {
  onClose: () => void;
}

export default function DeactivateSafeModal({
  onClose,
}: DeactivateSafeModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <div
        className="absolute inset-0 bg-black/80"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}></div>
      <div className="relative w-full max-w-md rounded-lg bg-[#17171C] text-white shadow-lg">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-xl font-[500]">Deactivate autosavings</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full p-1 bg-white "
            aria-label="Close">
            <X className="h-4 w-4 text-black" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <p className="mb-8 text-[14px] text-[#CACACA]">
            Are you sure you want to deactivate autosavings? This will stop all
            autosavings on all the tokens you have saved
          </p>

          <div className="mt-8 flex justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full bg-[#FFFFFF2B]  text-[14px] px-5 py-3 text-white ">
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();

                onClose();
              }}
              className="rounded-full bg-white px-5 text-[14px] py-3 text-black hover:bg-gray-200">
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
