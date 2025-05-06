import { atom } from "recoil";
import { PointWeights } from "@/types";
// Import streak-related atoms from streak.ts to re-export them if needed
import { userCurrentStreakState, userLongestStreakState } from "./streak";

// User points balance
export const userPointsState = atom<bigint>({
  key: "userPointsState",
  default: BigInt(0),
});

// User multiplier
export const userMultiplierState = atom<bigint>({
  key: "userMultiplierState",
  default: BigInt(0),
});

// Re-export streak atoms for backward compatibility
export { userCurrentStreakState, userLongestStreakState };

// Point weights for different actions
export const pointWeightsState = atom<PointWeights>({
  key: "pointWeightsState",
  default: {
    creatorWeight: BigInt(0),
    stackersWeight: BigInt(0),
    pilotWeight: BigInt(0),
  },
});

// Loading state
export const pointsLoadingState = atom<boolean>({
  key: "pointsLoadingState",
  default: false,
});

// Error state
export const pointsErrorState = atom<Error | null>({
  key: "pointsErrorState",
  default: null,
});
