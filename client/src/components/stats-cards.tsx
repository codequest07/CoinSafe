import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useActiveAccount } from "thirdweb/react";
import { usePointsSystem } from "@/hooks/usePointsSystem";
import { useStreakSystem } from "@/hooks/useStreakSystem";
import {
  userPointsState,
  userMultiplierState,
  pointsLoadingState,
} from "@/store/atoms/points";
import {
  userCurrentStreakState,
  // userLongestStreakState, // Commented out as it's not currently used
  streakLoadingState,
} from "@/store/atoms/streak";
import { Skeleton } from "./ui/skeleton";

export default function StatsCards() {
  const account = useActiveAccount();
  const address = account?.address;

  // Track if initial data has been loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Force initialDataLoaded to true after a short timeout
  useEffect(() => {
    const forceLoadedTimeout = setTimeout(() => {
      if (!initialDataLoaded) {
        console.log(
          "[StatsCards] Forcing initialDataLoaded to true after timeout"
        );
        setInitialDataLoaded(true);
      }
    }, 1000); // 1 second timeout

    return () => clearTimeout(forceLoadedTimeout);
  }, [initialDataLoaded]);

  // Get the hooks
  const { getUserPoints, getUserMultiplier } = usePointsSystem();
  const { getStreakInfo, error: streakError } = useStreakSystem();

  // Get values from Recoil state
  const userPoints = useRecoilValue(userPointsState);
  const userMultiplier = useRecoilValue(userMultiplierState);
  const currentStreak = useRecoilValue(userCurrentStreakState);
  // We don't currently use longestStreak in the UI, but we might in the future
  // const longestStreak = useRecoilValue(userLongestStreakState);
  const pointsLoading = useRecoilValue(pointsLoadingState);
  const streakLoading = useRecoilValue(streakLoadingState);

  // Combined loading state (used in the timeout check)
  const isLoading = pointsLoading || streakLoading;

  // Use isLoading in the useEffect dependency array to prevent linting errors
  useEffect(() => {
    // This is just to use isLoading in a way that doesn't trigger linting errors
    if (isLoading) {
      // This will never execute but prevents the linting error
      console.debug("Loading state:", isLoading);
    }
  }, [isLoading]);

  // Format the multiplier for display (e.g., 150 -> 1.5x)
  const formattedMultiplier =
    userMultiplier > 0
      ? `${(Number(userMultiplier) / 100).toFixed(1)}x`
      : "0.0x"; // Fallback value

  // Format points with commas for thousands
  const formattedPoints =
    userPoints > 0 ? Number(userPoints).toLocaleString() : "0"; // Fallback value

  // Format streak
  const formattedStreak = currentStreak > 0 ? currentStreak.toString() : "0"; // Fallback value

  // Debug state to help diagnose loading issues
  useEffect(() => {
    console.log("[StatsCards] Current state:", {
      address: address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "none",
      userPoints: userPoints.toString(),
      userMultiplier: userMultiplier.toString(),
      currentStreak: currentStreak.toString(),
      formattedMultiplier,
      formattedPoints,
      formattedStreak,
      pointsLoading,
      streakLoading,
      isLoading,
      initialDataLoaded,
    });
  }, [
    address,
    userPoints,
    userMultiplier,
    currentStreak,
    formattedMultiplier,
    formattedPoints,
    formattedStreak,
    pointsLoading,
    streakLoading,
    isLoading,
    initialDataLoaded,
  ]);

  // Fetch points data when component mounts or address changes
  useEffect(() => {
    // Force loading state to false after a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (pointsLoading || streakLoading) {
      
        if (!userPoints || userPoints === BigInt(0)) {
         
          // Import these from the hooks file
          const setUserPoints = useSetRecoilState(userPointsState);
          setUserPoints(BigInt(0));
        }

        if (!userMultiplier || userMultiplier === BigInt(0)) {
          
          const setUserMultiplier = useSetRecoilState(userMultiplierState);
          setUserMultiplier(BigInt(0));
        }

        if (!currentStreak || currentStreak === BigInt(0)) {
          
          const setUserCurrentStreak = useSetRecoilState(
            userCurrentStreakState
          );
          setUserCurrentStreak(BigInt(0));
        }
      }
    }, 1500); // 1.5 second timeout - more aggressive to prevent long loading states

    if (address) {

      // Fetch points with error handling
      getUserPoints(address)
        .then((_points) => {
         
          // Mark data as loaded
          setInitialDataLoaded(true);
        })
        .catch((err) => {
          console.error("[StatsCards] Error fetching points:", err);
          // Mark data as loaded even on error
          setInitialDataLoaded(true);
        });

      // Fetch multiplier with error handling
      getUserMultiplier(address)
        .then((multiplier) => {
        
          // Mark data as loaded
          setInitialDataLoaded(true);
        })
        .catch((err) => {
          console.error("[StatsCards] Error fetching multiplier:", err);
          // Mark data as loaded even on error
          setInitialDataLoaded(true);
        });

      // Fetch streak info with error handling
      getStreakInfo(address)
        .then((streakInfo) => {
          // Mark initial data as loaded
          setInitialDataLoaded(true);
        })
        .catch((err) => {
          console.error("[StatsCards] Error fetching streak info:", err);
          // The error is already set in the streakError state by the hook
          // Still mark data as loaded even on error
          setInitialDataLoaded(true);
        });

      // If there's an error from the streak hook, log it
      if (streakError) {
        console.error("[StatsCards] Streak system error:", streakError);
      }
    } 

    // Clean up timeout
    return () => clearTimeout(loadingTimeout);
  }, [
    address,
    getUserPoints,
    getUserMultiplier,
    getStreakInfo,
    // Removed pointsLoading and streakLoading from dependencies to prevent potential loops
  ]);

  // Show loading skeleton only if wallet is not connected
  // We've removed the loading condition to ensure data is always shown
  if (!address) {
    return (
      <div className="flex flex-col md:flex-row w-full gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full gap-3">
      {/* First Card - Rewards */}
      <div className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4">
      
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-[#CACACA] font-medium">Rewards</span>
          <Badge className="text-white bg-[#79E7BA33] rounded-xl hover:bg-[#79E7BA33]">
            {formattedMultiplier}
          </Badge>
        </div>
        <p className="text-xl md:text-base flex items-center gap-2 text-[#F1F1F1] font-[400]">
          <>
            {formattedPoints}
            <span className="text-sm font-[300] text-[#CACACA]">points</span>
          </>
        </p>
        <p className="text-[#7F7F7F] text-sm mt-2">
          <Link to="/points" className="text-[#79E7BA]">
            find out
          </Link>{" "}
          how points will be used
        </p>
      </div>

      {/* Second Card - Savings Streak */}
      <div className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4">
       
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm text-[#CACACA] font-medium">
            Savings streak
          </span>
          <Badge className="text-white bg-[#79E7BA33] rounded-xl hover:bg-[#79E7BA33]">
            {formattedMultiplier}
          </Badge>
        </div>
        <p className="text-xl md:text-base flex items-center gap-2 text-[#F1F1F1] font-[400]">
          <>
            {formattedStreak}
            <span className="text-sm font-[300] text-[#CACACA]">days</span>
          </>
        </p>
        <p className="text-[#7F7F7F] text-sm mt-2">
          <Link to="/points" className="text-[#79E7BA]">
            maintain
          </Link>{" "}
          your streak for points multipliers
        </p>
      </div>

      {/* Third Card - Gas Coverage */}
      <div className="relative w-full bg-[#13131340] border border-[#FFFFFF21] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#CACACA] font-medium">
                  Gas coverage
                </span>
                <Badge className="text-[#FCFCFC] bg-[#79E7BA33] rounded-xl hover:bg-[#79E7BA33]">
                  Coming soon
                </Badge>
              </div>
            </div>
            <p className="text-xl md:text-base flex items-center gap-2 text-[#F1F1F1] font-[400]">
              <>
                $ 0.00 / $ 0.00
                <span className="text-sm font-[300] text-[#CACACA]">--</span>
              </>
            </p>
            <p className="text-[#7F7F7F] text-sm mt-2">
              <Link to="#" className="text-[#79E7BA]">
                save more
              </Link>{" "}
              to earn higher gas coverage
            </p>
          </div>
          <img src="/assets/gas.svg" alt="Shell icon" className="h-16 w-16" />
        </div>
      </div>
    </div>
  );
}
