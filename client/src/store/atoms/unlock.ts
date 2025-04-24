import { atom } from "recoil";

export interface UnlockState {
  safeId: number;
  token: string;
  amount: number;
  acceptEarlyWithdrawalFee: boolean;
}

export const unlockStateAtom = atom<UnlockState>({
  key: "unlockStateAtom",
  default: {
    safeId: 0,
    token: "",
    amount: 0,
    acceptEarlyWithdrawalFee: true,
  },
});

export const unlockPendingState = atom<boolean>({
  key: "unlockPendingState",
  default: false,
});

export const unlockErrorState = atom<Error | null>({
  key: "unlockErrorState",
  default: null,
});

export const unlockSuccessState = atom<boolean>({
  key: "unlockSuccessState",
  default: false,
});
