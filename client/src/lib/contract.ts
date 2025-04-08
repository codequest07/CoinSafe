import faucetAbi from "../abi/faucet.json";
import coinSafeAbi from "../abi/coinsafe.json";
import balanceFacetAbi from "../abi/BalanceFacet.json";
import savingsFacetAbi from "../abi/SavingsFacet.json";
import fundingFacetAbi from "../abi/FundingFacet.json";

export const tokens = {
  // usdt: "0xd26Be7331EDd458c7Afa6D8B7fcB7a9e1Bb68909",
  usdt: "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda",
  safu: "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a",
  // safu: "0xcf300d5a3d0fc71865a7c92bbc11d6b79c4d1480",
  // safu: "0xe4923e889a875eae8c164ac1592b57b5684ed90e",
  lsk: "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D",
  // lsk: "0x7a9c712570bb9eb804631836cf333ba9a25fc77d"
};


export const CoinSafeContract = {
  address: "0x727b742EAd5540703b62C7f33312335dcFd83f5A",
  abi: coinSafeAbi,
};

export const CoinsafeDiamondContract = {
  address: "0xda6cf4d86ac271686ace56c554acad7bc6940667",
};

export const FaucetContract = {
  address: "0x6245DF66b74b56D803730d48BF1bF16EEBBBD881",
  abi: faucetAbi,
};

export const facetAbis = {
  balanceFacet: balanceFacetAbi,
  fundingFacet: fundingFacetAbi,
  savingsFacet: savingsFacetAbi,
};
