import faucetAbi from "../abi/faucet.json";
import coinSafeAbi from "../abi/coinsafe.json";
import balanceFacetAbi from "../abi/BalanceFacet.json";
import targetSavingsAbi from "../abi/TargetSavingsFacet.json";
import automatedSavingsFacetAbi from "../abi/AutomatedSavingsFacet.json";
import emergencySavingsFacetAbi from "../abi/EmergencySavingsFacet.json";
import fundingFacetAbi from "../abi/FundingFacet.json";

export const tokens = {
  usdt: "0x05D032ac25d322df992303dCa074EE7392C117b9",
  usdc: "0xF242275d3a6527d877f2c927a82D9b057609cc71",
  safu: "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a",
  lsk: "0xac485391EB2d7D88253a7F1eF18C37f4242D1A24",

};

export const CoinSafeContract = {
  address: "0x727b742EAd5540703b62C7f33312335dcFd83f5A",
  abi: coinSafeAbi,
};

// 0x08b59fb7ee9418470004693acf6d2c7dd0256a69
// unkonw 0x69B417f1937EF6fF93471a247D70a245B6216ca8
export const CoinsafeDiamondContract = {
  //mainnet address
  address: "0xAb82eA18aA9b0F74DEc7F2e7bAdF9D47eF380ADB",
  // address: "0x08b59fb7ee9418470004693acf6d2c7dd0256a69",
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
