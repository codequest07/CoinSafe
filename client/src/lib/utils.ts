import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther, formatUnits } from "viem";
import { tokens } from "@/lib/contract";
import { getLskToUsd, getSafuToUsd, getUsdtToUsd } from "@/lib";

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

export const tokenDecimals: Record<string, number> = {
  USDT: 18,
  DEFAULT: 18,
};

export const getTokenDecimals = (token: string): number => {
  return tokenDecimals[token] || tokenDecimals.DEFAULT;
};

export function transformAndAccumulateTokenBalances(
  data: Array<any>
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
  amount: bigint
): Promise<number> => {
  switch (token) {
    case tokens.usdt:
      // this will be changed when going mainnet
      return await getUsdtToUsd(Number(formatUnits(amount, 18)));
    case tokens.safu:
      return getSafuToUsd(Number(formatUnits(amount, 18)));
    case tokens.lsk:
      return await getLskToUsd(Number(formatUnits(amount, 18)));
    default:
      console.error("Unknown token address:", token);
      return 0;
  }
};

export const convertFrequency = (frequency: number, inputUnit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' = 'seconds') => {
  // Validate input
  if (typeof frequency !== 'number' || frequency <= 0) {
    throw new Error('Frequency must be a positive number');
  }

  // Conversion factors to seconds
  const unitConversions = {
    milliseconds: 0.001,
    seconds: 1,
    minutes: 60,
    hours: 3600,
  };

  if (!unitConversions[inputUnit]) {
    throw new Error(`Unsupported unit: ${inputUnit}. Use milliseconds, seconds, minutes, or hours.`);
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
    return 'per day';
  } else if (eventsPerMonth >= 1 && eventsPerMonth <= 12) {
    return 'per month';
  } else if (eventsPerYear >= 1 && eventsPerYear <= 12) {
    return 'per year';
  } else if (eventsPerDay > 30) {
    return 'per day'; // High frequency, best expressed per day
  } else if (eventsPerMonth > 12 && eventsPerDay < 1) {
    return 'per month'; // Moderate frequency, better as per month
  } else {
    return 'per year'; // Low frequency, better as per year
  }
};

export function convertTokenToUSD(tokenValue: any, decimals: number, usdPrice: number) {
  // Convert BigInt to a regular number by dividing by 10^decimals
  const tokenAmount = Number(tokenValue) / Math.pow(10, decimals);
  // Calculate USD value
  const usdValue = tokenAmount * usdPrice;
  // Format to 2 decimal places for USD
  return usdValue.toFixed(2);
}

export const tokenData = {
  "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a": {
    symbol: "SAFU",
    chain: "Lisk",
    color: "bg-[#22c55e]",
    image: "/assets/tokens/safu.png",
  },
  "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda": {
    symbol: "USDT",
    chain: "Lisk",
    color: "bg-[#d54f]",
    image: "/assets/tokens/usdt.jpg",
  },
  "0x8a21CF9Ba08Ae709D64Cb25AfAA951183EC9FF6D": {
    symbol: "LSK",
    chain: "Lisk",
    color: "bg-[#55e]",
    image: "/assets/tokens/lsk.jpg",
  },
} as any;
