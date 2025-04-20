import { Button } from "./ui/button";
import SavingOption from "./Modals/SavingOption";
import { useState } from "react";
import Deposit from "./Modals/Deposit";
import { getPercentage } from "@/lib/utils";
import Withdraw from "./Modals/Withdraw";
import { useBalances } from "@/hooks/useBalances";
import { useActiveAccount } from "thirdweb/react";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

export default function WalletBalance() {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;

  const openFirstModal = () => setIsFirstModalOpen(true);

  const {
    totalBalance,
    availableBalance,
    loading: { total, available },
  } = useBalances(address as string);

  return (
    <div className="bg-black text-white px-6 flex flex-col">
      {/* Mobile View (Buttons on top, balances below) - Only visible on small screens */}
      <div className="sm:hidden flex flex-col space-y-6 mb-4">
        {/* Action Buttons */}
        {isConnected && (
          <div className="flex flex-row justify-center gap-3">
            <Link to={"/dashboard/withdraw-assets"}>
              <Button className="bg-[#1E1E1E] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-full text-sm flex-1">
                Withdraw
              </Button>
            </Link>
            <Link to={"/dashboard/deposit"}>
              <Button className="bg-[#1E1E1E] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-full text-sm flex-1">
                Deposit
              </Button>
            </Link>
            <Button
              onClick={openFirstModal}
              className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-full text-sm flex-1"
            >
              Save
            </Button>
          </div>
        )}

        {/* Wallet Balance Information */}
        <div className="sm:hidden overflow-x-auto pb-4 no-scrollbar">
          <div className="flex gap-3 px-1">
            {/* Total Wallet Balance */}
            <div className="min-w-[280px] bg-[#111111] rounded-xl p-4">
              <div className="bg-[#121212] rounded-xl p-4 flex flex-col">
                <p className="text-[#CACACA] text-sm">Total wallet balance</p>
                <p className="text-2xl font-bold text-[#F1F1F1] mt-1">
                  $
                  {isConnected ? (
                    total ? (
                      <Skeleton className="w-16 sm:w-20 h-6 sm:h-7" />
                    ) : totalBalance ? (
                      totalBalance?.toFixed(2)
                    ) : (
                      "0.00"
                    )
                  ) : (
                    "0.00"
                  )}{" "}
                  <span className="text-xs font-[300]">USD</span>
                </p>
                <p className="text-[#7F7F7F] text-xs mt-1">
                  sum of all balances
                </p>
              </div>
            </div>

            {/* Available Balance */}
            <div className="min-w-[280px] bg-[#111111] rounded-xl p-4">
              <div className="bg-[#121212] rounded-xl p-4 flex flex-col">
                <p className="text-[#CACACA] text-sm">Available balance</p>
                <p className="text-2xl font-bold text-[#F1F1F1] mt-1">
                  $
                  {isConnected ? (
                    available ? (
                      <Skeleton className="w-16 sm:w-20 h-6 sm:h-7" />
                    ) : (
                      availableBalance?.toFixed(2) ?? "0.00"
                    )
                  ) : (
                    "0.00"
                  )}{" "}
                  <span className="text-xs font-[300]">USD</span>
                </p>
                {isConnected && (
                  <p className="text-[#7F7F7F] text-xs flex items-center mt-1 space-x-1">
                    <div className="bg-[#79E7BA] h-[0.6rem] w-1 rounded-xl"></div>
                    <span>
                      {getPercentage(availableBalance, totalBalance)}%
                    </span>{" "}
                    of total wallet balance
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Desktop Layout - Hidden on mobile, visible on sm and up */}
      <div className="hidden sm:flex flex-grow flex-col sm:flex-row items-end mb-3 justify-between">
        {/* Main content */}
        <main className="flex flex-col sm:flex-row items-center sm:space-x-12 mt-6  space-y-6 sm:space-y-0">
          {/* Total Wallet Balance */}
          <div className="text-center sm:text-left">
            <p className="text-[#CACACA] text-sm">Total wallet balance</p>
            <p className="text-2xl font-bold text-[#F1F1F1]">
              $
              {isConnected
                ? totalBalance
                  ? totalBalance?.toFixed(2)
                  : "0.00"
                : "0.00"}{" "}
              <span className="text-xs font-[300]">USD</span>
            </p>
            <p className="text-[#7F7F7F] text-xs">sum of all balances</p>
          </div>

          {/* Divider */}
          <div className="hidden sm:block border-l border-gray-600 h-20"></div>

          {/* Available Balance */}
          <div className="text-left">
            <p className="text-[#CACACA] text-sm">Available balance</p>
            <p className="text-2xl font-bold text-[#F1F1F1]">
              ${isConnected ? availableBalance?.toFixed(2) ?? "0.00" : "0.00"}{" "}
              <span className="text-xs font-[300]">USD</span>
            </p>
            {isConnected && (
              <p className="text-[#7F7F7F] text-xs flex items-center justify-center sm:justify-start space-x-1">
                <div className="bg-[#79E7BA] h-[0.6rem] w-1 rounded-xl"></div>
                <span>{getPercentage(availableBalance, totalBalance)}%</span> of
                total wallet balance
              </p>
            )}
          </div>
        </main>

        {/* Action Buttons */}
        {isConnected && (
          <div className="flex flex-row space-x-4">
            <Button className="bg-[#1E1E1E99] hover:bg-[#1E1E1E99] text-white px-6 py-2 rounded-full">
              <Link to={"/dashboard/withdraw-assets"}>Withdraw</Link>
            </Button>
            <Button className="bg-[#1E1E1E99] hover:bg-[#1E1E1E99] text-white px-6 py-2 rounded-full">
              <Link to={"/dashboard/deposit"}>Deposit</Link>
            </Button>
            <Button
              onClick={openFirstModal}
              className="bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] text-black px-6 py-2 rounded-full"
            >
              Save
            </Button>
          </div>
        )}
      </div>

      {/* SavingOption Modal */}
      <SavingOption
        isFirstModalOpen={isFirstModalOpen}
        setIsFirstModalOpen={setIsFirstModalOpen}
        isSecondModalOpen={isSecondModalOpen}
        setIsSecondModalOpen={setIsSecondModalOpen}
      />

      {/* deposit Modal */}
      <Deposit
        isDepositModalOpen={isDepositModalOpen}
        setIsDepositModalOpen={setIsDepositModalOpen}
        onBack={() => {}}
      />

      {/* withdraw Modal */}
      <Withdraw
        isWithdrawModalOpen={isWithdrawModalOpen}
        setIsWithdrawModalOpen={setIsWithdrawModalOpen}
        onBack={() => {}}
      />
    </div>
  );
}
