import {
  AccountAvatar,
  AccountProvider,
  darkTheme,
  useActiveAccount,
  useConnectModal,
  useWalletDetailsModal,
} from "thirdweb/react";
import { client, liskMainnet } from "@/lib/config";
import { Skeleton } from "./ui/skeleton";
import { wallets } from "@/lib/wallets";
import { thirdwebSupportedTokens } from "@/lib/utils";

const WalletAvatar = () => {
  const account = useActiveAccount();
  const address = account?.address;
  const { connect } = useConnectModal();
  const detailsModal = useWalletDetailsModal();

  const handleClick = async () => {
    if (!address) {
      await connect({
        client,
        wallets: wallets,
        chain: liskMainnet,
        theme: darkTheme({
          colors: { accentText: "hsl(144, 100%, 39%)" },
        }),
      });
    } else {  
      detailsModal.open({ client, supportedTokens: thirdwebSupportedTokens });
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{ cursor: "pointer", display: "inline-block" }}
      role="button"
      aria-label="Open wallet modal"
    >
      {address ? (
        <AccountProvider client={client} address={address}>
          <AccountAvatar
            style={{ width: "32px", height: "32px", borderRadius: "50%" }}
            fallbackComponent={
              <img
                src="/assets/wallet.svg"
                alt="Connect Wallet"
                style={{ width: "28px", height: "28px", borderRadius: "50%" }}
              />
            }
            loadingComponent={<Skeleton className="rounded-full w-10 h-10" />}
          />
        </AccountProvider>
      ) : (
        <img
          src="/assets/wallet.svg"
          alt="Connect Wallet"
          style={{ width: "28px", height: "28px", borderRadius: "50%" }}
        />
      )}
    </div>
  );
};

export default WalletAvatar;
