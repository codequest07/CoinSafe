import { JsonRpcProvider } from "ethers";
// export const base_uri_test = import.meta.env.DEV ? 'http://localhost:1234' : 'https://coinsafe-0q0m.onrender.com';
export const base_uri = "https://coinsafe-0q0m.onrender.com";

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


export const jsonRpcProvider = new JsonRpcProvider(
    "https://rpc.sepolia-api.lisk.com"
);