import { atom } from "recoil";
import { PointWeights } from "@/types";

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

// User current streak
export const userCurrentStreakState = atom<bigint>({
  key: "userCurrentStreakState",
  default: BigInt(0),
});

// User longest streak
export const userLongestStreakState = atom<bigint>({
  key: "userLongestStreakState",
  default: BigInt(0),
});

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
