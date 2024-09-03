import AssetTable from "@/components/AssetTable";
import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import CurrencyBreakdown from "@/components/CurrencyBreakdown";
import WalletBalance from "@/components/WalletBalance";

const Portfolio = () => {
  return (
    <div>
      <SmarterSavingCard />
      <div className="rounded-[0.8rem] border border-[#FFFFFF17] mb-5">
        <WalletBalance />
        <CurrencyBreakdown />
      </div>
      <AssetTable />
    </div>
  );
};

export default Portfolio;
