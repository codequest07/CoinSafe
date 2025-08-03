import PercentageCard from "@/components/Cards/PercentageCard";
// import ReferralCard from "@/components/Cards/ReferralCard";
import UserDetailsCard from "@/components/Cards/UserCard";
import GasOVerage from "@/components/GasOverage";
import SavingsCalendar from "@/components/SavingsCalendar";

const Rewards = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full items-start justify-between overflow-x-hidden space-y-4 lg:space-y-0 lg:space-x-4">
      <div className="w-full lg:w-2/3 space-y-4">
        <PercentageCard />
        <GasOVerage />
      </div>

      <div className="w-full lg:w-1/3 space-y-4">
        <UserDetailsCard />
        {/* <ReferralCard /> */}
        <SavingsCalendar />
      </div>
    </div>
  );
};

export default Rewards;
