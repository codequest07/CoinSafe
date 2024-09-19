import AssetTable from "@/components/AssetTable";
import Card from "@/components/Card";
import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import CumulativeCard from "@/components/CumulativeCard";
import GasCoverageCard from "@/components/GasCoverageCard";
import SavingStreakCard from "@/components/SavingStreakCard";
import ScheduledSavings from "@/components/ScheduledSavingsCard";
import TrackingChart from "@/components/TrackingChart";
import MemoComingSoonIcon from "@/icons/ComingSoonIcon";
import { useAccount } from "wagmi";

const Home = () => {
  const { isConnected } = useAccount();

  return (
    <main>
      <div className="flex flex-col w-full sm:flex ">
        <SmarterSavingCard />
        {/* sm:space-x-4 */}
        <div className="">
          <TrackingChart />
        </div>

        {isConnected && (
          <>
            <div className="flex  gap-3 pt-3">
              <Card
                title="Rewards"
                value={5800000}
                unit="points"
                badge="1.2x"
                emphasize="find out"
                text="how points will be used"
              />

              <SavingStreakCard
                title="Savings streak"
                value={1000}
                unit="days"
                emphasize="maintain"
                text="streaks for points multipliers"
              />

              <GasCoverageCard
                title="Gas coverage"
                value={0.0005}
                per={2}
                unit="tier 5-10"
                emphasize="find out"
                text="how points will be used"
              />

              <CumulativeCard
                title="Cumulative APY"
                value={21}
                unit="per annum"
                text="sum of staking and saving returns"
              />
            </div>
          </>
        )}

        {isConnected ? (
          <>
            <div className="flex py-3">
              <div className="sm:w-2/3 overflow-hidden">
                <AssetTable />
              </div>
              <div className="sm:w-1/3 p-3">
                <ScheduledSavings />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex  flex-col justify-center items-center py-6">
              <div>
                <MemoComingSoonIcon className="w-[600px] h-[250px]" />
              </div>
              <div className="text-[#F1F1F1] text-xl text-center font-medium py-6">
                Connect your wallet to get the best of CoinSafe
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Home;
