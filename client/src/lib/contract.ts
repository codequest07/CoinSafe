import faucetAbi from "../abi/faucet.json";
import coinSafeAbi from "../abi/coinsafe.json";

export const tokens = {
  usdt: "0xd26be7331edd458c7afa6d8b7fcb7a9e1bb68909",
  safu: "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a",
  lsk: "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D"
}

export const CoinSafeContract = {
    address: '0x311F1D1e9668537F3be7e212813eF9eEb076817E',
    abi: coinSafeAbi,
}

export const FaucetContract = {
  address: "0x6245DF66b74b56D803730d48BF1bF16EEBBBD881",
  abi: faucetAbi,
};
