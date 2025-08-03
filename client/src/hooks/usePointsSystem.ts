import { getContract, readContract } from "thirdweb";
import { useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { ActionType, PointWeights, PointsSystemHookReturn } from "../types";
import { client } from "@/lib/config";
import { liskMainnet } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";
import {
  userPointsState,
  userMultiplierState,
  pointWeightsState,
  pointsLoadingState,
  pointsErrorState,
} from "@/store/atoms/points";

export function usePointsSystem(): PointsSystemHookReturn {
  const contract = getContract({
    client,
    chain: liskMainnet,
    address: CoinsafeDiamondContract.address,
    abi: facetAbis.balanceFacet as any,
  });

  // Use Recoil for state management
  const [, setUserPoints] = useRecoilState(userPointsState);
  const [, setUserMultiplier] = useRecoilState(userMultiplierState);
  const [isLoading, setIsLoading] = useRecoilState(pointsLoadingState);
  const [error, setError] = useRecoilState(pointsErrorState);

  // Reset loading state on initialization to prevent getting stuck
  useEffect(() => {
    setIsLoading(false);

    // Add a safety timeout to ensure loading state is reset
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second timeout - more aggressive to prevent stuck loading states

    return () => clearTimeout(safetyTimeout);
  }, [setIsLoading]);

  // Get the point weights state
  const [, setPointWeights] = useRecoilState(pointWeightsState);

  // Get user points using readContract
  const getUserPoints = useCallback(
    async (address: string): Promise<bigint> => {
      if (!contract) throw new Error("Contract not initialized");

      try {
        setIsLoading(true);

        const result = await readContract({
          contract,
          method:
            "function getUserPointsbalance(address _user) view returns (uint256)",
          params: [address],
        });

        const points = BigInt(result?.toString() || "0");

        // Update Recoil state
        setUserPoints(points);
        return points;
      } catch (err) {
        const error = err as Error;

        if (error.message.includes("Function does not exist")) {
          // Use a fallback value instead of throwing an error
          const fallbackPoints = BigInt(0);
          setUserPoints(fallbackPoints);
          return fallbackPoints;
        } else {
          setError(error);
          throw error;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [contract, setUserPoints, setIsLoading, setError]
  );

  // Get user multiplier using readContract
  const getUserMultiplier = useCallback(
    async (address: string): Promise<bigint> => {
      if (!contract) throw new Error("Contract not initialized");

      try {
        setIsLoading(true);
        const result = await readContract({
          contract,
          method:
            "function getUserMultiplier(address user) view returns (uint256)",
          params: [address],
        });

        const multiplier = BigInt(result?.toString() || "0");

        // Update Recoil state
        setUserMultiplier(multiplier);
        return multiplier;
      } catch (err) {
        const error = err as Error;

        if (error.message.includes("Function does not exist")) {
          const fallbackMultiplier = BigInt(0);
          setUserMultiplier(fallbackMultiplier);
          return fallbackMultiplier;
        } else {
          setError(error);
          throw error;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [contract, setUserMultiplier, setIsLoading, setError]
  );

  const getPointWeights = useCallback(async (): Promise<PointWeights> => {
    try {
      setIsLoading(true);

      // Fallback values for testing
      const weights = {
        creatorWeight: BigInt(0),
        stackersWeight: BigInt(0),
        pilotWeight: BigInt(0),
      };

      // Update Recoil state
      setPointWeights(weights);
      return weights;
    } catch (err) {
      // Catch potential errors from setIsLoading or setPointWeights
      console.error("[PointsSystem] Unexpected error in getPointWeights:", err); // Log the error

      // Provide fallback values on error anyway
      const fallbackWeights = {
        creatorWeight: BigInt(0),
        stackersWeight: BigInt(0),
        pilotWeight: BigInt(0),
      };

      setPointWeights(fallbackWeights);

      // Don't throw the error, just return fallback values
      return fallbackWeights;
    } finally {
      setIsLoading(false);
    }
  }, [setPointWeights, setIsLoading]);

  // Calculate potential points based on user action
  const calculatePotentialPoints = useCallback(
    async (address: string, action: ActionType): Promise<bigint> => {
      try {
        setIsLoading(true);

        // Get user multiplier and point weights in parallel for better performance
        const [multiplier, weights] = await Promise.all([
          getUserMultiplier(address),
          getPointWeights(),
        ]);

        let basePoints: bigint;
        switch (action) {
          case "create":
            basePoints = weights.creatorWeight;

            break;
          case "stack":
            basePoints = weights.stackersWeight;

            break;
          case "automate":
            basePoints = weights.pilotWeight;
            break;
          default:
            basePoints = BigInt(0);
        }

        // Apply multiplier if exists (multiplier is in percentage, e.g., 150 = 150%)
        const result =
          multiplier > 0 ? (basePoints * multiplier) / BigInt(100) : basePoints;

        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [getUserMultiplier, getPointWeights, setIsLoading, setError]
  );

  return {
    getUserPoints,
    getUserMultiplier,
    getPointWeights,
    calculatePotentialPoints,
    isLoading,
    error,
  };
}
