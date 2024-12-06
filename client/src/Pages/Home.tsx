import AssetTable from "@/components/AssetTable";
import Card from "@/components/Card";
import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import CumulativeCard from "@/components/CumulativeCard";
import GasCoverageCard from "@/components/GasCoverageCard";
import ConnectModal from "@/components/Modals/ConnectModal";
import SavingStreakCard from "@/components/SavingStreakCard";
import ScheduledSavings from "@/components/ScheduledSavingsCard";
import TrackingChart from "@/components/TrackingChart";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const Home = () => {
  const { isConnected, address } = useAccount();
  const [openConnectModal, setOpenConnectModal] = useState(false);

  useEffect(() => {
    if(!isConnected || !address) {
      setOpenConnectModal(true);
    }
  }, [isConnected, address])

  return (
    <main>
      <div className="flex flex-col w-full sm:flex ">
        <>
          <SmarterSavingCard setIsConnectModalOpen={setOpenConnectModal}/>
          {/* sm:space-x-4 */}
          <div className="">
            <TrackingChart />
          </div>
        </>

        {isConnected ? (
          <>
            <div className="sm:flex  gap-3 pt-3">
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
        ) : (
          <>
            <div className="sm:flex  gap-3 pt-3">
              <Card
                title="Rewards"
                value={0}
                unit="points"
                badge="0.0x"
                emphasize="find out"
                text="how points will be used"
              />

              <SavingStreakCard
                title="Savings streak"
                value={0}
                unit="days"
                emphasize="maintain"
                text="streaks for points multipliers"
              />

              <GasCoverageCard
                title="Gas coverage"
                value={0}
                per={0}
                unit="--"
                emphasize="find out"
                text="how points will be used"
              />

              <CumulativeCard
                title="Cumulative APY"
                value={0}
                unit="per annum"
                text="sum of staking and saving returns"
              />
            </div>
          </>
        )}

        {isConnected && (
          <>
            <div className="sm:flex py-3">
              <div className="sm:w-2/3 overflow-hidden">
                <AssetTable />
              </div>
              <div className="sm:w-1/3 p-3">
                <ScheduledSavings />
              </div>
            </div>
          </>
        )}
      </div>

      {openConnectModal && (
        <ConnectModal
          isConnectModalOpen={openConnectModal}
          setIsConnectModalOpen={setOpenConnectModal}
        />
      )}
    </main>
  );
};

export default Home;
