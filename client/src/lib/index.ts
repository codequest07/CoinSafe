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

    const lowerToken = token.toLowerCase();

    switch (lowerToken) {
      case tokens.safu.toLowerCase():
        finalPrice = await getSafuToUsd(amount);
        break;
      case tokens.lsk.toLowerCase():
        finalPrice = await getLskToUsd(amount);
        break;
      case tokens.usdt.toLowerCase():
        finalPrice = await getUsdtToUsd(amount);
        break;
      case tokens.usdc.toLowerCase():
        finalPrice = await getUsdcToUsd(amount);
        break;
      case tokens.usdt0.toLowerCase():
        // Handle usdt0 same as usdt? Or create new helper. assuming same price as usdt for now
        finalPrice = await getUsdtToUsd(amount);
        break;
      default:
        // Check if there are other tokens
        return "0.00";
    }
    
    return finalPrice.toFixed(5);
  } catch (error) {
    console.error("Error getting token price:", error);
    return "0.00";
  }
}

export const jsonRpcProvider = new JsonRpcProvider("https://rpc.api.lisk.com");

export * from "./apr-api";
