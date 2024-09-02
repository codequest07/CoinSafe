import AssetTable from "@/components/AssetTable";
import ScheduledSavings from "@/components/ScheduledSavingsCard";

const Home = () => {
  return (
    <main>
      <div className="sm:flex space-x-4">
        <div className="w-2/3">
          <AssetTable />
        </div>
        <div className="w-1/3">
          <ScheduledSavings />
        </div>
      </div>
    </main>
  );
};

export default Home;
