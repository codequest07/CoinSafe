import { useState } from "react";
import { ReactNode } from "react";

import { useActiveAccount } from "thirdweb/react";
import TopUpModal from "../Modals/Top-up-modal";
import UnlockModal from "../Modals/UnlockModal";
import ManageSavingsTarget from "../Modals/ManageSavingsTarget";
import ExtendTargetSafeModal from "../Modals/ExtendTargetSafe";
import { FormattedSafeDetails } from "@/hooks/useGetSafeById";
import ReactivateModal from "../Modals/ReactivateModal";
// import { useExtendSavingsTarget } from "@/hooks/useExtendSavingsTarget";

const SavingsCard = ({
  title,
  icon,
  value,
  unit,
  badge,
  emphasize,
  text,
  safeId = 1, // Default to 1 if not provided
  safeDetails,
}: {
  title: string;
  icon?: any;
  value: number;
  unit: string;
  badge?: string;
  emphasize?: string;
  text?: ReactNode;
  safeId?: number;
  safeDetails?: FormattedSafeDetails | null;
}) => {
  // Only log in development mode to avoid console spam
  if (process.env.NODE_ENV === "development") {
    // console.log(
    //   `SavingsCard value changed: ${value} ${unit} for safeId: ${safeId}`
    // );
  }
  const account = useActiveAccount();
  const isConnected = !!account?.address;

  const [showModal, setShowModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showReactivateWithTopUpModal, setShowReactivateWithTopUpModal] =
    useState(false);
  const [showReactivateWithTokensModal, setShowReactivateWithTokensModal] =
    useState(false);

  const handleTopUp = () => {
    // Close the modal - the refresh will be handled by the TopUpModal component
    setShowModal(true);
    setShowManageModal(false);
  };

  const handleExtendSafe = () => {
    // Close the modal - the refresh will be handled by the TopUpModal component
    setShowExtendModal(true);
    setShowManageModal(false);
  };

  const handleManageTargetSafe = () => {
    // Close the modal - the refresh will be handled by the TopUpModal component
    handleExtendSafe();
    setShowManageModal(false);
  };

  const handleUnlock = () => {
    // Don't close the modal here - let the UnlockModal handle it
    // The refresh will be handled by the UnlockModal component
    console.log("Unlock handled in SavingsCard");
  };
  return (
    <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
      <div className="flex justify-between items-center pb-4">
        <div className="text-[#CACACA] font-light">{title}</div>
        <div>
          {icon ? (
            <div>{icon}</div>
          ) : (
            badge && (
              <div className="text-[#F1F1F1] rounded-[10px] bg-[#79E7BA17] px-2 py-1 text-xs">
                {badge}
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <div>
            <span className="text-[#F1F1F1] pr-2 text-3xl">
              {value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[#CACACA] text-xs">{unit}</span>
          </div>
          <div>
            <div className="pt-2">
              <p className="text-[#7F7F7F] text-xs">
                <span className="text-[#79E7BA] underline">{emphasize} </span>
                {text}
              </p>
            </div>
          </div>
        </div>
        {isConnected && (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                console.log("Opening unlock modal for safeId:", safeId);
                setShowUnlockModal(true);
              }}
              className="rounded-[100px] px-8 py-[8px] bg-[#1E1E1E99] h-[40px] text-sm text-[#F1F1F1]"
            >
              Unlock
            </button>
            {safeDetails &&
            new Date().getTime() > safeDetails?.unlockTime.getTime() ? (
              <button
                onClick={() => {
                  safeDetails.totalAmountUSD <= 0
                    ? setShowReactivateWithTopUpModal(true)
                    : setShowReactivateWithTokensModal(true);
                }}
                className="rounded-[100px] px-8 py-[8px] bg-[#FFFFFFE5] h-[40px] text-sm text-[#010104]"
              >
                Reactivate
              </button>
            ) : (
              <button
                onClick={() => setShowManageModal(true)}
                className="rounded-[100px] px-8 py-[8px] bg-[#FFFFFFE5] h-[40px] text-sm text-[#010104]"
              >
                Manage
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <TopUpModal
          onClose={() => setShowModal(false)}
          onTopUp={() => handleTopUp()}
          safeId={safeId}
        />
      )}
      {showExtendModal && (
        <ExtendTargetSafeModal
          details={safeDetails}
          onClose={() => setShowExtendModal(false)}
        />
      )}
      {showManageModal && (
        <ManageSavingsTarget
          onClose={() => setShowManageModal(false)}
          onTopUpSafe={handleTopUp}
          onExtendSafe={handleManageTargetSafe}
        />
      )}
      {/* Only render the UnlockModal when showUnlockModal is true */}
      {showUnlockModal && (
        <UnlockModal
          onClose={() => {
            console.log("Closing unlock modal");
            setShowUnlockModal(false);
          }}
          onUnlock={() => {
            handleUnlock();
            // Don't close the modal here - the UnlockModal will handle it
          }}
          safeId={safeId.toString()}
        />
      )}

      {/* Only render the UnlockModal when showUnlockModal is true */}
      {showReactivateWithTokensModal && (
        <ReactivateModal
          onClose={() => {
            console.log("Closing reactivate with tokens modal");
            setShowReactivateWithTokensModal(false);
          }}
          isOpen={showReactivateWithTokensModal}
          type="with-tokens"
          safeId={safeId.toString()}
          details={safeDetails}
        />
      )}

      {/* Only render the UnlockModal when showUnlockModal is true */}
      {showReactivateWithTopUpModal && (
        <ReactivateModal
          onClose={() => {
            console.log("Closing reactivate with top up modal");
            setShowReactivateWithTopUpModal(false);
          }}
          isOpen={showReactivateWithTopUpModal}
          type="with-top-up"
          safeId={safeId.toString()}
          details={safeDetails}
        />
      )}
    </div>
  );
};

export default SavingsCard;
