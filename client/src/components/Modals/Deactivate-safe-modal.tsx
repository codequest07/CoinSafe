
import { X } from "lucide-react";

export default function DeactivateSafeModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black/90 p-4">
      <div className="absolute inset-0 bg-black/90" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-lg bg-gray-900 text-white shadow-lg">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-xl font-medium">Deactivate autosavings</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-800"
            aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <p className="mb-8 text-gray-300">
            Are you sure you want to deactivate autosavings? This will stop all
            autosavings on all the tokens you have saved
          </p>

          <div className="mt-8 flex justify-between">
            <button
              onClick={onClose}
              className="rounded-full bg-gray-800 px-8 py-3 text-white hover:bg-gray-700">
              Cancel
            </button>
            <button className="rounded-full bg-white px-8 py-3 text-black hover:bg-gray-200">
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
