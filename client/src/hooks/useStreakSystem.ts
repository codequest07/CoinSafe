import { getContract, readContract } from "thirdweb";
import { useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { client } from "@/lib/config";
import { liskSepolia } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import {
  userCurrentStreakState,
  userLongestStreakState,
  multiplierTiersState,
  streakLoadingState,
  streakErrorState,
  MultiplierTiers,
} from "@/store/atoms/streak";
import { userMultiplierState } from "@/store/atoms/points";

export interface StreakInfo {
  currentStreak: bigint;
  longestStreak: bigint;
  multiplier: bigint;
}

export interface StreakSystemHookReturn {
  getStreakInfo: (address: string) => Promise<StreakInfo>;
  getMultiplierTiers: () => Promise<MultiplierTiers>;
  isLoading: boolean;
  error: Error | null;
}

export function useStreakSystem(): StreakSystemHookReturn {
  const contract = getContract({
    client,
    chain: liskSepolia,
    address: CoinsafeDiamondContract.address,
    abi: facetAbis.balanceFacet as any,
  });

  // Use Recoil for state management
  const [, setUserCurrentStreak] = useRecoilState(userCurrentStreakState);
  const [, setUserLongestStreak] = useRecoilState(userLongestStreakState);
  const [, setUserMultiplier] = useRecoilState(userMultiplierState);
  const [, setMultiplierTiers] = useRecoilState(multiplierTiersState);
  const [isLoading, setIsLoading] = useRecoilState(streakLoadingState);
  const [error, setError] = useRecoilState(streakErrorState);

  // Reset loading state on initialization to prevent getting stuck
  useEffect(() => {
    setIsLoading(false);

    // Add a safety timeout to ensure loading state is reset
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second timeout - more aggressive to prevent stuck loading states

    return () => clearTimeout(safetyTimeout);
  }, [setIsLoading]);

  // Get user streak information
  const getStreakInfo = useCallback(
    async (address: string): Promise<StreakInfo> => {
      if (!contract) throw new Error("Contract not initialized");

      try {
        setIsLoading(true);

        // Use Promise.all to fetch all streak data in parallel
        const [currentStreak, longestStreak, multiplier] = await Promise.all([
          // Get current streak
          readContract({
            contract,
            method:
              "function getUserCurrentStreak(address user) view returns (uint256)",
            params: [address],
          }).catch((_err) => {
            return "0"; // Fallback value
          }),

          // Get longest streak
          readContract({
            contract,
            method:
              "function getUserLongestStreak(address user) view returns (uint256)",
            params: [address],
          }).catch((_err) => {
            return "0"; // Fallback value
          }),

          // Get multiplier
          readContract({
            contract,
            method:
              "function getUserMultiplier(address user) view returns (uint256)",
            params: [address],
          }).catch((_err) => {
            return "0"; // Fallback value (0x)
          }),
        ]);

        // Convert results to BigInt
        const currentStreakBigInt = BigInt(currentStreak?.toString() || "0");
        const longestStreakBigInt = BigInt(longestStreak?.toString() || "0");
        const multiplierBigInt = BigInt(multiplier?.toString() || "0");

        // Update Recoil state
        setUserCurrentStreak(currentStreakBigInt);
        setUserLongestStreak(longestStreakBigInt);
        setUserMultiplier(multiplierBigInt);

        return {
          currentStreak: currentStreakBigInt,
          longestStreak: longestStreakBigInt,
          multiplier: multiplierBigInt,
        };
      } catch (err) {
        const error = err as Error;
        setError(error);

        // Return fallback values on error
        const fallbackInfo = {
          currentStreak: BigInt(0),
          longestStreak: BigInt(0),
          multiplier: BigInt(0),
        };

        // Still update the state with fallback values
        setUserCurrentStreak(fallbackInfo.currentStreak);
        setUserLongestStreak(fallbackInfo.longestStreak);
        setUserMultiplier(fallbackInfo.multiplier);

        return fallbackInfo;
      } finally {
        setIsLoading(false);
      }
    },
    [
      contract,
      setUserCurrentStreak,
      setUserLongestStreak,
      setUserMultiplier,
      setIsLoading,
      setError,
    ]
  );

  // Get multiplier tiers
  const getMultiplierTiers = useCallback(async (): Promise<MultiplierTiers> => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      setIsLoading(true);

      // Fallback values
      const tiers: MultiplierTiers = {
        base: BigInt(0), // 0x
        medium: BigInt(0), // 0x
        ultra: BigInt(0), // 0x
      };

      // Update Recoil state
      setMultiplierTiers(tiers);
      return tiers;
    } catch (err) {
      // Log the error but use fallback values
      console.error("Error fetching multiplier tiers:", err);
      setError(err as Error);

      // Provide fallback values on error
      const fallbackTiers = {
        base: BigInt(0),
        medium: BigInt(0),
        ultra: BigInt(0),
      };

      setMultiplierTiers(fallbackTiers);

      // Don't throw the error, just return fallback values
      return fallbackTiers;
    } finally {
      setIsLoading(false);
    }
  }, [contract, setMultiplierTiers, setIsLoading, setError]);

  return {
    getStreakInfo,
    getMultiplierTiers,
    isLoading,
    error,
  };
}
