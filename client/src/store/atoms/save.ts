import { atom } from "recoil";

export const saveAtom = atom({
  key: "saveState",
  default: {
    target: "",
    id: 0,
    token: '',
    amount: 0,
    duration: 0,
    typeName: '',
    transactionPercentage: 0,
    frequency: 0,
  },
});