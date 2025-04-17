import { atom } from "recoil";

// User current streak
export const userCurrentStreakState = atom<bigint>({
  key: 'userCurrentStreakState',
  default: BigInt(0)
});

// User longest streak
export const userLongestStreakState = atom<bigint>({
  key: 'userLongestStreakState',
  default: BigInt(0)
});

// Multiplier tiers
export interface MultiplierTiers {
  base: bigint;
  medium: bigint;
  ultra: bigint;
}

export const multiplierTiersState = atom<MultiplierTiers>({
  key: 'multiplierTiersState',
  default: {
    base: BigInt(120),   // 1.2x
    medium: BigInt(150), // 1.5x
    ultra: BigInt(200)   // 2.0x
  }
});

// Loading state
export const streakLoadingState = atom<boolean>({
  key: 'streakLoadingState',
  default: false
});

// Error state
export const streakErrorState = atom<Error | null>({
  key: 'streakErrorState',
  default: null
});
