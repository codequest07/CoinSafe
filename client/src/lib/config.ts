// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    // mainnet,
    // polygon,
    // optimism,
    // arbitrum,
    // base,
    // sepolia,
    liskSepolia,
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
    chains: [liskSepolia],
    connectors,
    transports: {
        [liskSepolia.id]: http()
    },
    ssr: false, // If your dApp uses server side rendering (SSR)
});