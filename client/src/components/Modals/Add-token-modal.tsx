
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

export default function AddTokenModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("0.00");
  const [currency, setCurrency] = useState("LSK");
  const [frequency, setFrequency] = useState("Monthly");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black/90 p-4">
      <div className="absolute inset-0 bg-black/90" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-lg bg-gray-900 text-white shadow-lg">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-lg font-medium">Add token to safe</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-800"
            aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Auto savings</span>
              <span className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300">
                Unlocks every 30 days
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-400">
              Next unlock date: 25th December, 2025
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-gray-400">Amount</label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md bg-gray-800 p-3 text-white"
              />
              <div className="absolute bottom-1 left-3 text-xs text-gray-400">
                +$0.00
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  className="flex items-center rounded bg-gray-700 px-2 py-1"
                  onClick={() =>
                    setShowCurrencyDropdown(!showCurrencyDropdown)
                  }>
                  <span className="mr-1 h-4 w-4">{currency}</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {showCurrencyDropdown && (
                  <div className="absolute right-0 mt-2 w-32 rounded bg-gray-800 shadow-lg z-10">
                    <ul>
                      {["LSK", "XRP", "BTC"].map((cur) => (
                        <li
                          key={cur}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-700 ${
                            currency === cur ? "bg-gray-700" : ""
                          }`}
                          onClick={() => {
                            setCurrency(cur);
                            setShowCurrencyDropdown(false);
                          }}
                        >
                          {cur}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Wallet balance: <span className="text-white">3000 XRP</span>
            </span>
            <button className="text-sm text-green-500 hover:underline">
              Save all
            </button>
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm text-gray-400">
              Frequency
            </label>
            <div className="relative">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full appearance-none rounded-md bg-gray-800 p-3 text-white">
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Daily</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="rounded-full bg-gray-800 px-6 py-2 text-white hover:bg-gray-700">
              Cancel
            </button>
            <button className="rounded-full bg-white px-6 py-2 text-black hover:bg-gray-200">
              Add token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
