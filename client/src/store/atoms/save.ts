import { atom } from "recoil";

export const saveAtom = atom({
  key: "saveState",
  default: {
    token: '',
    amount: 0,
    duration: 0,
    typeName: ''
  },
});