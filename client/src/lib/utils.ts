import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther, formatUnits } from "viem";
import { chainConfigs } from "@/lib/chains";
import { getTokenPrice, getSignedAprForClaimAll } from "@/lib";
import { TokenInfo } from "thirdweb/react";
import { getContract, readContract } from "thirdweb";
import { client, liskMainnet, base } from "@/lib/config";
import { CoinsafeDiamondContract } from "@/lib/contract";
import {
  tokenData,
  getTokenDecimals,
  tokenDecimals,
} from "@/lib/token-metadata";
export { tokenData, getTokenDecimals, tokenDecimals };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getValidNumberValue(value: any) {
  return typeof value === "number" && !isNaN(value) ? value : 0;
}

export const getPercentage = (a: number, b: number): number =>
  isFinite(a / b) ? Number(((a / b) * 100).toFixed()) : 0;

export function formatNumberToMax7Dp(num: number, maxDecimals = 7) {
  const [intPart, decimalPart] = num.toString().split(".");

  if (!decimalPart) return intPart; // No decimal part, return as is

  const trimmedDecimal = decimalPart.slice(0, maxDecimals);

  return `${intPart}.${trimmedDecimal}`;
}

export function transformAndAccumulateTokenBalances(
  data: Array<any>,
): { token: string; balance: string }[] {
  const tokenMap: { [key: string]: bigint } = {};

  // Accumulate balances for each token
  data.forEach((item) => {
    const token = item.token;
    const amount = BigInt(item.amount);
    if (tokenMap[token]) {
      tokenMap[token] += amount; // Add to existing balance
    } else {
      tokenMap[token] = amount; // Initialize balance
    }
  });

  // Transform the accumulated balances into the desired format
  return Object.entries(tokenMap).map(([token, balance]) => ({
    token,
    balance: formatEther(balance), // Format balance to ether
  }));
}

export const convertTokenAmountToUsd = async (
  token: string,
  amount: bigint,
): Promise<number> => {
  const tokenDecimals = getTokenDecimals(token);
  const numericAmount = Number(formatUnits(amount, tokenDecimals));

  // Use the central price fetching logic
  const priceString = await getTokenPrice(token, numericAmount);
  return Number(priceString) || 0;
};

export const convertFrequency = (
  frequency: number,
  inputUnit: "milliseconds" | "seconds" | "minutes" | "hours" = "seconds",
) => {
  // Validate input
  if (typeof frequency !== "number" || frequency <= 0) {
    throw new Error("Frequency must be a positive number");
  }

  // Conversion factors to seconds
  const unitConversions = {
    milliseconds: 0.001,
    seconds: 1,
    minutes: 60,
    hours: 3600,
  };

  if (!unitConversions[inputUnit]) {
    throw new Error(
      `Unsupported unit: ${inputUnit}. Use milliseconds, seconds, minutes, or hours.`,
    );
  }

  // Convert frequency to seconds
  const frequencyInSeconds = frequency * unitConversions[inputUnit];

  // Time periods in seconds
  const secondsInDay = 24 * 60 * 60; // 86,400 seconds
  const secondsInMonth = 30.4167 * secondsInDay; // Approx 2,627,998.08 seconds
  const secondsInYear = 365.25 * secondsInDay; // Approx 31,557,600 seconds

  // Calculate events per period
  const eventsPerDay = secondsInDay / frequencyInSeconds;
  const eventsPerMonth = secondsInMonth / frequencyInSeconds;
  const eventsPerYear = secondsInYear / frequencyInSeconds;

  // Determine the best period based on the number of events
  if (eventsPerDay >= 1 && eventsPerDay <= 30) {
    return "per day";
  } else if (eventsPerMonth >= 1 && eventsPerMonth <= 12) {
    return "per month";
  } else if (eventsPerYear >= 1 && eventsPerYear <= 12) {
    return "per year";
  } else if (eventsPerDay > 30) {
    return "per day"; // High frequency, best expressed per day
  } else if (eventsPerMonth > 12 && eventsPerDay < 1) {
    return "per month"; // Moderate frequency, better as per month
  } else {
    return "per year"; // Low frequency, better as per year
  }
};

export function formatTimeFrequency(frequency: any) {
  const frequencyMap = [
    { value: 86400n, label: "Every day" },
    { value: 172800n, label: "Every 2 days" },
    { value: 432000n, label: "Every 5 days" },
    { value: 604800n, label: "Weekly" },
    { value: 2592000n, label: "Monthly" },
  ];

  const match = frequencyMap.find((item) => item.value === frequency);
  return match ? match.label : `Every ${frequency} seconds`;
}

// Example usage removed

export function convertTokenToUSD(
  tokenValue: any,
  decimals: number,
  usdPrice: number,
) {
  // Convert BigInt to a regular number by dividing by 10^decimals
  const tokenAmount = Number(tokenValue) / Math.pow(10, decimals);
  // Calculate USD value
  const usdValue = tokenAmount * usdPrice;
  // Format to 2 decimal places for USD
  return usdValue.toFixed(2);
}

export const thirdwebSupportedTokens: Record<number, Array<TokenInfo>> = {
  [liskMainnet.id]: [
    {
      address: chainConfigs[liskMainnet.id].tokens.usdt!,
      icon: tokenData[chainConfigs[liskMainnet.id].tokens.usdt!]?.image,
      name: tokenData[chainConfigs[liskMainnet.id].tokens.usdt!]?.symbol,
      symbol: tokenData[chainConfigs[liskMainnet.id].tokens.usdt!]?.symbol,
    },
    {
      address: chainConfigs[liskMainnet.id].tokens.usdc,
      icon: tokenData[chainConfigs[liskMainnet.id].tokens.usdc!]?.image,
      name: tokenData[chainConfigs[liskMainnet.id].tokens.usdc!]?.symbol,
      symbol: tokenData[chainConfigs[liskMainnet.id].tokens.usdc!]?.symbol,
    },
    {
      address: chainConfigs[liskMainnet.id].tokens.lsk!,
      icon: tokenData[chainConfigs[liskMainnet.id].tokens.lsk!]?.image,
      name: tokenData[chainConfigs[liskMainnet.id].tokens.lsk!]?.symbol,
      symbol: tokenData[chainConfigs[liskMainnet.id].tokens.lsk!]?.symbol,
    },
    {
      address: chainConfigs[liskMainnet.id].tokens.usdt0!,
      icon: tokenData[chainConfigs[liskMainnet.id].tokens.usdt0!]?.image,
      name: tokenData[chainConfigs[liskMainnet.id].tokens.usdt0!]?.symbol,
      symbol: tokenData[chainConfigs[liskMainnet.id].tokens.usdt0!]?.symbol,
    },
  ],
  [base.id]: [
    {
      address: chainConfigs[base.id].tokens.usdc,
      icon: "/assets/tokens/usdc.png",
      name: "USDC",
      symbol: "USDC",
    },
  ],
};

export const getContractFeePercentage = async (
  duration: number,
  user: string,
) => {
  const contract = getContract({
    client: client,
    address: CoinsafeDiamondContract.address,
    chain: liskMainnet,
  });

  const feePercentage = await readContract({
    contract: contract,
    method:
      "function calculateFeePercentage(uint256 duration,address user) external view returns (uint256)",
    params: [BigInt(duration), user],
  });

  return feePercentage;
};

export const getMorphoVaultAddressForToken = async (tokenAddress: string) => {
  const contract = getContract({
    client: client,
    address: CoinsafeDiamondContract.address,
    chain: liskMainnet,
  });

  const vault = await readContract({
    contract: contract,
    method:
      "function getMorphoVault(address token) external view returns (address)",
    params: [tokenAddress],
  });

  return vault;
};

export const getUserTokenYield = async (
  tokenAddress: string,
  feePercentage: number,
  tokenShares: bigint,
  principal: bigint,
) => {
  const contract = getContract({
    client: client,
    address: CoinsafeDiamondContract.address,
    chain: liskMainnet,
  });

  const vaultAddress = await getMorphoVaultAddressForToken(tokenAddress);

  if (!vaultAddress) throw new Error("Vault address not found!");

  const assets = await readContract({
    contract: contract,
    method:
      "function convertSharesToAssets(uint256 shares, address vaultAddress) external view returns (uint256)",
    params: [tokenShares, vaultAddress],
  });

  const effectiveYield =
    (100 - Number(feePercentage) / 100) * Number(assets - principal);

  return BigInt(effectiveYield);
};

export const getSafeLSKRewards = async (safeId: string, account: any) => {
  const contract = getContract({
    client: client,
    address: CoinsafeDiamondContract.address,
    chain: liskMainnet,
  });

  const { avgAPR } = await getSignedAprForClaimAll();

  const rewards = await readContract({
    contract: contract,
    method:
      "function previewWithdrawalLSKRewards(uint256 _safeId, uint256 _avgAPR ) external view returns (uint256 projectedLSK,uint256 availableLSK,uint256 claimableLSK,uint256 claimableWithFeeApplied)",
    params: [BigInt(safeId), avgAPR],
    from: account?.address,
  });

  return formatEther(rewards[0]);
};
