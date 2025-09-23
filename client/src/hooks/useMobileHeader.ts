import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useActiveAccount } from "thirdweb/react";
import { userCurrentStreakState } from "@/store/atoms/streak";
import { useStreakSystem } from "@/hooks/useStreakSystem";
import { useGetSafeById } from "@/hooks/useGetSafeById";

/**
 * Custom hook that provides all the data and logic needed for the MobileHeader component
 * @returns Object containing routeName, isLoading, formattedStreak, and message
 */
export const useMobileHeader = () => {
  const account = useActiveAccount();
  const address = account?.address;
  const location = useLocation();
  const params = useParams();
  const [randomMessage, setRandomMessage] = useState("");
  const isVaultDetailPage = location.pathname.includes("/vault/") && params.id;

  // Get streak information
  const { getStreakInfo } = useStreakSystem();
  const currentStreak = useRecoilValue(userCurrentStreakState);

  // Format streak with fire emoji
  const formattedStreak = `${
    currentStreak > 0 ? currentStreak.toString() : "0"
  } days 🔥`;

  // Get random motivational message
  const getRandomMessage = () => {
    const messages = [
      "Why haven't you saved today? Don't miss out!",
      "Saving is the key to greatness! Start now.",
      "Don't let today pass without saving!",
      "Secure your future, one save at a time.",
      "What are you waiting for? Save something!",
      "Every little bit counts. Start saving today!",
      "Take a step toward your goals—save today!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Get current route name - only the last segment
  const getCurrentRouteName = () => {
    const path = location.pathname;

    // Return Dashboard for root path
    if (path === "/") return "Dashboard";

    // If we're on a vault detail page and have safe details, show "Vault / Safe Name"
    if (isVaultDetailPage) {
      if (isLoading) {
        return "Vault / Loading...";
      }
      if (safeDetails?.target) {
        return `Vault / ${safeDetails.target}`;
      }
      return "Vault / Details";
    }

    // Split the path by '/' and get the last non-empty segment
    const segments = path.split("/").filter((segment) => segment !== "");
    const lastSegment = segments[segments.length - 1];

    // Capitalize the first letter
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  // Get safe details if we're on a vault detail page
  const { safeDetails, isLoading } = useGetSafeById(
    isVaultDetailPage ? params.id : undefined
  );

  // This effect runs only once when the component mounts
  useEffect(() => {
    // Generate a new random message when the component mounts
    setRandomMessage(getRandomMessage());
  }, []); // Empty dependency array means this runs only once on mount

  // Separate effect for fetching streak data that runs when address changes
  useEffect(() => {
    // Fetch streak info if address is available
    if (address) {
      getStreakInfo(address).catch((err) => {
        console.error("[MobileHeader] Error fetching streak info:", err);
      });
    }
    // We intentionally omit getStreakInfo from dependencies to prevent
    // constant re-renders and message changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return {
    routeName: getCurrentRouteName(),
    isLoading: isVaultDetailPage ? isLoading : false,
    formattedStreak,
    message: randomMessage,
  };
};
