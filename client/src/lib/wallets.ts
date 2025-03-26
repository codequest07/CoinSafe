import { inAppWallet, createWallet } from "thirdweb/wallets";

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
        "phone",
      ],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("com.binance"),
  createWallet("org.uniswap"),
  createWallet("com.okex.wallet"),
  createWallet("com.bitget.web3"),
];
