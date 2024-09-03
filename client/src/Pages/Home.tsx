import AssetTable from "@/components/AssetTable";
import ScheduledSavings from "@/components/ScheduledSavingsCard";

const Home = () => {
  return (
    <main>
      <div className="sm:flex sm:space-x-4">
        <div className="sm:w-2/3">
          <AssetTable />
        </div>
        <div className="sm:w-1/3 p-3">
          <ScheduledSavings />
        </div>
      </div>
    </main>
  );
};

export default Home;
