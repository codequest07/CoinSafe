import { JsonRpcProvider } from "ethers";
import { tokens } from "./contract";
import { API_BASE_URL } from "./api-config";
// export const base_uri_test = import.meta.env.DEV ? 'http://localhost:1234' : 'https://coinsafe-0q0m.onrender.com';
export const base_uri = `${API_BASE_URL}/coingecko`;

export const getLskToUsd = async (lsk: number) => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-xEDfyZh1gVhZ5LFCEuzwUW6M",
    },
  };
  try {
    // const res = await fetch(`${base_uri}/api-cg/lisk`);
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=lisk",
      options
    );
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
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-xEDfyZh1gVhZ5LFCEuzwUW6M",
    },
  };

  try {
    // const res = await fetch(`${base_uri}/api-cg/tether`);
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=tether",
      options
    );
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
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-xEDfyZh1gVhZ5LFCEuzwUW6M",
    },
  };
  try {
    // const res = await fetch(`${base_uri}/api-cg/usd-coin`);
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=usd-coin",
      options
    );
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

export type SupportedToken = "usdc" | "usdt" | "lsk";

const tokenToSymbol: Record<SupportedToken, string> = {
  usdc: "USDC.e",
  usdt: "USD₮0",
  lsk: "LSK",
};

interface AprResponse {
  avgApr: number | undefined;
  signature: string | undefined;
}

interface PeriodAprResponse {
  avgApr: number | undefined;
  success: boolean;
  signature: number | undefined;
}

export async function getAvgAPR(opts?: {
  period?: "hour" | "day" | "week" | "month";
  chainId?: number;
  startDate?: string; // ISO format
  endDate?: string; // ISO format
  token?: SupportedToken;
}): Promise<AprResponse | PeriodAprResponse> {
  const baseUrl = "https://api.coinsafe.network/api/merkl";

  const { period, chainId, startDate, endDate, token } = opts || {};

  const isPeriodRequest = period || startDate || endDate || chainId;

  // ---------------------------
  // 📌 CASE 1: Fetch HISTORICAL APR (period)
  // ---------------------------
  if (isPeriodRequest) {
    const params = new URLSearchParams();

    if (period) params.append("groupBy", period);
    if (chainId) params.append("chainId", chainId.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    if (token) {
      params.append("tokenSymbol", tokenToSymbol[token]);
    }

    const url = `${baseUrl}/apr/period?${params.toString()}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        throw new Error(`Fetching historical APR failed: ${data.error}`);
      }

      // console.log("Dataaaaaaaaaaa", data)

      return {
        success: data.success,
        avgApr: data?.summary?.overallStatistics?.mean,
        signature: "",
      }; // Full period response (includes summary + all periods)
    } catch (error) {
      console.error("Error fetching historical APR:", error);
      return {
        success: false,
        avgApr: undefined,
        signature: undefined,
      };
    }
  }

  // ---------------------------
  // 📌 CASE 2: Fetch CURRENT APR
  // ---------------------------
  let url = `${baseUrl}/apr`;
  if (token) {
    url = `${url}?tokenSymbol=${tokenToSymbol[token]}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success)
      throw new Error(`Fetching token apr failed: ${data.error}`);

    return {
      avgApr: data.summary.averageAPR,
      signature: data.data?.[0]?.signature,
    };
  } catch (error) {
    console.error("Error fetching avgApr:", error);
    return { avgApr: undefined, signature: undefined };
  }
}
