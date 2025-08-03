import { inAppWallet, createWallet } from "thirdweb/wallets";
// import { liskMainnet } from "./config";

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
        "x",
        "passkey",
      ],
    },
    // enable gasless transactions for the wallet
    executionMode: {
      mode: "EIP7702",
      sponsorGas: true,
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
];
