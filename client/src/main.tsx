import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from 'recoil';

import '@rainbow-me/rainbowkit/styles.css';
import {
  darkTheme,
  // getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
// import {
//   mainnet,
//   polygon,
//   optimism,
//   arbitrum,
//   base,
//   sepolia,
//   liskSepolia,
//   lisk
// } from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { config } from "./lib/config.ts";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme({
            accentColor: "#FFFFFFE5",
            accentColorForeground: "#010104",
            fontStack: "system",
            borderRadius: "large"
          })}>
            <RecoilRoot>
              <App />
            </RecoilRoot>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
      </BrowserRouter>
  </StrictMode>
);
