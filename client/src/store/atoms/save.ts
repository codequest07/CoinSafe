import { atom } from "recoil";

export const saveAtom = atom({
  key: "saveState",
  default: {
    token: '',
    amount: 0,
    duration: 0,
    typeName: '',
    transactionPercentage: 0,
    frequency: 0,
  },
});

export const availableBalanceState = atom({
  key: 'availableBalanceState',
  default: 0
});

export const savingsBalanceState = atom({
  key: 'savingsBalanceState', 
  default: 0
});

export const totalBalanceState = atom({
  key: 'totalBalanceState',
  default: 0
});