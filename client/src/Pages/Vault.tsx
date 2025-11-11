import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import VaultCard from "@/components/Cards/VaultCard";
import SavingsCards from "@/components/SavingsCards";
import { useActiveAccount } from "thirdweb/react";
import { AssetTabs } from "@/components/Asset-tabs";
import { loadingState, savingsBalanceState } from "@/store/atoms/balance";
import { useRecoilState } from "recoil";
import { useMemo, useState } from "react";
import MobileHeader from "@/components/MobileHeader";
import SavingOption from "@/components/Modals/SavingOption";
// import SavingsTargetsCarousel from "@/components/SavingsTargetsCarousel";

const Vault = () => {
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

  const [loading] = useRecoilState(loadingState);
  const [savingsBalance] = useRecoilState(savingsBalanceState);
  const openFirstModal = () => setIsFirstModalOpen(true);

  const savings = useMemo(() => loading.savings, [loading]);

  return (
    <div className="w-full relative px-0 sm:px-4 overflow-x-hidden">
      <MobileHeader />
      <section className="w-full">
        <div className="w-full">
          <SmarterSavingCard />
        </div>
        <button
          onClick={openFirstModal}
          className="rounded-[100px] sm:hidden w-full max-w-[100%] mx-auto my-4 block px-8 py-[8px] bg-[#FFFFFFE5] h-[40px] text-sm text-[#010104]"
        >
          Save
        </button>
        <div className="flex flex-col sm:flex-row gap-2 pb-2 w-full">
          <VaultCard
            title="Vault balance"
            value={isConnected ? Number(savingsBalance.toFixed(2)) || 0.0 : 0.0}
            unit="USD"
            text={
              <>
                <span className="text-[#48FF91]">+18%</span> (compared to your
                previous savings)
              </>
            }
            loading={savings}
          />
          {/* <ClaimCard
          title="Claimable balance"
          value={0.0}
          unit="USD"
          text="sum of all your claimable assets"
        /> */}
        </div>

        <div className="hidden md:block w-full max-w-full overflow-x-hidden">
          <SavingsCards />
        </div>

        {/* <div className="max-w-full">
        <SavingsCards />
      </div> */}

        {/* <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-4">
        <CurrencyBreakdown />
      </div> */}

        {/* <div className="py-2 pr-2">
        <SavingsPerformance />
      </div> */}

        <div className="py-2 w-full">
          <AssetTabs />
        </div>

        <div>{/* {isConnected && <SavingsHistoryTable />} */}</div>
      </section>
      <SavingOption
        isFirstModalOpen={isFirstModalOpen}
        setIsFirstModalOpen={setIsFirstModalOpen}
        isSecondModalOpen={isSecondModalOpen}
        setIsSecondModalOpen={setIsSecondModalOpen}
      />
    </div>
  );
};

export default Vault;
