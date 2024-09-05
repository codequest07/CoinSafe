import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
    liskSepolia,
    lisk
  } from 'wagmi/chains';
  import { http } from 'wagmi';
  
  export const config = getDefaultConfig({
    appName: 'CoinSafe',
    projectId: 'YOUR_PROJECT_ID',
    chains: [mainnet, polygon, optimism, arbitrum, base, lisk, liskSepolia, sepolia],
    transports: {
        [liskSepolia.id]: http()
    },
    ssr: false, // If your dApp uses server side rendering (SSR)
});