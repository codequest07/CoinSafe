import faucetAbi from "../abi/faucet.json";
import coinSafeAbi from "../abi/coinsafe.json";

export const tokens = {
  usdt: "0xd26Be7331EDd458c7Afa6D8B7fcB7a9e1Bb68909",
  safu: "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a",
  lsk: "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D",
};

export const CoinSafeContract = {
  address: "0x727b742EAd5540703b62C7f33312335dcFd83f5A",
  abi: coinSafeAbi,
};

export const FaucetContract = {
  address: "0x6245DF66b74b56D803730d48BF1bF16EEBBBD881",
  abi: faucetAbi,
};
