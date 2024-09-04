import AssetVaultTable from "@/components/AssetVaultTable";
import ClaimCard from "@/components/ClaimCard";
import CurrencyBreakdown from "@/components/CurrencyBreakdown";
import SavingsHistoryTable from "@/components/SavingsHistoryTable";
import SavingsPerformance from "@/components/SavingsPerformance";
import VaultCard from "@/components/VaultCard";

const Vault = () => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 pb-2">
        <div className="flex items-center justify-between bg-[#092324] rounded-[12px] p-4 text-[#F1F1F1]">
          <div>
            <img src="/assets/magicpen.svg" alt="safe ai" />
          </div>
          <div>
            <div className="text-sm">Saving just got smarter</div>
            {/* AI analyzes your spending to create a custom savings plan. */}
            <div className="text-xs">Our AI analyzes your spending to create a custom savings plan.</div>
          </div>
          <div>
            <button className="px-4 py-2 text-white bg-[#FFFFFF2B] text-sm text-nowrap rounded-[100px]">
              Get started
            </button>
          </div>
        </div>
        <div className="flex items-center bg-[#092324] justify-between rounded-[12px] p-4 text-[#F1F1F1]">
          <div>
            <img src="/assets/extension.svg" alt="safe ai" />
          </div>
          <div>
            <div className="text-sm">Even more seamless</div>
            <div className="text-xs">Get our extension for more seamless saving while you spend</div>
          </div>
          <div>
            <button className="px-4 py-2 text-white bg-[#FFFFFF2B] text-sm rounded-[100px]">Download</button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pr-4 pb-2">
        <VaultCard title="Vault balance" value={6456.98} unit="USD" text="+18% (compared to your previous savings)" />
        <ClaimCard title="Claimable balance" value={6456.98} unit="USD" text="sum of all your claimable assets" />
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
