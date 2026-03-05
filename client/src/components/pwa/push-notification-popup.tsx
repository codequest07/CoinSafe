import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useFCMNotifications } from "../../hooks/useFCMNotifications";

interface PushNotificationPopupProps {
  vapidKey: string;
  walletAddress?: string;
  onTokenReceived?: (token: string) => void;
  autoShowDelay?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export const PushNotificationPopup: React.FC<PushNotificationPopupProps> = ({
  vapidKey,
  walletAddress,
  onTokenReceived,
  autoShowDelay = 5000,
  position = "bottom-right",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(false);

  const {
    permission,
    fcmToken,
    isSupported,
    isLoading,
    subscribe,
  } = useFCMNotifications({
    vapidKey,
    walletAddress,
    onTokenReceived,
  });

  useEffect(() => {
    // Check if user permanently dismissed
    const dismissed = localStorage.getItem("push-notification-dismissed");
    if (dismissed === "permanent") {
      setIsPermanentlyDismissed(true);
      return;
    }

    // Auto-show after delay if not subscribed
    if (!fcmToken && permission === "default" && isSupported) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, autoShowDelay);

      return () => clearTimeout(timer);
    }
  }, [fcmToken, permission, isSupported, autoShowDelay]);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setIsVisible(false);
      localStorage.removeItem("push-notification-dismissed");
    }
  };

  const handleDismiss = (permanent = false) => {
    setIsVisible(false);
    if (permanent) {
      localStorage.setItem("push-notification-dismissed", "permanent");
      setIsPermanentlyDismissed(true);
    } else {
      localStorage.setItem("push-notification-dismissed", "temporary");
      // Show again after 24 hours
      setTimeout(() => {
        localStorage.removeItem("push-notification-dismissed");
      }, 24 * 60 * 60 * 1000);
    }
  };

  // Don't show if already subscribed, denied, not supported, or permanently dismissed
  if (
    fcmToken ||
    permission === "denied" ||
    !isSupported ||
    isPermanentlyDismissed ||
    !isVisible
  ) {
    console.log(
      fcmToken,
      permission,
      isSupported,
      isPermanentlyDismissed,
      isVisible
    );
    return null;
  }

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} bg-gradient-to-br to-[#092324] from-emerald-600 text-white rounded-xl shadow-2xl p-4 sm:p-6 w-96 max-w-[calc(100vw-2rem)] z-50 animate-slide-in`}
      role="dialog"
      aria-labelledby="push-notification-title"
      aria-describedby="push-notification-description"
    >
      <button
        onClick={() => handleDismiss(false)}
        className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        aria-label="Dismiss notification prompt"
      >
        <X size={20} />
      </button>

      <div className="flex items-start gap-2 sm:gap-4 mb-4">
        <div className="flex-1">
          <h3
            id="push-notification-title"
            className="font-bold text-lg sm:text-xl mb-2"
          >
            Stay in the Loop! 🔔
          </h3>
          <p
            id="push-notification-description"
            className="text-sm text-white/90 leading-relaxed"
          >
            Get instant notifications for important updates(savings rewards,
            daily yields, points), reminders, and new features.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDismiss(false)}
            disabled={isLoading}
            className="flex-1 px-5 py-3 rounded-full font-medium bg-white/10 transition-colors text-sm disabled:opacity-50"
          >
            Maybe Later
          </button>
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="flex-1 bg-white rounded-full text-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enabling...
              </>
            ) : (
              <>Enable</>
            )}
          </button>
        </div>

        <button
          onClick={() => handleDismiss(true)}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-center w-full rounded-full font-medium hover:bg-white/10 transition-colors text-sm disabled:opacity-50 text-white/80"
        >
          Don't Ask Again
        </button>
      </div>

      {/* <p className="text-xs text-white/60 mt-4 text-center">
        You can change this anytime in your settings
      </p> */}
    </div>
  );
};
