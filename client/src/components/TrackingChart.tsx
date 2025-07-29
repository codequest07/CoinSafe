"use client";

import { useMemo, useState } from "react";
import SavingOption from "./Modals/SavingOption";
import { Button } from "./ui/button";
import { getPercentage } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";
import { useActiveAccount } from "thirdweb/react";
import { Link } from "react-router-dom";
import {
  availableBalanceState,
  loadingState,
  savingsBalanceState,
  totalBalanceState,
} from "@/store/atoms/balance";
import { useRecoilState } from "recoil";

const TrackingChart = () => {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const account = useActiveAccount();
  const isConnected = !!account?.address;

  const [loading] = useRecoilState(loadingState);
  const [totalBalance] = useRecoilState(totalBalanceState);
  const [savingsBalance] = useRecoilState(savingsBalanceState);
  const [availableBalance] = useRecoilState(availableBalanceState);

  const userBalanceLoading = useMemo(() => loading.total, [loading]);
  const savingsBalanceLoading = useMemo(() => loading.savings, [loading]);
  const availableBalanceLoading = useMemo(() => loading.available, [loading]);

  const openFirstModal = () => setIsFirstModalOpen(true);

  return (
    <div className="w-full border-[1px] border-[#FFFFFF17] p-2 sm:p-4 rounded-[12px] bg-[#0A0A0A]">
      <div className="w-full">
        {/* Action Buttons */}
        <div className="flex justify-center sm:justify-end items-center pb-3 text-white gap-2 sm:gap-3">
          {isConnected && (
            <div className="flex items-center gap-2 my-2 sm:my-4 w-full sm:w-auto">
              <Link to={"/dashboard/withdraw-assets"}>
                <Button className="flex-1 sm:flex-none bg-[#1E1E1E99] hover:bg-[#1E1E1E99] text-white px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base">
                  Withdraw
                </Button>
              </Link>
              <Link to={"/dashboard/deposit"}>
                <Button className="flex-1 sm:flex-none rounded-[100px] px-4 sm:px-8 py-2 bg-[#1E1E1E99] hover:bg-[#1E1E1E99] text-sm sm:text-base cursor-pointer">
                  Deposit
                </Button>
              </Link>
              <Button
                onClick={openFirstModal}
                className="flex-1 sm:flex-none rounded-[100px] px-4 sm:px-8 py-2 bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] text-[#010104] text-sm sm:text-base">
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Balance Cards - Horizontal scroll on mobile, flex row on desktop */}
        <div className="sm:hidden overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-3 min-w-max px-1">
            {/* Total wallet balance */}
            <div className="w-[280px] flex-shrink-0 bg-[#111111] rounded-xl p-4">
              <BalanceCard
                title="Total wallet balance"
                isConnected={isConnected}
                isLoading={userBalanceLoading}
                balance={totalBalance}
                text="sum of all balances"
              />
            </div>

            {/* Vault balance */}
            <div className="w-[280px] flex-shrink-0 bg-[#111111] rounded-xl p-4">
              <BalanceCard
                title="Vault balance"
                isConnected={isConnected}
                isLoading={savingsBalanceLoading}
                balance={savingsBalance}
                percentage={getPercentage(savingsBalance, totalBalance)}
              />
            </div>

            {/* Available balance */}
            <div className="w-[280px] flex-shrink-0 bg-[#111111] rounded-xl p-4">
              <BalanceCard
                title="Available balance"
                isConnected={isConnected}
                isLoading={availableBalanceLoading}
                balance={availableBalance}
                percentage={getPercentage(availableBalance, totalBalance)}
              />
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex flex-row justify-start items-stretch gap-6 pb-2">
          {/* Total wallet balance */}
          <div className="w-[28%] px-2 min-w-0">
            <BalanceCard
              title="Total wallet balance"
              isConnected={isConnected}
              isLoading={userBalanceLoading}
              balance={totalBalance}
              text="sum of all balances"
            />
          </div>

          {/* Vault balance */}
          <div className="flex-1 min-w-0">
            <BalanceCard
              title="Vault balance"
              isConnected={isConnected}
              isLoading={savingsBalanceLoading}
              balance={savingsBalance}
              percentage={getPercentage(savingsBalance, totalBalance)}
              className="h-full border-x-[1px] border-[#FFFFFF17] px-4"
              alignCenter
            />
          </div>

          {/* Available balance */}
          <div className="w-[28%] min-w-0">
            <BalanceCard
              title="Available balance"
              isConnected={isConnected}
              isLoading={availableBalanceLoading}
              balance={availableBalance}
              percentage={getPercentage(availableBalance, totalBalance)}
              alignRight
            />
          </div>
        </div>
      </div>

      <SavingOption
        isFirstModalOpen={isFirstModalOpen}
        setIsFirstModalOpen={setIsFirstModalOpen}
        isSecondModalOpen={isSecondModalOpen}
        setIsSecondModalOpen={setIsSecondModalOpen}
      />
    </div>
  );
};

export default TrackingChart;

function BalanceCard({
  title,
  isConnected,
  isLoading,
  balance,
  percentage,
  className = "",
  text,
  alignCenter,
  alignRight,
}: {
  title: string;
  isConnected: boolean;
  isLoading: boolean;
  balance: number;
  percentage?: number;
  className?: string;
  text?: string;
  alignRight?: boolean;
  alignCenter?: boolean;
}) {
  return (
    <div
      className={`${className} flex flex-col justify-center ${
        alignRight
          ? "items-end pr-12"
          : alignCenter
          ? "items-center"
          : "items-start"
      }`}>
      <div>
        <div className="text-[#CACACA] font-light text-sm pb-2">{title}</div>
        <div className="flex items-center">
          <span className="text-[#F1F1F1] text-2xl sm:text-3xl pr-2 flex items-center gap-1">
            $
            {isConnected ? (
              isLoading ? (
                <Skeleton className="w-16 sm:w-20 h-6 sm:h-7" />
              ) : balance ? (
                balance.toFixed(2)
              ) : (
                "0.00"
              )
            ) : (
              "0.00"
            )}
          </span>
          <span className="text-[#CACACA] font-light text-xs mt-3 sm:mt-4">
            USD
          </span>
        </div>
        {text && (
          <div className="text-[#7F7F7F] font-light text-xs pt-1 sm:pt-2">
            {text}
          </div>
        )}
        {isConnected && percentage !== undefined && (
          <div className="flex items-center gap-2 pt-1 sm:pt-2">
            <div className="bg-[#79E7BA] w-[4px] h-[13px] rounded-[5px]"></div>
            {isLoading ? (
              <Skeleton className="w-28 sm:w-32 h-3" />
            ) : (
              <div>
                <span className="text-[#7F7F7F] text-xs">
                  {percentage ?? 0}% of total wallet balance
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
