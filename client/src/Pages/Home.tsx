import AssetTable from "@/components/AssetTable";
import ScheduledSavings from "@/components/ScheduledSavingsCard";
import TrackingChart from "@/components/TrackingChart";

const Home = () => {
  return (
    <main>
      <div className="flex flex-col w-full sm:flex sm:space-x-4">
        <div className="">
          <TrackingChart />
        </div>

        <div className="flex py-3">
          <div className="sm:w-2/3">
            <AssetTable />
          </div>
          <div className="sm:w-1/3 p-3">
            <ScheduledSavings />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
