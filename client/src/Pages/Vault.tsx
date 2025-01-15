import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import ClaimCard from "@/components/ClaimCard";
import VaultCard from "@/components/VaultCard";
import { useAccount } from "wagmi";
import AssetTable from "@/components/AssetTable";
import { useBalances } from "@/hooks/useBalances";

const Vault = () => {
  const { isConnected, address } = useAccount();
  const { savingsBalance }  = useBalances(address as string);

  return (
    <div>
      <SmarterSavingCard />

      <div className="flex gap-2 pr-4 pb-2">
        <VaultCard
          title="Vault balance"
          value={isConnected ? Number(savingsBalance.toFixed(2)) ?? 0.00 : 0.00}
          unit="USD"
          text=""
          // text="+18% (compared to your previous savings)"
        />
        <ClaimCard
          title="Claimable balance"
          value={0.00}
          unit="USD"
          text="sum of all your claimable assets"
        />
      </div>

      {/* <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-4">
        <CurrencyBreakdown />
      </div> */}

      {/* <div className="py-2 pr-2">
        <SavingsPerformance />
      </div> */}

      <div className="py-2">
        {/* <AssetVaultTable /> */}
        <AssetTable />
      </div>

      <div>
        {/* {isConnected && <SavingsHistoryTable />} */}
      </div>
    </div>
  );
};

export default Vault;
