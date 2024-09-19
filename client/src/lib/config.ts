import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    // mainnet,
    // polygon,
    // optimism,
    // arbitrum,
    // base,
    // sepolia,
    liskSepolia,
  } from 'wagmi/chains';
  import { http } from 'wagmi';
  
  export const config = getDefaultConfig({
    appName: 'CoinSafe',
    projectId: 'YOUR_PROJECT_ID',
    chains: [liskSepolia],
    transports: {
        [liskSepolia.id]: http()
    },
    ssr: false, // If your dApp uses server side rendering (SSR)
});