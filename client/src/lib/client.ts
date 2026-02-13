// public viem client primarilly for the purpose of multicall
import { createPublicClient, http } from "viem";
import { lisk, base } from "viem/chains";

const liskClient = createPublicClient({
  chain: lisk,
  transport: http(),
});

const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const getPublicClient = (chainId: number) => {
  if (chainId === base.id) return baseClient;
  return liskClient;
};

// Deprecated: use getPublicClient(chainId) instead
export const publicClient = liskClient;

