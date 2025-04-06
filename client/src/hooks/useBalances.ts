import { useRecoilState } from "recoil";
import {
  availableBalanceState,
  savingsBalanceState,
  totalBalanceState,
} from "../store/atoms/save";
import { CoinsafeDiamondContract } from "@/lib/contract";
import { useEffect, useState } from "react";
import { getValidNumberValue } from "@/lib/utils";
import { convertTokenAmountToUsd } from "@/lib/utils";
import { getContract } from "thirdweb";
import { liskSepolia } from "@/lib/config";
import { client } from "@/lib/config";
import { useReadContract } from "thirdweb/react";

export const useBalances = (address: string) => {
  const [availableBalance, setAvailableBalance] = useRecoilState(
    availableBalanceState
  );
  const [savingsBalance, setSavingsBalance] =
    useRecoilState(savingsBalanceState);
  const [totalBalance, setTotalBalance] = useRecoilState(totalBalanceState);

  const contract = getContract({
    client,
    address: CoinsafeDiamondContract.address,
    chain: liskSepolia,
  });

  const { data: TotalBalance, isLoading: userBalanceLoading } = useReadContract(
    {
      contract,
      method:
        "function getUserBalances(address _user) external view returns (address[] memory, uint256[] memory)",
      params: [address],
    }
  );

  // Loading states
  const [, setIsLoading] = useState({
    available: false,
    total: false,
    savings: false,
  });

  const { data: SavingsBalances, isLoading: savingsBalanceLoading } =
    useReadContract({
      contract,
      method:
        "function getUserSavings(address _user) external view returns (LibDiamond.Safe[] memory)",
      params: [address],
    });

  const { data: AvailableBalance, isLoading: availableBalanceLoading } =
    useReadContract({
      contract,
      method:
        "function getAvailableBalances(address _user) external view returns (address[] memory, uint256[] memory)",
      params: [address],
    });

  // Process available balances
  const processAvailableBalances = async (data: any[]) => {
    setIsLoading((prev) => ({ ...prev, available: true }));
    try {
      const tokenAddresses = data[0];
      const tokenBalances = data[1];
      let totalUsdValue = 0;

      for (let i = 0; i < tokenAddresses.length; i++) {
        const usdValue = await convertTokenAmountToUsd(
          tokenAddresses[i],
          tokenBalances[i]
        );
        totalUsdValue += getValidNumberValue(usdValue);
      }

      setAvailableBalance(totalUsdValue);
    } catch (error) {
      console.error("Error processing available balances:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, available: false }));
    }
  };

  // Process total balances
  const processTotalBalances = async (data: any[]) => {
    setIsLoading((prev) => ({ ...prev, total: true }));
    try {
      const tokenAddresses = data[0];
      const tokenBalances = data[1];
      let totalUsdValue = 0;

      for (let i = 0; i < tokenAddresses.length; i++) {
        const usdValue = await convertTokenAmountToUsd(
          tokenAddresses[i],
          tokenBalances[i]
        );
        totalUsdValue += getValidNumberValue(usdValue);
      }

      setTotalBalance(totalUsdValue);
    } catch (error) {
      console.error("Error processing total balances:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, total: false }));
    }
  };

  // Process savings balances
  const processSavingsBalances = async (savingsData: any[]) => {
    setIsLoading((prev) => ({ ...prev, savings: true }));
    try {
      let totalUsdValue = 0;

      for (const plan of savingsData) {
        const usdValue = await convertTokenAmountToUsd(plan.token, plan.amount);
        totalUsdValue += getValidNumberValue(usdValue);
      }

      setSavingsBalance(totalUsdValue);
    } catch (error) {
      console.error("Error processing savings balances:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, savings: false }));
    }
  };

  useEffect(() => {
    async function processBalances() {
      if (AvailableBalance && Array.isArray(AvailableBalance)) {
        await processAvailableBalances(AvailableBalance);
      }

      if (TotalBalance && Array.isArray(TotalBalance)) {
        await processTotalBalances(TotalBalance);
      }

      if (SavingsBalances) {
        await processSavingsBalances(SavingsBalances as any[]);
      }
    }

    processBalances();
  }, [AvailableBalance, TotalBalance, SavingsBalances]);

  // [AvailableBalance.data, TotalBalance.data, SavingsBalances.data]

  // const isAnyLoading =
  //   isLoading.available || isLoading.total || isLoading.savings;
  // const isContractLoading =
  //   AvailableBalance.isLoading ||
  //   TotalBalance.isLoading ||
  //   SavingsBalances.isLoading;

  return {
    availableBalance,
    availableBalanceLoading,
    savingsBalance,
    totalBalance,
    AvailableBalance,
    TotalBalance,
    userBalanceLoading,
    SavingsBalances,
    savingsBalanceLoading,
    // isLoading: {
    //   ...isLoading,
    //   any: isAnyLoading,
    //   contract: isContractLoading,
    // },
  };
};
