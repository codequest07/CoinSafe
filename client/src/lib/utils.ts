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
      return await getUsdtToUsd(
        Number(formatUnits(amount, 6))
      );
    case tokens.safu:
      return getSafuToUsd(Number(formatUnits(amount, 18)));
    case tokens.lsk:
      return await getLskToUsd(
        Number(formatUnits(amount, 18))
      );
    default:
      console.error("Unknown token address:", token);
      return 0;
  }
};