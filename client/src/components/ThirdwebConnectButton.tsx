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
      connectButton={{
        label: "Connect",
        className: "px-5 py-1.5 rounded-full text-sm bg-white hover:bg-white/90 transition",
        style: {
          padding: '0.6rem 1.5rem', // py-1.5 px-5
          borderRadius: '9999px', // rounded-full
          fontSize: '0.875rem', // text-sm
          backgroundColor: 'white', // bg-white
          transition: 'background-color 0.2s ease-in-out', // transition
          height: 'auto',
          width: 'auto',
          border: '1px solid #fff',
        }
      }}
      // accountAbstraction={{
      //   // chain: liskSepolia, // replace with the chain you want
      //   // sponsorGas: true,
      // }}
    />
  );
}
