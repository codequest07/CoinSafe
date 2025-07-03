import faucetAbi from "../abi/faucet.json";
import coinSafeAbi from "../abi/coinsafe.json";
import balanceFacetAbi from "../abi/BalanceFacet.json";
import targetSavingsAbi from "../abi/TargetSavingsFacet.json";
import automatedSavingsFacetAbi from "../abi/AutomatedSavingsFacet.json";
import emergencySavingsFacetAbi from "../abi/EmergencySavingsFacet.json";
import fundingFacetAbi from "../abi/FundingFacet.json";

export const tokens = {
  // usdt: "0xd26Be7331EDd458c7Afa6D8B7fcB7a9e1Bb68909",
  usdt: "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda",
  usdc: "0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83",
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

// 0x08b59fb7ee9418470004693acf6d2c7dd0256a69
// unkonw 0x69B417f1937EF6fF93471a247D70a245B6216ca8
export const CoinsafeDiamondContract = {
  address: "0x08b59fb7ee9418470004693acf6d2c7dd0256a69",
  // old diamond address
  //address: "0xda6cf4d86ac271686ace56c554acad7bc6940667",
};

export const FaucetContract = {
  address: "0x03F8E9E2bD6dF99F72C30293e7A033d75e6c43B7",
  abi: faucetAbi,
};

export const facetAbis = {
  balanceFacet: balanceFacetAbi,
  fundingFacet: fundingFacetAbi,
  automatedSavingsFacet: automatedSavingsFacetAbi,
  targetSavingsFacet: targetSavingsAbi,
  emergencySavingsFacet: emergencySavingsFacetAbi,
};
