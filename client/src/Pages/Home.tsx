import AssetTable from "@/components/AssetTable";
import ConnectModal from "@/components/Modals/ConnectModal";
// import ScheduledSavings from "@/components/ScheduledSavingsCard";
// import StatsCards from "@/components/stats-cards";
import TrackingChart from "@/components/TrackingChart";
import MobileHeader from "@/components/MobileHeader";
import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";

const Home = () => {
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const [openConnectModal, setOpenConnectModal] = useState(false);


  return (
    <main className="w-full overflow-x-hidden">
      <div className="flex flex-col w-full sm:flex pr-0 sm:pr-3">
        <>
          <MobileHeader />
       
          <div>
            <TrackingChart />
          </div>
        </>

        {isConnected && (
          <>
            {/* <div className="my-3">
              <StatsCards />
            </div> */}
            <div className=" py-3 flex-col sm:flex-row">
              <div className=" overflow-hidden  mb-3 sm:mb-0">
                <AssetTable />
              </div>
              {/* <div className="sm:w-1/3 md:block sm:pl-3 ">
                <ScheduledSavings />
              </div> */}
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
