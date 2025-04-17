export type Transaction = {
  date: string;
  type: string;
  amount: string;
  percentage: string;
  icons: any;
  hash: string;
  txnIcon: any;
  token: string;
  network: string;
  time: string;
  status: string;
};

export type ActionType = "create" | "stack" | "automate";

export interface PointWeights {
  creatorWeight: bigint;
  stackersWeight: bigint;
  pilotWeight: bigint;
}

export interface RewardsState {
  create: bigint;
  stack: bigint;
  automate: bigint;
}

export interface PointsSystemHookReturn {
  getUserPoints: (address: string) => Promise<bigint>;
  getUserMultiplier: (address: string) => Promise<bigint>;
  getPointWeights: () => Promise<PointWeights>;
  calculatePotentialPoints: (
    address: string,
    action: ActionType
  ) => Promise<bigint>;
  isLoading: boolean;
  error: Error | null;
}

export interface StreakSystemHookReturn {
  getUserCurrentStreak: (address: string) => Promise<bigint>;
  getUserLongestStreak: (address: string) => Promise<bigint>;
  isLoading: boolean;
  error: Error | null;
}
