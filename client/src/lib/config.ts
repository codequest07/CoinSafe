// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    // mainnet,
    // polygon,
    // optimism,
    // arbitrum,
    // base,
    sepolia,
    // liskSepolia,
  } from 'wagmi/chains';
  import { createConfig, http } from 'wagmi';
  import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  phantomWallet,
  rabbyWallet
} from '@rainbow-me/rainbowkit/wallets';

const connectors = connectorsForWallets(
  [{
    groupName: 'Recommended',
    wallets: [metaMaskWallet, phantomWallet, rabbyWallet]
  }],
  { appName: 'RainbowKit App', projectId: 'YOUR_PROJECT_ID' },
);
  
  export const config = createConfig({
    chains: [sepolia],
    connectors,
    transports: {
        [sepolia.id]: http()
    },
    ssr: false, // If your dApp uses server side rendering (SSR)
});

// src/client.ts
import { createThirdwebClient, defineChain } from "thirdweb";

// liskSepolia is already imported from wagmi/chains
// export const liskSepolia = defineChain({
//   id: 4202,  // Lisk Sepolia chain ID
//   name: "Lisk Sepolia",
//   rpcUrls: {
//     default: { http: ["https://rpc.sepolia-api.lisk.com"] },
//   },
//   nativeCurrency: {
//     name: "LSK",
//     symbol: "LSK",
//     decimals: 18,
//   },
// });

export const liskSepolia = defineChain({
  id: 4202,  // Lisk Sepolia chain ID
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
  testnet: true
});
 
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  secretKey: import.meta.env.VITE_THIRDWEB_SECRET_KEY,
});
