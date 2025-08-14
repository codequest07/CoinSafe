import { Card } from "../ui/card";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { useActiveAccount } from "thirdweb/react";
import { usePointsSystem } from "@/hooks/usePointsSystem";
import { useStreakSystem } from "@/hooks/useStreakSystem";
import {
  userPointsState,
  userMultiplierState,
  pointsLoadingState,
} from "@/store/atoms/points";
import { streakLoadingState } from "@/store/atoms/streak";
import { Skeleton } from "../ui/skeleton";

const PercentageCard = () => {
  const account = useActiveAccount();
  const address = account?.address;

  // Get the hooks
  const { getUserPoints, getUserMultiplier } = usePointsSystem();
  const { getStreakInfo } = useStreakSystem();

  // Get values from Recoil state
  const userPoints = useRecoilValue(userPointsState);
  const userMultiplier = useRecoilValue(userMultiplierState);
  const pointsLoading = useRecoilValue(pointsLoadingState);
  const streakLoading = useRecoilValue(streakLoadingState);

  // Track if initial data has been loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Format the multiplier for display (e.g., 150 -> 1.5x)
  const formattedMultiplier =
    userMultiplier > 0
      ? `${(Number(userMultiplier) / 100).toFixed(1)}x`
      : "0.0x"; // Fallback value

  // Format points with commas for thousands
  const formattedPoints =
    userPoints > 0 ? Number(userPoints).toLocaleString() : "0"; // Fallback value


  // Fetch data when component mounts or address changes
  useEffect(() => {
    if (address) {

      // Fetch points with error handling
      getUserPoints(address)
        .then(() => setInitialDataLoaded(true))
        .catch((err) => {
          console.error("[PercentageCard] Error fetching points:", err);
          setInitialDataLoaded(true); // Set loaded even on error
        });

      // Fetch multiplier with error handling
      getUserMultiplier(address).catch((err) => {
        console.error("[PercentageCard] Error fetching multiplier:", err);
      });

      // Fetch streak info with error handling
      getStreakInfo(address).catch((err) => {
        console.error("[PercentageCard] Error fetching streak info:", err);
      });

      // Add a timeout to ensure loading state doesn't persist indefinitely
      const timeout = setTimeout(() => {
        setInitialDataLoaded(true);
      }, 1500); // 1.5 second timeout

      return () => clearTimeout(timeout);
    }
  }, [address]);

  // Card data with dynamic values
  const cardData = [
    {
      title: "Savings points",
      amount: formattedPoints,
      link: "find out",
      text: "how points will be used",
      loading: !initialDataLoaded && pointsLoading,
    },
    {
      title: "Referral points",
      amount: "0",
      link: "refer",
      text: "more people to get more points",
      badge: "Coming soon",
      loading: false,
    },
    {
      title: "Points multiplier",
      amount: formattedMultiplier,
      link: "find out",
      text: "how points will be used",
      loading: !initialDataLoaded && streakLoading,
    },
  ];

  // Show loading skeleton for the entire section if wallet is not connected or data is still loading
  if (!address || (!initialDataLoaded && (pointsLoading || streakLoading))) {
    return (
      <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="flex border border-[#FFFFFF17] flex-col items-start gap-4 bg-[#13131340] text-white rounded-lg py-6 px-2 shadow-lg w-full">
            <div className="flex justify-between items-center w-full">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-32 mb-4" />
            </div>
            <Skeleton className="h-4 w-48" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
      {cardData.map((item, index) => (
        <Card
          key={index}
          className="flex border border-[#FFFFFF17] flex-col items-start gap-4 bg-[#13131340] text-white rounded-lg py-6 px-2 shadow-lg w-full relative">
          {item.loading && (
            <div className="absolute top-0 left-0 w-full h-0.5">
              <div
                className="h-full bg-[#79E7BA] animate-pulse rounded-t-lg opacity-30"
                style={{ width: "100%" }}></div>
            </div>
          )}
          <div className="flex justify-between items-center w-full">
            <h3 className="text-base font-semibold">{item.title}</h3>
            {item.badge && (
              <Badge className="bg-[#79E7BA33] hover:bg-[#79E7BA33] text-[#F1F1F1] rounded-[2rem] py-1">
                {item.badge}
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {item.loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <>
                <p className="text-xl text-[#7F7F7F]">{item.amount}</p>
                {item.title !== "Points multiplier" && (
                  <span className="text-xs mt-2 text-[#7F7F7F]">points</span>
                )}
              </>
            )}
          </div>
          <p>
            <Link
              to="/save-assets"
              className="text-[12px] text-[#79E7BA] items-center justify-center rounded-md">
              {item.link}
            </Link>{" "}
            <span className="text-xs text-[#7F7F7F]">{item.text}</span>
          </p>
        </Card>
      ))}
    </div>
  );
};

export default PercentageCard;
