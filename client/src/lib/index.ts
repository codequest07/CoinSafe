export const getLskToUsd = async (lsk: number) => {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=lisk&vs_currencies=usd')
        const data = await res.json();
        
        console.log(data.lisk.usd);

        return data.lisk.usd * lsk;
    } catch (err) {
        console.error(err);
        return err;
    }
}

export const getSafuToUsd = (safu: number) => { 
    return 2 * safu;
}

export const getUsdtToUsd = async (usdc: number) => {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd')
        const data = await res.json();
        
        console.log(data.tether.usd);

        return data.tether.usd * usdc;
    } catch (err) {
        console.error(err);
        return err;
    }
}