import { Chain } from "thirdweb";
import { liskMainnet, base } from "./config";

export interface ChainConfig {
    chain: Chain;
    diamondAddress: string;
    tokens: {
        usdt?: string;
        usdc: string;
        safu?: string;
        lsk?: string;
        // Add other tokens as needed
        usdt0?: string; // For legacy or specific lisk token if needed
    };
    serverUrl?: string; // If backend URL differs by chain
}

export const chainConfigs: Record<number, ChainConfig> = {
    [liskMainnet.id]: {
        chain: liskMainnet,
        diamondAddress: "0x1f9d3d871f5D279e939B0622eCEb130aB35c8FF2",
        tokens: {
            usdt: "0x05D032ac25d322df992303dCa074EE7392C117b9",
            usdt0: "0x43F2376D5D03553aE72F4A8093bbe9de4336EB08",
            usdc: "0xF242275d3a6527d877f2c927a82D9b057609cc71",
            safu: "0xBb88E6126FdcD4ae6b9e3038a2255D66645AEA7a",
            lsk: "0xac485391EB2d7D88253a7F1eF18C37f4242D1A24",
        },
    },
    [base.id]: {
        chain: base,
        diamondAddress: "0xAE7f97004e88afcBF526f0D9c2233A8F3EF14283",
        tokens: {
            usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Placeholder
            // usdt: "0x0000000000000000000000000000000000000000",
        },
    },
};

export const defaultChainConfig = chainConfigs[liskMainnet.id];

export const getChainConfig = (chainId?: number): ChainConfig => {
    if (!chainId) return defaultChainConfig;
    return chainConfigs[chainId] || defaultChainConfig;
};
