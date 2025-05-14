"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Token {
  id: number;
  name: string;
  network: string;
  amount: string;
  period: string;
  selected: boolean;
}

interface RemoveTokenModalProps {
  onClose: () => void;
}

export default function RemoveTokenModal({ onClose }: RemoveTokenModalProps) {
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: 1,
      name: "AVAX",
      network: "Avalanche",
      amount: "0.00234 AVAX",
      period: "per month",
      selected: true,
    },
    {
      id: 2,
      name: "AVAX",
      network: "Avalanche",
      amount: "0.00234 AVAX",
      period: "per month",
      selected: false,
    },
    {
      id: 3,
      name: "AVAX",
      network: "Avalanche",
      amount: "0.00234 AVAX",
      period: "per month",
      selected: false,
    },
  ]);

  const selectToken = (id: number) => {
    setTokens(
      tokens.map((token) => ({
        ...token,
        selected: token.id === id,
      }))
    );
  };

  console.log("RemoveTokenModal component rendered");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
      <div
        className="absolute inset-0 bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}></div>
      <div className="relative w-full max-w-md rounded-lg bg-[#17171C] text-white shadow-lg">
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-xl font-medium">Remove token from safe</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full p-1 bg-white"
            aria-label="Close">
            <X className="h-4 w-4 text-black" />
          </button>
        </div>

        <div className="px-5 pb-7">
          <p className="mb-5 text-[14px] text-gray-400">
            This will stop the autosaving on the selected token
          </p>

          <div className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Auto savings</span>
              <Badge className="bg-[#79E7BA33] hover:bg-[#79E7BA33] rounded-full px-3 py-1 text-sm text-gray-300">
                Unlocks every 30 days
              </Badge>
            </div>
            <div className="mt-1 text-[13px] text-gray-400">
              Next unlock date: 25th December, 2025
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between border-b border-gray-800 pb-4"
                onClick={() => selectToken(token.id)}>
                <div className="flex items-center">
                  <div className="mr-3 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs">A</span>
                  </div>
                  <div>
                    <div className="font-medium">{token.name}</div>
                    <div className="text-sm text-gray-400">{token.network}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 text-right">
                    <div className="font-medium">{token.amount}</div>
                    <div className="text-sm text-gray-400">{token.period}</div>
                  </div>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border-2 ${
                    token.selected
                      ? "border-[#79E7BA] bg-gray-900 flex items-center justify-center"
                      : "border-gray-600"
                  }`}>
                  {token.selected && (
                    <div className="h-2 w-2 rounded-full bg-[#79E7BA]"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded-full bg-[#FFFFFF2B] px-4 py-2 text-[14px] text-white">
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Remove token logic here
                onClose();
              }}
              className="rounded-full bg-white px-4 py-2 text-[14px] text-black hover:bg-gray-200">
              Remove token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
