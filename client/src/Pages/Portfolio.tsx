import AssetTable from "@/components/AssetTable";
import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
// import CurrencyBreakdown from "@/components/CurrencyBreakdown";
import TransactionHistory from "@/components/TransactionHistory";
import WalletBalance from "@/components/WalletBalance";

const Portfolio = () => {
  return (
    <div className="pr-4">
      <SmarterSavingCard />
      <div className="rounded-[0.8rem] border border-[#FFFFFF17] mb-5">
        <WalletBalance />
        {/* <CurrencyBreakdown /> */}
      </div>
      <div className="flex flex-col gap-5">
        <AssetTable />
        <TransactionHistory />
      </div>
    </div>
  );
};

export default Portfolio;
