import { useEffect, useState } from "react";
// import {
//   ResponsiveContainer,
//   Tooltip,
//   YAxis,
//   XAxis,
//   AreaChart,
//   Area,
// } from "recharts";
import SavingOption from "./Modals/SavingOption";
import { Button } from "./ui/button";
import Deposit from "./Modals/Deposit";
import coinSafeAbi from "../abi/coinsafe.json";
// import { CoinSafeContract } from "@/lib/contract";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";

import { getLskToUsd, getSafuToUsd, getUsdtToUsd } from "@/lib";

import { CoinSafeContract, tokens } from "@/lib/contract";
import { formatUnits } from "viem";
import { getPercentage, getValidNumberValue } from "@/lib/utils";
// import { injected } from "wagmi/connectors";
// import { liskSepolia } from "viem/chains";
// import { erc20Abi } from "viem";

const TrackingChart = () => {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const [savingsBalance, setSavingsBalance] = useState<number>(0);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  const TotalBalance = useReadContract({
    abi: coinSafeAbi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getUserBalances",
    args: [address],
  });

  const SavingsBalances = useReadContract({
    abi: coinSafeAbi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getUserSavings",
    args: [address],
  });

  const AvailableBalance = useReadContract({
    abi: coinSafeAbi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getAvailableBalances",
    args: [address],
  });

  // console.log("values from reading th contract: ", TotalBalance, SavingsBalances, AvailableBalance);

  useWatchContractEvent({
    abi: coinSafeAbi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    eventName: "DepositSuccessful",
    async onLogs(logs) {
      try {
        console.log("New logs!", logs);

        // Extract relevant details from the logs
        const log: any = logs[0]; // Assuming a single log for simplicity
        const { token, amount } = log.args;

        // console.log(
        //   `Token: ${token}, Amount: ${amount.toString()}, User: ${user}`
        // );

        // Define your token addresses (assumed to be predefined)
        const usdtAddress = tokens.usdt;
        const safuAddress = tokens.safu;
        const lskAddress = tokens.lsk;

        let amountInUsd = 0;

        // Check which token was deposited and convert the amount to USD
        if (token === usdtAddress) {
          amountInUsd = (await getUsdtToUsd(
            Number(formatUnits(amount, 6))
          )) as number; // USDT has 6 decimals
        } else if (token === safuAddress) {
          amountInUsd = getSafuToUsd(Number(formatUnits(amount, 18))); // SAFU has 18 decimals
        } else if (token === lskAddress) {
          amountInUsd = (await getLskToUsd(
            Number(formatUnits(amount, 18))
          )) as number; // LSK has 18 decimals
        } else {
          console.error("Unknown token address:", token);
          return;
        }

        // Update the available and total balances by adding the new deposit amount
        setAvailableBalance((prev) => prev + amountInUsd);
        setTotalBalance((prev) => prev + amountInUsd);

        // alert(`Deposit of ${amountInUsd} USD in token ${token} successful!`);
      } catch (error) {
        console.error("Error processing logs:", error);
      }
    },
  });

  useWatchContractEvent({
    abi: coinSafeAbi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    eventName: "SavedSuccessfully",
    onLogs(logs: any) {
      console.log("New logs!", logs);

      // Extract token and amount saved from the event logs
      const newSave = logs[0]?.args;
      const tokenAddress = newSave?.token;
      const savedAmount = newSave?.amount;

      // alert(
      //   `New Savings Event: Token: ${tokenAddress}, Amount: ${savedAmount}`
      // );

      // Convert saved amount to USD and update balances
      async function updateBalances() {
        let usdValue = 0;

        // Check for the token and convert amount to USD using your conversion function
        if (tokenAddress === tokens.usdt) {
          usdValue = (await getUsdtToUsd(
            Number(formatUnits(savedAmount, 6))
          )) as number; // USDT has 6 decimals
        } else if (tokenAddress === tokens.safu) {
          usdValue = (await getSafuToUsd(
            Number(formatUnits(savedAmount, 18))
          )) as number; // Convert SAFU to USD
        } else if (tokenAddress === tokens.lsk) {
          usdValue = (await getLskToUsd(
            Number(formatUnits(savedAmount, 18))
          )) as number; // Convert LSK to USD
        }

        // Update the savings balance by adding the new saved amount
        setSavingsBalance((prevSavings) => prevSavings + usdValue);

        // Assuming availableBalance is reduced by the saved amount
        setAvailableBalance((prevAvailable) => prevAvailable - usdValue);

        // console.log("Updated Savings Balance:", savingsBalance);
        // console.log("Updated Available Balance:", availableBalance);
      }

      updateBalances();
    },
  });

  useEffect(() => {
    async function run() {
      try {
        // Process Available Balance
        if (AvailableBalance.data && Array.isArray(AvailableBalance.data)) {
          // console.log("Available Balance", AvailableBalance.data);

          let lskVal = 0,
            safuVal = 0,
            usdtVal = 0;

          const tokenAddresses = AvailableBalance.data[0]; // Array of token addresses
          const tokenBalances = AvailableBalance.data[1]; // Array of balances

          for (let i = 0; i < tokenAddresses.length; i++) {
            const address = tokenAddresses[i];
            const balance = tokenBalances[i];

            // Check if the token is USDT, SAFU, or LSK and calculate the value in USD
            if (address === tokens.usdt) {
              usdtVal = (await getUsdtToUsd(
                Number(formatUnits(balance, 6))
              )) as number; // USDT has 6 decimals
            } else if (address === tokens.safu) {
              safuVal = getSafuToUsd(Number(formatUnits(balance, 18))); // SAFU has 18 decimals
            } else if (address === tokens.lsk) {
              lskVal = (await getLskToUsd(
                Number(formatUnits(balance, 18))
              )) as number; // LSK has 18 decimals
            }
          }

          // Calculate total available balance in USD
          const totalAvailableBalanceUSD =
            getValidNumberValue(lskVal) +
            getValidNumberValue(usdtVal) +
            getValidNumberValue(safuVal);
          setAvailableBalance(totalAvailableBalanceUSD);
          // console.log("Available balance in USD:", totalAvailableBalanceUSD);
        }

        // Error handling for Available Balance
        if (AvailableBalance.error) {
          console.error("AvailableBalance Error:", AvailableBalance.error);
        }

        // Process Total Balance
        if (TotalBalance.data && Array.isArray(TotalBalance.data)) {
          // console.log("Total Balance", TotalBalance.data);

          let totalLskVal = 0,
            totalSafuVal = 0,
            totalUsdtVal = 0;

          const totalTokenAddresses = TotalBalance.data[0]; // Array of token addresses
          const totalTokenBalances = TotalBalance.data[1]; // Array of balances

          for (let i = 0; i < totalTokenAddresses.length; i++) {
            const address = totalTokenAddresses[i];
            const balance = totalTokenBalances[i];

            // Check if the token is USDT, SAFU, or LSK and calculate the value in USD
            if (address === tokens.usdt) {
              totalUsdtVal = (await getUsdtToUsd(
                Number(formatUnits(balance, 6))
              )) as number;
            } else if (address === tokens.safu) {
              totalSafuVal = getSafuToUsd(Number(formatUnits(balance, 18)));
            } else if (address === tokens.lsk) {
              totalLskVal = (await getLskToUsd(
                Number(formatUnits(balance, 18))
              )) as number;
            }
          }

          // Calculate total balance in USD
          const totalBalanceUSD =
            getValidNumberValue(totalLskVal) +
            getValidNumberValue(totalUsdtVal) +
            getValidNumberValue(totalSafuVal);
          setTotalBalance(totalBalanceUSD);
        }

        // Error handling for Total Balance
        if (TotalBalance.error) {
          console.error("TotalBalance Error:", TotalBalance.error);
          alert("Could not get total balance for tokens");
        }

        // Process Savings Plan
        if (SavingsBalances.data) {
          // console.log("Savings Plan", SavingsBalances.data);

          const savingsData: any[] = SavingsBalances.data as any[];
          let totalUsdBalance = 0;

          // Loop through each savings plan and calculate the total balance in USD
          for (const plan of savingsData) {
            const token = plan.token;
            const amount = plan.amount;

            let usdValue = 0;

            // Assuming you have conversion functions for each token to USD
            if (token === tokens.usdt) {
              usdValue = (await getUsdtToUsd(
                Number(formatUnits(amount, 6))
              )) as number; // Convert USDT to USD
            } else if (token === tokens.safu) {
              usdValue = getSafuToUsd(
                Number(formatUnits(amount, 18))
              ) as number; // Convert SAFU to USD
            } else if (token === tokens.lsk) {
              usdValue = (await getLskToUsd(
                Number(formatUnits(amount, 18))
              )) as number; // Convert LSK to USD
            }

            // Accumulate the USD value of each token
            totalUsdBalance += usdValue;
          }

          // Update the savingsBalance state with the total balance in USD
          setSavingsBalance(totalUsdBalance);

          // console.log("Total Savings Balance in USD:", totalUsdBalance);
        }
        // Error handling for Savings Plan
        if (SavingsBalances.error) {
          console.error("SavingsBalances Error:", SavingsBalances.error);
          alert("Could not get Savings balance for tokens");
        }
      } catch (error) {
        console.error("Error in fetching balances:", error);
      }
    }
    run();
  }, [AvailableBalance.data, TotalBalance.data, SavingsBalances.data]);

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

        {/* removeed classnames 'border-b-[1px] border-[#FFFFFF17]' for border bottom styles */}
        <div className="sm:flex justify-between pb-6">
          {/* Total wallet balance */}
          <div className="mb-6 sm:mb-0">
            <div className="text-[#CACACA] font-light text-sm pb-4">
              Total wallet balance
            </div>
            <div>
              <span className="text-[#F1F1F1] text-3xl pr-2">
                $
                {isConnected
                  ? totalBalance
                    ? totalBalance?.toFixed(2)
                    : "0.00"
                  : "0.00"}
              </span>
              <span className="text-[#CACACA] font-light text-xs">USD</span>
            </div>
            {/* <div className="text-xs pt-2">
              <span className="text-[#48FF91]">+18%</span>
              <span className="text-[#7F7F7F] ml-1">24h</span>
            </div> */}
          </div>

          {/* Vault balance */}
          <div className="border-x-[1px] border-[#FFFFFF17] px-4 sm:px-[150px] mb-6 sm:mb-0">
            <div className="text-[#CACACA] font-light text-sm pb-4">
              Vault balance
            </div>
            <div>
              <span className="text-[#F1F1F1] text-3xl pr-2">
                ${isConnected ? savingsBalance.toFixed(2) ?? "0.00" : "0.00"}
              </span>
              <span className="text-[#CACACA] font-light text-xs">USD</span>
            </div>

            {isConnected && (
              <div className="flex items-center gap-2 pt-2">
                <div className="bg-[#79E7BA] w-[4px] h-[13px] rounded-[5px]"></div>

                <span className="text-[#7F7F7F] text-xs">
                  {getPercentage(savingsBalance, totalBalance)}% of total wallet
                  balance
                </span>
              </div>
            )}
          </div>

          {/* Available balance */}
          <div>
            <div className="text-[#CACACA] font-light text-sm pb-4">
              Available balance
            </div>
            <div>
              <span className="text-[#F1F1F1] text-3xl pr-2">
                ${isConnected ? availableBalance?.toFixed(2) ?? "0.00" : "0.00"}
              </span>
              <span className="text-[#CACACA] font-light text-xs">USD</span>
            </div>
            {isConnected && (
              <div className="sm:flex items-center gap-2 pt-2">
                <div className="bg-[#79E7BA] w-[4px] h-[13px] rounded-[5px]"></div>
                <span className="text-[#7F7F7F] text-xs">
                  {getPercentage(availableBalance, totalBalance)}% of total
                  wallet balance
                </span>
              </div>
            )}
          </div>
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
