import SmarterSavingCard from "@/components/Cards/SmarterSavingCard";
import VaultCard from "@/components/Cards/VaultCard";
import { useBalances } from "@/hooks/useBalances";
import SavingsCards from "@/components/SavingsCards";
import { useActiveAccount } from "thirdweb/react";
import { AssetTabs } from "@/components/Asset-tabs";
// import SavingsTargetsCarousel from "@/components/SavingsTargetsCarousel";

const Vault = () => {
  const account = useActiveAccount();
  const isConnected = !!account?.address;
  const address = account?.address;
  const { savingsBalance } = useBalances(address as string);

  return (
    <div className="w-full relative px-2 sm:px-4 overflow-x-hidden">
      <section className="w-full">
        <div className="w-full">
          <SmarterSavingCard />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pb-2 w-full">
          <VaultCard
            title="Vault balance"
            value={isConnected ? Number(savingsBalance.toFixed(2)) ?? 0.0 : 0.0}
            unit="USD"
            text={
              <>
                <span className="text-[#48FF91]">+18%</span> (compared to your
                previous savings)
              </>
            }
          />
          {/* <ClaimCard
          title="Claimable balance"
          value={0.0}
          unit="USD"
          text="sum of all your claimable assets"
        /> */}
        </div>

        <div className="w-full max-w-[1050px] overflow-x-hidden">
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

        <div className="py-2 max-w-[98%] ">
          <AssetTabs />
        </div>

        <div>{/* {isConnected && <SavingsHistoryTable />} */}</div>
      </section>
    </div>
  );
};

export default Vault;
