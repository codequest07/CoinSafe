import { useState } from "react";
import SavingOption from "./Modals/SavingOption";
import { Button } from "./ui/button";
import Deposit from "./Modals/Deposit";
import { useAccount } from "wagmi";
import { getPercentage } from "@/lib/utils";
import { useBalances } from "@/hooks/useBalances";
import { Skeleton } from "./ui/skeleton";

const TrackingChart = () => {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const { isLoading, totalBalance, savingsBalance, availableBalance } =
    useBalances(address as string);

  const openFirstModal = () => setIsFirstModalOpen(true);
  const openDepositModal = () => setIsDepositModalOpen(true);

  // const data = [
  //   {
  //     date: "10/12/2024",
  //     uv: 0,
  //     pv: 2400,
  //     amt: 2400,
  //   },
  //   {
  //     date: "10/12/2024",
  //     uv: 3000,
  //     pv: 1398,
  //     amt: 2210,
  //   },
  //   {
  //     date: "10/12/2024",
  //     uv: 2000,
  //     pv: 9800,
  //     amt: 2290,
  //   },
  //   {
  //     date: "10/12/2024",
  //     uv: 2780,
  //     pv: 3908,
  //     amt: 2000,
  //   },
  //   {
  //     date: "10/12/2024",
  //     uv: 1890,
  //     pv: 4800,
  //     amt: 2181,
  //   },
  //   {
  //     date: "10/12/2024",
  //     uv: 2390,
  //     pv: 3800,
  //     amt: 2500,
  //   },
  //   {
  //     date: "10/12/2024",
  //     uv: 3490,
  //     pv: 4300,
  //     amt: 2100,
  //   },
  // ];

  return (
    <div className="w-full border-[1px] border-[#FFFFFF17] p-6 rounded-[12px]">
      <div className="w-full">
        <div className="flex justify-end items-center pb-10 text-white">
          {/* <div className="rounded-[100px] px-3 py-[6px] bg-[#1E1E1E99]">
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm flex items-center outline-none">
                <div>All Networks</div>
                <div>
                  <MdArrowDropDown />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
          {isConnected && (
            <div className="flex items-center gap-2">
              <Button
                onClick={openDepositModal}
                className="rounded-[100px] px-8 py-2  bg-[#1E1E1E99] text-sm cursor-pointer"
              >
                Deposit
              </Button>
              <Button
                onClick={openFirstModal}
                className="rounded-[100px] px-8 py-2  bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] text-[#010104] text-sm"
              >
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="sm:flex justify-evenly pb-6">
          {/* Total wallet balance */}
          <BalanceCard
            title="Total wallet balance"
            isConnected={isConnected}
            isLoading={isLoading.total}
            balance={totalBalance}
          />

          {/* Vault balance */}
          <BalanceCard
            title="Vault balance"
            isConnected={isConnected}
            isLoading={isLoading.savings}
            balance={savingsBalance}
            percentage={getPercentage(savingsBalance, totalBalance)}
            className="border-x-[1px] border-[#FFFFFF17] px-4 sm:px-[150px] mb-6 sm:mb-0"
          />

          {/* Available balance */}
          <BalanceCard
            title="Available balance"
            isConnected={isConnected}
            isLoading={isLoading.available}
            balance={availableBalance}
            percentage={getPercentage(availableBalance, totalBalance)}
          />
        </div>
      </div>

      {/* <div className="w-full h-[160px]">
        {isConnected && (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="100%" stopColor="#114124" stopOpacity={1} />
                    <stop offset="100%" stopColor="#030B06" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={false}
                  axisLine={{ stroke: "#000000" }}
                  padding={{ left: -70, right: -20 }}
                />
                <YAxis
                  tick={false}
                  padding={{ top: 0, bottom: -40 }}
                  axisLine={{ stroke: "#000000" }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke="#00C750"
                  fill="url(#colorUv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div> */}

      {/* SavingOption Modal */}
      <SavingOption
        isFirstModalOpen={isFirstModalOpen}
        setIsFirstModalOpen={setIsFirstModalOpen}
        isSecondModalOpen={isSecondModalOpen}
        setIsSecondModalOpen={setIsSecondModalOpen}
      />
      <Deposit
        isDepositModalOpen={isDepositModalOpen}
        setIsDepositModalOpen={setIsDepositModalOpen}
        onBack={() => {}}
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
}: {
  title: string;
  isConnected: boolean;
  isLoading: boolean;
  balance: number;
  percentage?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[#CACACA] font-light text-sm pb-4">{title}</div>
      <div>
        <span className="text-[#F1F1F1] text-3xl pr-2 flex items-center gap-1">
          $
          {isConnected ? (
            isLoading ? (
              <Skeleton className="w-20 h-7" />
            ) : balance ? (
              balance.toFixed(2)
            ) : (
              "0.00"
            )
          ) : (
            "0.00"
          )}
        </span>
        <span className="text-[#CACACA] font-light text-xs">USD</span>
      </div>
      {isConnected && percentage !== undefined && (
        <div className="flex items-center gap-2 pt-2">
          <div className="bg-[#79E7BA] w-[4px] h-[13px] rounded-[5px]"></div>
          {isLoading ? (
            <Skeleton className="w-32 h-3" />
          ) : (
            <span className="text-[#7F7F7F] text-xs">
              {percentage ?? 0}% of total wallet balance
            </span>
          )}
        </div>
      )}
    </div>
  );
}
