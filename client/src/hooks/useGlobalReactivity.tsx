import { useActiveAccount } from "thirdweb/react";
import { useQueryClient } from "@tanstack/react-query";
import { useWatchEvents } from "./useWatchEvents";
import { useSetRecoilState } from "recoil";
import {
  availableBalanceState,
  savingsBalanceState,
  totalBalanceState,
} from "@/store/atoms/balance";

import {
  userCurrentStreakState as streakState,
  userLongestStreakState as longestStreakState,
} from "@/store/atoms/streak";

export const useGlobalReactivity = () => {
  const account = useActiveAccount();
  const queryClient = useQueryClient();

  // We can still update atoms optimistically/reactively if we want instant feedback
  // But invalidateQueries handles the definitive source of truth.
  const setAvailableBalance = useSetRecoilState(availableBalanceState);
  const setSavingsBalance = useSetRecoilState(savingsBalanceState);
  const setTotalBalance = useSetRecoilState(totalBalanceState);
  const setUserCurrentStreak = useSetRecoilState(streakState);
  const setUserLongestStreak = useSetRecoilState(longestStreakState);

  useWatchEvents({
    address: account?.address as string,
    onDeposit: (amountInUsd) => {
      // Optimistic update (optional, but requested for reactivity)
      setAvailableBalance((prev) => prev + amountInUsd);
      setTotalBalance((prev) => prev + amountInUsd);

      // Source of truth update
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["safes"] });
    },
    onWithdraw: (amountInUsd) => {
      setAvailableBalance((prev) => prev - amountInUsd);
      setTotalBalance((prev) => prev - amountInUsd);

      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["safes"] });
    },
    onSave: (amountInUsd) => {
      setAvailableBalance((prev) => prev - amountInUsd);
      setSavingsBalance((prev) => prev + amountInUsd);

      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["safes"] });
      queryClient.invalidateQueries({ queryKey: ["automatedSafe"] });
    },
    onClaim: (amountInUsd) => {
      setSavingsBalance((prev) => prev - amountInUsd);
      setAvailableBalance((prev) => prev + amountInUsd);

      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["safes"] });
      queryClient.invalidateQueries({ queryKey: ["automatedSafe"] });
    },
    onSavingsWithdrawn: (amountInUsdToDeduct, amountInUsdToAdd) => {
      setSavingsBalance((prev) => prev - amountInUsdToDeduct);
      setAvailableBalance((prev) => prev + amountInUsdToAdd);

      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["safes"] });
    },
    onStreakUpdate: (streak) => {
      setUserCurrentStreak((prev) => prev + BigInt(streak));
      setUserLongestStreak((prev) => prev + BigInt(streak));
      // No query invalidation needed for streaks unless we have a streak query
    },
    onSwap: () => {
      // Swap affects balances of specific tokens.
      // The general "balances" query should cover this.
      queryClient.invalidateQueries({ queryKey: ["balances"] });
    },
  });
};
