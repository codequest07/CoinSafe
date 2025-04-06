import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ThirdwebConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!ready) {
          return null;
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              type="button"
              className="text-[#131313B2] bg-white py-2 px-5 rounded-full text-sm"
            >
              Connect Wallet
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button onClick={openChainModal} type="button">
              Wrong network
            </button>
          );
        }

        return (
          <button
            onClick={openAccountModal}
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#131313B2",
              border: "none",
              cursor: "pointer",
            }}
            className="bg-[#131313B2] space-x-2 text-white py-2 px-5 rounded-[2rem]"
          >
            <p>
              {" "}
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </p>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
