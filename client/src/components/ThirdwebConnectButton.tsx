import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
// import { ethereum } from "thirdweb/chains";
import { client, liskSepolia } from "@/lib/config";

const wallets = [
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

export default function ThirdwebConnectButton() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      theme={darkTheme({
        colors: { accentText: "hsl(144, 100%, 39%)" },
      })}
      connectModal={{ size: "compact" }}
      accountAbstraction={{
        chain: liskSepolia, // replace with the chain you want
        sponsorGas: true,
      }}
    />
  );
}
