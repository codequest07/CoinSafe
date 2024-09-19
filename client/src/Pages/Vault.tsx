import AssetVaultTable from "@/components/AssetVaultTable";
import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import ClaimCard from "@/components/ClaimCard";
import CurrencyBreakdown from "@/components/CurrencyBreakdown";
import SavingsHistoryTable from "@/components/SavingsHistoryTable";
import SavingsPerformance from "@/components/SavingsPerformance";
import VaultCard from "@/components/VaultCard";

const Vault = () => {
  return (
    <div>
      <SmarterSavingCard />

      <div className="flex gap-2 pr-4 pb-2">
        <VaultCard
          title="Vault balance"
          value={6456.98}
          unit="USD"
          text="+18% (compared to your previous savings)"
        />
        <ClaimCard
          title="Claimable balance"
          value={6456.98}
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
