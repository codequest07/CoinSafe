import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { client } from "@/lib/config";
import { wallets } from "@/lib/wallets";

export default function ThirdwebConnectButton() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      theme={darkTheme({
        colors: { accentText: "hsl(144, 100%, 39%)" },
      })}
      connectModal={{ size: "compact" }}
      // accountAbstraction={{
      //   // chain: liskSepolia, // replace with the chain you want
      //   // sponsorGas: true,
      // }}
    />
  );
}
