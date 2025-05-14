import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

interface ManageAutosavingsProps {
  onClose?: () => void;
}

// Enum for different views in the modal
enum ModalView {
  MAIN,
  ADD_TOKEN,
  REMOVE_TOKEN,
  DEACTIVATE_SAFE,
}

export default function ManageAutosavings({ onClose }: ManageAutosavingsProps) {
  // Use a single state to track which view is active
  const [currentView, setCurrentView] = useState<ModalView>(ModalView.MAIN);

  // States for the add token view
  const [amount, setAmount] = useState("0.00");
  const [currency, setCurrency] = useState("LSK");
  const [frequency, setFrequency] = useState("Monthly");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  // States for the remove token view
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [tokens] = useState([
    {
      id: 1,
      name: "AVAX",
      network: "Avalanche",
      amount: "0.00234 AVAX",
      period: "per month",
    },
    {
      id: 2,
      name: "AVAX",
      network: "Avalanche",
      amount: "0.00234 AVAX",
      period: "per month",
    },
    {
      id: 3,
      name: "AVAX",
      network: "Avalanche",
      amount: "0.00234 AVAX",
      period: "per month",
    },
  ]);

  const closeModal = () => {
    onClose?.();
  };

  // Helper function to go back to the main view
  const goToMainView = () => {
    setCurrentView(ModalView.MAIN);
  };

  // Render the Add Token view
  const renderAddTokenView = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17171C]">
        <div className="relative w-full max-w-md rounded-lg bg-[#17171C] text-white shadow-lg">
          <div className="flex items-center justify-between p-4 pb-2">
            <h2 className="text-lg font-medium">Add token to safe</h2>
            <button
              onClick={goToMainView}
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
                            }}>
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
                onClick={goToMainView}
                className="rounded-full bg-gray-800 px-6 py-2 text-white hover:bg-gray-700">
                Cancel
              </button>
              <button
                onClick={goToMainView}
                className="rounded-full bg-white px-6 py-2 text-black hover:bg-gray-200">
                Add token
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the Remove Token view
  const renderRemoveTokenView = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="relative w-full max-w-md rounded-lg bg-gray-900 text-white shadow-lg">
          <div className="flex items-center justify-between p-5">
            <h2 className="text-xl font-medium">Remove token from safe</h2>
            <button
              onClick={goToMainView}
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
                  onClick={() => setSelectedTokenId(token.id)}>
                  <div className="flex items-center">
                    <div className="mr-3 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs">A</span>
                    </div>
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-sm text-gray-400">
                        {token.network}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <div className="font-medium">{token.amount}</div>
                      <div className="text-sm text-gray-400">
                        {token.period}
                      </div>
                    </div>
                    <div
                      className={`h-6 w-6 rounded-full border-2 ${
                        selectedTokenId === token.id
                          ? "border-teal-500 bg-gray-900 flex items-center justify-center"
                          : "border-gray-600"
                      }`}>
                      {selectedTokenId === token.id && (
                        <div className="h-3 w-3 rounded-full bg-teal-500"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={goToMainView}
                className="rounded-full bg-gray-800 px-6 py-3 text-white hover:bg-gray-700">
                Cancel
              </button>
              <button
                onClick={goToMainView}
                className="rounded-full bg-white px-6 py-3 text-black hover:bg-gray-200">
                Remove token
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the Deactivate Safe view
  const renderDeactivateSafeView = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="relative w-full max-w-md rounded-lg bg-gray-900 text-white shadow-lg">
          <div className="flex items-center justify-between p-5">
            <h2 className="text-xl font-medium">Deactivate autosavings</h2>
            <button
              onClick={goToMainView}
              className="rounded-full p-1 hover:bg-gray-800"
              aria-label="Close">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-5 pb-5">
            <p className="mb-8 text-gray-300">
              Are you sure you want to deactivate autosavings? This will stop
              all autosavings on all the tokens you have saved
            </p>

            <div className="mt-8 flex justify-between">
              <button
                onClick={goToMainView}
                className="rounded-full bg-gray-800 px-8 py-3 text-white hover:bg-gray-700">
                Cancel
              </button>
              <button
                onClick={goToMainView}
                className="rounded-full bg-white px-8 py-3 text-black hover:bg-gray-200">
                Deactivate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate view based on the current state
  switch (currentView) {
    case ModalView.ADD_TOKEN:
      return renderAddTokenView();
    case ModalView.REMOVE_TOKEN:
      return renderRemoveTokenView();
    case ModalView.DEACTIVATE_SAFE:
      return renderDeactivateSafeView();
    case ModalView.MAIN:
    default:
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-md rounded-lg bg-gray-900 text-white shadow-lg">
            <div className="flex items-center justify-between p-4 pb-2">
              <h2 className="text-lg font-medium">Manage autosavings</h2>
              <button
                onClick={closeModal}
                className="rounded-full p-1 hover:bg-gray-800"
                aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-2">
              <button
                className="flex w-full items-center justify-between rounded-md p-4 text-left hover:bg-gray-800"
                onClick={() => setCurrentView(ModalView.ADD_TOKEN)}>
                <span>Add token to safe</span>
                <span className="text-gray-400">›</span>
              </button>

              <button
                className="flex w-full items-center justify-between rounded-md p-4 text-left hover:bg-gray-800"
                onClick={() => setCurrentView(ModalView.REMOVE_TOKEN)}>
                <span>Remove token from safe</span>
                <span className="text-gray-400">›</span>
              </button>

              <button
                className="flex w-full items-center justify-between rounded-md p-4 text-left hover:bg-gray-800"
                onClick={() => setCurrentView(ModalView.DEACTIVATE_SAFE)}>
                <span>Deactivate safe</span>
                <span className="text-gray-400">›</span>
              </button>
            </div>
          </div>
        </div>
      );
  }
}
