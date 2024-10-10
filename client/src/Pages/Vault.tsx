import AssetVaultTable from "@/components/AssetVaultTable";
import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import ClaimCard from "@/components/ClaimCard";
import CurrencyBreakdown from "@/components/CurrencyBreakdown";
import SavingsHistoryTable from "@/components/SavingsHistoryTable";
import SavingsPerformance from "@/components/SavingsPerformance";
import VaultCard from "@/components/VaultCard";
import { useEffect, useState } from "react";
import coinSafeAbi from "../abi/coinsafe.json";
// import { CoinSafeContract } from "@/lib/contract";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";

import { getLskToUsd, getSafuToUsd, getUsdtToUsd } from "@/lib";

import { CoinSafeContract, tokens } from "@/lib/contract";
import { formatUnits } from "viem";

const Vault = () => {

  const { isConnected, address } = useAccount();
  const [savingsBalance, setSavingsBalance] = useState<number>(0);

  const SavingsBalances = useReadContract({
    abi: coinSafeAbi.abi,
    address: CoinSafeContract.address as `0x${string}`,
    functionName: "getUserSavings",
    args: [address],
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

        // console.log("Updated Savings Balance:", savingsBalance);
        // console.log("Updated Available Balance:", availableBalance);
      }

      updateBalances();
    },
  });

  useEffect(() => {
    async function run() {
      try {
        // Process Savings Plan
        if (SavingsBalances.data) {
          console.log("Savings Plan", SavingsBalances.data);

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

          console.log("Total Savings Balance in USD:", totalUsdBalance);
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
  }, [SavingsBalances.data]);

  return (
    <div>
      <SmarterSavingCard />

      <div className="flex gap-2 pr-4 pb-2">
        <VaultCard
          title="Vault balance"
          value={isConnected ? Number(savingsBalance.toFixed(2)) ?? 0.00 : 0.00}
          unit="USD"
          text="+18% (compared to your previous savings)"
        />
        <ClaimCard
          title="Claimable balance"
          value={0.00}
          unit="USD"
          text="sum of all your claimable assets"
        />
      </div>

      <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-4">
        <CurrencyBreakdown />
      </div>

      <div className="py-2 pr-2">
        <SavingsPerformance />
      </div>

      <div className="py-2">
        <AssetVaultTable />
      </div>

      <div>
        <SavingsHistoryTable />
      </div>
    </div>
  );
};

export default Vault;
