// export const base_uri_test = import.meta.env.DEV ? 'http://localhost:1234' : 'https://coinsafe-1-1jw5.onrender.com';
export const base_uri = 'https://coinsafe-1-1jw5.onrender.com';

export const getLskToUsd = async (lsk: number) => {
  try {
    const res = await fetch(`${base_uri}/api-cg/lisk`);
    console.log(res);
    const data = await res.json();

    // console.log(data?.lisk?.usd);

    if (data?.lisk?.usd) {
        // console.log("return val: ", data.lisk.usd * lsk)
      return data.lisk.usd * lsk;
    } else {
      throw new Error("LSK data or USD price not available");
    }
  } catch (err) {
    console.error(err);
    return err;
  }
};

export const getSafuToUsd = (safu: number) => {
  return 0.339 * safu;
};

export const getUsdtToUsd = async (usdt: number) => {
  try {
    const res = await fetch(`${base_uri}/api-cg/tether`);
    const data = await res.json();

    // console.log(data?.tether?.usd);

    if (data?.tether?.usd) {
        // console.log("return val: ", data.tether.usd * usdt)

      return data.tether.usd * usdt;
    } else {
      throw new Error("USDT data or USD price not available");
    }
  } catch (err) {
    console.error(err);
    return err;
  }
};
