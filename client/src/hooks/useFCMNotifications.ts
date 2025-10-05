import { useState, useEffect, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/services/firebase";
import { toast } from "sonner";

interface UseFCMNotificationsConfig {
  vapidKey: string;
  onTokenReceived?: (token: string) => void;
  onError?: (error: Error) => void;
}

export const useFCMNotifications = (config: UseFCMNotificationsConfig) => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);

        if (Notification.permission === "granted") {
          await retrieveToken();
        }
      }
    };

    checkSupport();
  }, []);

  useEffect(() => {
    // Listen for foreground messages and show as toast
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);

      // Show toast notification
      toast(payload.notification?.title || "Notification", {
        description: payload.notification?.body,
        action: payload.data?.url
          ? {
              label: "View",
              onClick: () => (window.location.href = payload?.data?.url || ""),
            }
          : undefined,
      });
    });

    return () => unsubscribe();
  }, []);

  const retrieveToken = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log("FCM Token:", token);
        setFcmToken(token);
        config.onTokenReceived?.(token);
      }
    } catch (err) {
      console.error("Error retrieving FCM token:", err);
    }
  };

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      const errorMsg = "Push notifications are not supported";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);

      if (newPermission !== "granted") {
        const errorMsg = "Notification permission denied";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return false;
      }
      
      console.log("Get navigator ready......")
      // Ensure service worker is registered before accessing ready
      let registration: ServiceWorkerRegistration;
      if (navigator.serviceWorker.controller) {
        registration = await navigator.serviceWorker.ready;
      } else {
        registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        await navigator.serviceWorker.ready;
      }
      console.log("Navigator readyyy...");
      console.log("Registration", registration);
      const token = await getToken(messaging, {
        vapidKey: config.vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        throw new Error("Failed to get FCM token");
      }

      console.log("FCM Token obtained:", token);
      setFcmToken(token);
      config.onTokenReceived?.(token);

      toast.success("Notifications enabled! You'll receive updates.");

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to subscribe";
      setError(errorMessage);
      toast.error("Failed to enable notifications");
      console.error("Error subscribing to FCM:", err);
      config.onError?.(err instanceof Error ? err : new Error(errorMessage));
      setIsLoading(false);
      return false;
    }
  }, [isSupported, config]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      setFcmToken(null);
      toast.success("Notifications disabled");
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unsubscribe";
      setError(errorMessage);
      toast.error("Failed to disable notifications");
      console.error("Error unsubscribing from FCM:", err);
      setIsLoading(false);
      return false;
    }
  }, []);

  return {
    permission,
    fcmToken,
    isSupported,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
};
