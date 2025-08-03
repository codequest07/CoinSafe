import { JsonRpcProvider } from "ethers";
import { tokens } from "./contract";
// export const base_uri_test = import.meta.env.DEV ? 'http://localhost:1234' : 'https://coinsafe-0q0m.onrender.com';
export const base_uri = "https://coinsafe-0q0m.onrender.com/api/coingecko";

export const getLskToUsd = async (lsk: number) => {
  try {
    const res = await fetch(`${base_uri}/api-cg/lisk`);
    const data = await res.json();

    if (data?.lisk?.usd) {
      return data.lisk.usd * lsk;
    } else {
      throw new Error("LSK data or USD price not available");
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getSafuToUsd = (safu: number) => {
  return 0.339 * safu;
};

export const getUsdtToUsd = async (usdt: number) => {
  try {
    const res = await fetch(`${base_uri}/api-cg/tether`);
    const data = await res.json();

    if (data?.tether?.usd) {
      return data.tether.usd * usdt;
    } else {
      throw new Error("USDT data or USD price not available");
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getUsdcToUsd = async (usdc: number) => {
  try {
    const res = await fetch(`${base_uri}/api-cg/usd-coin`);
    const data = await res.json();

    if (data?.["usd-coin"]?.usd) {
      return data["usd-coin"].usd * usdc;
    } else {
      throw new Error("USDC data or USD price not available");
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export async function getTokenPrice(token: string, amount: number | undefined) {
  if (!token || !amount) return "0.00";

  try {
    switch (token) {
      case tokens.safu: {
        const safuPrice = await getSafuToUsd(amount);
        return safuPrice.toFixed(2);
      }
      case tokens.lsk: {
        const lskPrice = await getLskToUsd(amount);
        return lskPrice.toFixed(2);
      }
      case tokens.usdt: {
        const usdtPrice = await getUsdtToUsd(amount);
        return usdtPrice.toFixed(2);
      }
      case tokens.usdc: {
        const usdcPrice = await getUsdcToUsd(amount);
        return usdcPrice.toFixed(2);
      }
      default:
        return "0.00";
    }
  } catch (error) {
    console.error("Error getting token price:", error);
    return "0.00";
  }
}

export const jsonRpcProvider = new JsonRpcProvider("https://rpc.api.lisk.com");
