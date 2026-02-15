import { JsonRpcProvider } from "ethers";
import { tokens } from "./contract";
import { API_BASE_URL } from "./api-config";
// export const base_uri_test = import.meta.env.DEV ? 'http://localhost:1234' : 'https://coinsafe-0q0m.onrender.com';
export const base_uri = `${API_BASE_URL}`;

import { getStoredTokenPrice } from "./price-service";

export const getLskToUsd = async (lsk: number) => {
  const price = await getStoredTokenPrice("lsk");
  return price * lsk;
};

export const getSafuToUsd = (safu: number) => {
  return 0.339 * safu; // Kept as synchronous calculation since it's hardcoded
};

export const getUsdtToUsd = async (usdt: number) => {
  const price = await getStoredTokenPrice("usdt");
  return price * usdt;
};

export const getUsdcToUsd = async (usdc: number) => {
  const price = await getStoredTokenPrice("usdc");
  return price * usdc;
};

export async function getTokenPrice(token: string, amount: number | undefined) {
  if (!token || !amount) return "0.00";

  try {
    // Basic mapping or direct usage
    let finalPrice = 0;

    switch (token) {
      case tokens.safu:
        // SAFU might be special or just use the same logic
        // The original code used a sync helper, but we can treat it same if we want consistency
        // For now, let's stick to the specific helpers which now use the cache
        finalPrice = await getSafuToUsd(amount);
        break;
      case tokens.lsk:
        finalPrice = await getLskToUsd(amount);
        break;
      case tokens.usdt:
        finalPrice = await getUsdtToUsd(amount);
        break;
      case tokens.usdc:
        finalPrice = await getUsdcToUsd(amount);
        break;
      default:
        // Attempt generic fetch if it's a known token elsewhere?
        // For now return 0 as per original
        return "0.00";
    }
    return finalPrice.toFixed(2);
  } catch (error) {
    console.error("Error getting token price:", error);
    return "0.00";
  }
}

export const jsonRpcProvider = new JsonRpcProvider("https://rpc.api.lisk.com");
