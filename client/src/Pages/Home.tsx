import AssetTable from "@/components/AssetTable";
import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import ConnectModal from "@/components/Modals/ConnectModal";
import ScheduledSavings from "@/components/ScheduledSavingsCard";
import StatsCards from "@/components/stats-cards";
import { TourGuide } from "@/components/TourGuide";
import TrackingChart from "@/components/TrackingChart";
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";

const Home = () => {
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;
  const [openConnectModal, setOpenConnectModal] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setOpenConnectModal(true);
    }
  }, [isConnected, address]);

  const tourSteps = [
    {
      target: ".step-1",
      content:
        "Welcome to our app! This card provides information about smarter saving.",
      disableBeacon: true,
    },
    {
      target: ".step-2",
      content: "Here you can view balance to monitor your progress.",
    },
    {
      target: ".step-3",
      content: "This table shows your asset information.",
    },
    {
      target: ".step-4",
      content: "Set up and view your scheduled savings here.",
    },
  ];

  return (
    <main>
      <div className="flex flex-col w-full sm:flex ">
        <>
          <div className="step-1">
            <SmarterSavingCard setIsConnectModalOpen={setOpenConnectModal} />
          </div>
          <div className="step-2">
            <TrackingChart />
          </div>
        </>

        {isConnected && (
          <>
            <div className="my-3">
              <StatsCards />
            </div>
            <div className="sm:flex py-3">
              <div className="sm:w-2/3 overflow-hidden step-3">
                <AssetTable />
              </div>
              <div className="sm:w-1/3 p-3 step-4">
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

      {isConnected && <TourGuide steps={tourSteps} />}
    </main>
  );
};

export default Home;
