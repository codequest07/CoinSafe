import { inAppWallet, createWallet } from "thirdweb/wallets";
import { liskSepolia } from "./config";

// Define the wallets you want to support
export const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        "farcaster",
        "email",
        // "passkey",
        "x",
      ],
    },
    // smartAccount: {
    //   chain: liskSepolia,
    //   sponsorGas: true,
    // },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("org.uniswap"),
  createWallet("com.okex.wallet"),
  createWallet("com.bitget.web3"),
];
