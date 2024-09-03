import AssetTable from "@/components/AssetTable";
import Card from "@/components/Card";
import CumulativeCard from "@/components/CumulativeCard";
import GasCoverageCard from "@/components/GasCoverageCard";
import SavingStreakCard from "@/components/SavingStreakCard";
import ScheduledSavings from "@/components/ScheduledSavingsCard";
import TrackingChart from "@/components/TrackingChart";

const Home = () => {
  return (
    <main>
      <div className="flex flex-col w-full sm:flex ">

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
        {/* sm:space-x-4 */}
        <div className="">
          <TrackingChart />
        </div>

        <div className="flex gap-3 pt-3">
          <Card 
            title="Rewards" 
            value={5800000} 
            unit="points" 
            badge="1.2x"
            emphasize="find out" 
            text="how points will be used" />

          <SavingStreakCard 
            title="Savings streak" 
            value={1000} 
            unit="days" 
            emphasize="maintain" 
            text="streaks for points multipliers" />

          <GasCoverageCard 
            title="Gas coverage" 
            value={0.0005} 
            per={2}
            unit="tier 5-10" 
    
            emphasize="find out" 
            text="how points will be used" />

          <CumulativeCard 
            title="Cumulative APY" 
            value={21} 
            unit="per annum" 
            text="sum of staking and saving returns" />
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
