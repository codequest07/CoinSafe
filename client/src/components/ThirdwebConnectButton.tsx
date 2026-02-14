import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { client, liskMainnet, base } from "@/lib/config";
import { wallets } from "@/lib/wallets";
import { thirdwebSupportedTokens } from "@/lib/utils";

export default function ThirdwebConnectButton() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chains={[liskMainnet, base]}
      supportedTokens={thirdwebSupportedTokens}
      theme={darkTheme({
        colors: { accentText: "hsl(144, 100%, 39%)" },
      })}
      connectModal={{ size: "compact" }}
      connectButton={{
        label: "Connect",
        className:
          "px-5 py-1.5 rounded-full text-sm bg-white hover:bg-white/90 transition",
        style: {
          padding: "0.6rem 1.5rem",
          borderRadius: "9999px",
          fontSize: "0.875rem",
          backgroundColor: "white",
          transition: "background-color 0.2s ease-in-out",
          height: "auto",
          width: "auto",
          border: "1px solid #fff",
        },
      }}
    // accountAbstraction={{
    //   // chain: liskMainnet,
    //   // sponsorGas: true,
    // }}
    />
  );
}
