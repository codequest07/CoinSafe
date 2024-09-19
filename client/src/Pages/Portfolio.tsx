import AssetTable from "@/components/AssetTable";
import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import CurrencyBreakdown from "@/components/CurrencyBreakdown";
import TransactionHistory from "@/components/TransactionHistory";
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
      <TransactionHistory />
    </div>
  );
};

export default Portfolio;
