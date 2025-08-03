import { createThirdwebClient, defineChain } from "thirdweb";

export const liskSepolia = defineChain({
  id: 4202, // Lisk Sepolia chain ID
  name: "Lisk Sepolia",
  nativeCurrency: {
    name: "LSK",
    symbol: "LSK",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia-api.lisk.com"],
      webSocket: ["wss://ws.sepolia-api.lisk.com"],
    },
    public: {
      http: ["https://rpc.sepolia-api.lisk.com"],
      webSocket: ["wss://ws.sepolia-api.lisk.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Lisk Sepolia Explorer",
      url: "https://sepolia-explorer.lisk.com",
    },
  },
  testnet: true,
});

export const liskMainnet = defineChain({
  id: 1135,
  name: "Lisk Mainnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.api.lisk.com"],
      webSocket: ["wss://ws.api.lisk.com"],
    },
    public: {
      http: ["https://rpc.api.lisk.com"],
      webSocket: ["wss://ws.api.lisk.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Lisk Explorer",
      url: "https://blockscout.lisk.com",
    },
  },
  testnet: false,
});

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  secretKey: import.meta.env.VITE_THIRDWEB_SECRET_KEY,
});
