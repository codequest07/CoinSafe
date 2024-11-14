// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
import { Button } from "./ui/button";
import SavingOption from "./Modals/SavingOption";
import { useEffect, useState } from "react";
import Deposit from "./Modals/Deposit";
// import { getBalance } from "viem/actions";
// import { useAccount, useWriteContract } from 'wagmi';
// import coinSafeAbi from '../abi/coinsafe.json';
// import { createPublicClient } from "viem";
// import { CoinSafeContract } from "@/lib/contract";
import coinSafeAbi from "../abi/coinsafe.json";
// import { CoinSafeContract } from "@/lib/contract";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";

import { getLskToUsd, getSafuToUsd, getUsdtToUsd } from "@/lib";

import { CoinSafeContract, tokens } from "@/lib/contract";
import { formatUnits } from "viem";
import { getValidNumberValue } from "@/lib/utils";

export default function WalletBalance() {
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { isConnected, address } = useAccount();

  const openDepositModal = () => setIsDepositModalOpen(true);

  const openFirstModal = () => setIsFirstModalOpen(true);

  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  const TotalBalance = useReadContract({
    abi: coinSafeAbi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getUserBalances",
    args: [address],
  });

  const AvailableBalance = useReadContract({
    abi: coinSafeAbi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getAvailableBalances",
    args: [address],
  });

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
      } catch (error) {
        console.error("Error in fetching balances:", error);
      }
    }
    run();
  }, [AvailableBalance.data, TotalBalance.data]);

  return (
    <div className="bg-black text-white p-6 flex flex-col ">
      <div className="">
        {/* Network Selector */}
        {/* 
        <Select>
          <SelectTrigger className="w-[140px] bg-gray-700 border-0 bg-[#1E1E1E99] text-white rounded-[2rem]">
            <div className="flex items-center">
              <SelectValue placeholder="All networks" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ripple">
              <div className="flex items-center space-x-2">
                <p>Ripple</p>
              </div>
            </SelectItem>
            <SelectItem value="bitcoin">Bitcoin</SelectItem>
            <SelectItem value="ethereum">Ethereum</SelectItem>
          </SelectContent>
        </Select> */}
      </div>

      {/* Wallet Balance Information */}
      <div className="flex-grow flex flex-col sm:flex-row items-center justify-between">
        {/* Main content */}
        <main className="flex flex-col sm:flex-row items-center sm:space-x-12 my-6 space-y-6 sm:space-y-0">
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
            <p className="text-[#7F7F7F] text-xs flex items-center justify-center sm:justify-start space-x-1">
              <div className="bg-[#79E7BA] h-[0.6rem] w-1 rounded-xl"></div>
              <span>15%</span> of total wallet balance
            </p>
          </div>
        </main>

        {/* Action Buttons */}
        <div className="flex flex-row  space-x-4">
          <Button className="bg-[#1E1E1E99] hover:bg-[#1E1E1E99] text-white px-6 py-2 rounded-full" onClick={() => {}}>
            Withdraw {/*s*/}
          </Button>
          <Button
            onClick={openDepositModal}
            className="bg-[#1E1E1E99] hover:bg-[#1E1E1E99] text-white px-6 py-2 rounded-full"
          >
            Deposit
          </Button>
          <Button
            onClick={openFirstModal}
            className="bg-[#FFFFFFE5] hover:bg-[#FFFFFFE5] text-black px-6 py-2 rounded-full"
          >
            Save
          </Button>
        </div>
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
    </div>
  );
}
