

import { X } from "lucide-react";
import { useState } from "react";

interface Token {
  id: number;
  name: string;
  network: string;
  amount: string;
  period: string;
  selected: boolean;
}

export default function RemoveTokenModal({ onClose }: { onClose: () => void }) {
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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black/90 p-4">
      <div className="absolute inset-0 bg-black/90" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-lg bg-gray-900 text-white shadow-lg">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-xl font-medium">Remove token from safe</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-800"
            aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <p className="mb-5 text-gray-400">
            This will stop the autosaving on the selected token
          </p>

          <div className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Auto savings</span>
              <span className="rounded-full bg-gray-700 px-3 py-1 text-sm text-gray-300">
                Unlocks every 30 days
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-400">
              Next unlock date: 25th December, 2025
            </div>
          </div>

          <div className="mt-5 space-y-4">
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
                  <div
                    className={`h-6 w-6 rounded-full border-2 ${
                      token.selected
                        ? "border-teal-500 bg-gray-900 flex items-center justify-center"
                        : "border-gray-600"
                    }`}>
                    {token.selected && (
                      <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={onClose}
              className="rounded-full bg-gray-800 px-6 py-3 text-white hover:bg-gray-700">
              Cancel
            </button>
            <button className="rounded-full bg-white px-6 py-3 text-black hover:bg-gray-200">
              Remove token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
