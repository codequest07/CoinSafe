import {
  AccountAvatar,
  AccountProvider,
  useActiveAccount,
  useConnectModal,
  useWalletDetailsModal,
} from "thirdweb/react";
import { client } from "@/lib/config"; // Adjust path to your client file
import { Skeleton } from "./ui/skeleton";

const WalletAvatar = () => {
  const account = useActiveAccount();
  const address = account?.address;
  const { connect } = useConnectModal();
  const detailsModal = useWalletDetailsModal();

  const handleClick = async () => {
    if (!address) {
      await connect({ client });
    } else {
      detailsModal.open({ client });
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
                src="/assets/gas.svg"
                alt="Connect Wallet"
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
            }
            loadingComponent={
                <Skeleton className="rounded-full w-10 h-10"/>
            }
          />
        </AccountProvider>
      ) : (
        <img
          src="/assets/gas.svg"
          alt="Connect Wallet"
          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
        />
      )}
    </div>
  );
};

export default WalletAvatar;
