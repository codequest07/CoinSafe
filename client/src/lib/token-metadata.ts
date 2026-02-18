export const tokenDecimals: Record<string, number> = {
    "0xac485391eb2d7d88253a7f1ef18c37f4242d1a24": 18,
    DEFAULT: 6,
};

export const getTokenDecimals = (token: string): number => {
    return tokenDecimals[token.toLowerCase()] || tokenDecimals.DEFAULT;
};

export const tokenData: Record<string, any> = {
    // Lisk Tokens
    "0xac485391eb2d7d88253a7f1ef18c37f4242d1a24": {
        symbol: "LSK",
        chain: "Lisk",
        color: "bg-[#55e]",
        image: "/assets/tokens/lsk.jpg",
    },
    "0xf242275d3a6527d877f2c927a82d9b057609cc71": {
        symbol: "USDC",
        chain: "Lisk",
        color: "bg-[#2775ca]",
        image: "/assets/tokens/usdc.png",
    },
    "0x05d032ac25d322df992303dca074ee7392c117b9": {
        symbol: "USDT",
        chain: "Lisk",
        color: "bg-[#d54f]",
        image: "/assets/tokens/usdt.jpg",
    },
    "0x43f2376d5d03553ae72f4a8093bbe9de4336eb08": {
        symbol: "USDT0",
        chain: "Lisk",
        color: "bg-[#d5f]",
        image: "/assets/tokens/usdt0.png",
    },
    "0xbb88e6126fdcd4ae6b9e3038a2255d66645aea7a": {
        symbol: "SAFU",
        chain: "Lisk",
        color: "bg-[#22c55e]",
        image: "/assets/tokens/safu.png",
    },
    // Base Tokens
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
        symbol: "USDC",
        chain: "Base",
        color: "bg-[#2775ca]",
        image: "/assets/tokens/usdc.png",
    },
};
