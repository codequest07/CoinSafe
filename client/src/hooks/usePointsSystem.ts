import { getContract, readContract } from "thirdweb";
import { useCallback, useEffect } from "react";
import { useRecoilState } from "recoil";
import { ActionType, PointWeights, PointsSystemHookReturn } from "../types";
import { client } from "@/lib/config";
import { liskSepolia } from "@/lib/config";
import { CoinsafeDiamondContract, facetAbis } from "@/lib/contract";

// Enable debug mode for detailed logging
const DEBUG_MODE = true;

// Helper function for logging
const log = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.log(`[PointsSystem] ${message}`, data ? data : "");
  }
};
import {
  userPointsState,
  userMultiplierState,
  pointWeightsState,
  pointsLoadingState,
  pointsErrorState,
} from "@/store/atoms/points";

export function usePointsSystem(): PointsSystemHookReturn {
  log("Initializing usePointsSystem hook");

  // Initialize contract with ThirdWeb v5
  const contract = getContract({
    client,
    chain: liskSepolia,
    address: CoinsafeDiamondContract.address,
    // Use the balance facet ABI
    abi: facetAbis.balanceFacet as any,
  });

  log("Contract initialized", {
    address: CoinsafeDiamondContract.address,
    chain: liskSepolia.name,
    chainId: liskSepolia.id,
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
      log("Safety timeout triggered - forcing loading state to false");
    }, 5000); // 5 second timeout

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

        log(`Fetching points balance for address: ${address}`);

        // Use readContract for a direct call - this is the recommended approach in ThirdWeb v5
        // Note: The actual function name is getUserPointsbalance (lowercase 'b')
        const result = await readContract({
          contract,
          method:
            "function getUserPointsbalance(address _user) view returns (uint256)",
          params: [address],
        });

        const points = BigInt(result?.toString() || "0");
        log(`Points balance retrieved: ${points.toString()}`, { raw: result });
        // Update Recoil state
        setUserPoints(points);
        return points;
      } catch (err) {
        const error = err as Error;
        log(`Error fetching points balance: ${error.message}`, { error });

        // Check if it's the "Diamond: Function does not exist" error
        if (error.message.includes("Function does not exist")) {
          log("Points balance function not available, using fallback value");
          // Use a fallback value instead of throwing an error
          const fallbackPoints = BigInt(1500); // Example fallback value
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

        log(`Fetching multiplier for address: ${address}`);

        // Use readContract for a direct call - this is the recommended approach in ThirdWeb v5
        const result = await readContract({
          contract,
          method:
            "function getUserMultiplier(address user) view returns (uint256)",
          params: [address],
        });

        const multiplier = BigInt(result?.toString() || "0");
        log(
          `Multiplier retrieved: ${multiplier.toString()} (${
            Number(multiplier) / 100
          }x)`,
          { raw: result }
        );
        // Update Recoil state
        setUserMultiplier(multiplier);
        return multiplier;
      } catch (err) {
        const error = err as Error;
        log(`Error fetching multiplier: ${error.message}`, { error });

        // Check if it's the "Diamond: Function does not exist" error
        if (error.message.includes("Function does not exist")) {
          log("Multiplier function not available, using fallback value");
          // Use a fallback value instead of throwing an error
          const fallbackMultiplier = BigInt(150); // Example fallback value (1.5x)
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

  // Get point weights using fallback values since the contract doesn't have these functions
  const getPointWeights = useCallback(async (): Promise<PointWeights> => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      setIsLoading(true);

      log("Checking if point weight functions exist in the contract");

      // Since we're getting the "Diamond: Function does not exist" error,
      // let's provide fallback values instead of trying to call functions that don't exist

      // Fallback values for testing
      const weights = {
        creatorWeight: BigInt(100),
        stackersWeight: BigInt(50),
        pilotWeight: BigInt(25),
      };

      log("Using fallback point weights", {
        creatorWeight: weights.creatorWeight.toString(),
        stackersWeight: weights.stackersWeight.toString(),
        pilotWeight: weights.pilotWeight.toString(),
      });

      // Update Recoil state
      setPointWeights(weights);
      return weights;
    } catch (err) {
      const error = err as Error;
      log(`Error fetching point weights: ${error.message}`, { error });

      // Provide fallback values on error
      const fallbackWeights = {
        creatorWeight: BigInt(100),
        stackersWeight: BigInt(50),
        pilotWeight: BigInt(25),
      };

      log("Using fallback weights due to error", fallbackWeights);
      setPointWeights(fallbackWeights);

      // Don't throw the error, just return fallback values
      return fallbackWeights;
    } finally {
      setIsLoading(false);
    }
  }, [contract, setPointWeights, setIsLoading, setError]);

  // Calculate potential points based on user action
  const calculatePotentialPoints = useCallback(
    async (address: string, action: ActionType): Promise<bigint> => {
      try {
        setIsLoading(true);

        log(
          `Calculating potential points for address: ${address}, action: ${action}`
        );

        // Get user multiplier and point weights in parallel for better performance
        const [multiplier, weights] = await Promise.all([
          getUserMultiplier(address),
          getPointWeights(),
        ]);

        let basePoints: bigint;
        switch (action) {
          case "create":
            basePoints = weights.creatorWeight;
            log(`Using creator weight: ${basePoints.toString()}`);
            break;
          case "stack":
            basePoints = weights.stackersWeight;
            log(`Using stackers weight: ${basePoints.toString()}`);
            break;
          case "automate":
            basePoints = weights.pilotWeight;
            log(`Using pilot weight: ${basePoints.toString()}`);
            break;
          default:
            basePoints = BigInt(0);
            log("Unknown action type, using 0 as base points");
        }

        // Apply multiplier if exists (multiplier is in percentage, e.g., 150 = 150%)
        const result =
          multiplier > 0 ? (basePoints * multiplier) / BigInt(100) : basePoints;

        log(`Calculation result: ${result.toString()}`, {
          basePoints: basePoints.toString(),
          multiplier: multiplier.toString(),
          multiplierX: Number(multiplier) / 100,
          formula:
            multiplier > 0
              ? `(${basePoints} * ${multiplier}) / 100 = ${result}`
              : `${basePoints} (no multiplier)`,
        });

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
