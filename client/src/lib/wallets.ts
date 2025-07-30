import { inAppWallet } from "thirdweb/wallets";
// import { liskSepolia } from "./config";

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
        "wallet"
      ],
    },
    // enable gasless transactions for the wallet
    // executionMode: {
    //   mode: "EIP7702",
    //   sponsorGas: true,
    // },
  }),
];
