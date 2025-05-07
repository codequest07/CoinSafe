import { atom } from "recoil";

export const saveAtom = atom<{
  id: number | null;
  target: string;
  token: string;
  amount: number;
  duration: number;
  typeName: string;
  transactionPercentage: number;
  frequency: number;
}>({
  key: "saveState",
  default: {
    target: "",
    id: null,
    token: "",
    amount: 0,
    duration: 0,
    typeName: "",
    transactionPercentage: 0,
    frequency: 0,
  },
});
