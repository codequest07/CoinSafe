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

    console.log("=====================================");
    console.log("USDT", data);
    console.log("=====================================");

    if (data?.tether?.usd) {
      console.log("=====================================");
      console.log("USDT", data);
      console.log("=====================================");
      return data.tether.usd * usdt;
    } else {
      throw new Error("USDT data or USD price not available");
    }
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getUsdt0ToUsd = async (usdt: number) => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-xEDfyZh1gVhZ5LFCEuzwUW6M",
    },
  };

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=usdt0",
      options
    );
    const data = await res.json();

    console.log("=====================================");
    console.log("USDT0", data);
    console.log("=====================================");

    if (data?.usdt0?.usd) {
      console.log("=====================================");
      console.log("USDT0", data);
      console.log("=====================================");
      return data.usdt0.usd * usdt;
    } else {
      throw new Error("USDT0 data or USD price not available");
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
      console.log("=====================================");
      console.log("USDT", data);
      console.log("=====================================");
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

export async function getAvgAPR(
  token?: "usdc" | "usdt" | "lsk"
): Promise<{ avgApr: number | undefined; signature: string | undefined }> {
  const tokenToSymbol = {
    usdc: "USDC.e",
    usdt: "USD₮0",
    lsk: "LSK",
  };

  let url = "https://api.coinsafe.network/api/merkl/apr";

  if (token) {
    const tokenSymbol = tokenToSymbol[token];
    url = `https://api.coinsafe.network/api/merkl/apr?tokenSymbol=${tokenSymbol}`;
  }

  const options = {
    method: "GET",
  };

  try {
    const res = await fetch(url, options);

    const data = await res.json();

    if (!data.success) throw Error(`Fetching token apr failed: ${data.error}`);

    return {
      avgApr: data.summary.averageAPR,
      signature: data.data[0].signature,
    };
  } catch (error) {
    console.error("Error fetching avgApr:", error);
    return { avgApr: undefined, signature: undefined };
  }
}
