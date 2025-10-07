import React, { useState } from "react";
import { X } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";

interface PWAInstallPromptProps {
  appName?: string;
  description?: string;
  onInstall?: (accepted: boolean) => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  appName = "Coinsafe",
  description = "Install this app for quick access and offline use",
  onInstall,
  onDismiss,
}) => {
  const { isInstallable, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  const handleInstall = async () => {
    const accepted = await promptInstall();
    onInstall?.(accepted);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
      className="fixed bottom-4 bg-gradient-to-br to-[#092324] from-emerald-600 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#17171C] rounded-lg p-5 z-50 animate-slide-up"
    >
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        className="absolute top-2 right-2 text-gray-100 hover:text-gray-300 transition-colors"
      >
        <X size={18} />
      </button>

      <div className="flex flex-col items-start gap-3">
        <div className="">
          <div className="flex items-center gap-2">
            {/* <div className="bg-white/20 p-2 rounded-md backdrop-blur-sm flex-shrink-0">
              <Download className="text-white" size={20} aria-hidden="true" />
            </div> */}

            <h3
              id="pwa-install-title"
              className="font-semibold text-xl text-gray-100 mb-1"
            >
              Install {appName}
            </h3>
          </div>
          <p
            id="pwa-install-description"
            className="text-base text-gray-300 mt-1 mb-3"
          >
            {description}
          </p>
        </div>
        <div className="flex gap-2 justify-end w-full">
          <button
            onClick={handleDismiss}
            className="text-white px-5 sm:px-12 py-3 rounded-full font-medium bg-white/10 transition-colors text-sm disabled:opacity-50"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="bg-white rounded-full text-emerald-600 px-5 sm:px-12 py-3 font-semibold hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};
