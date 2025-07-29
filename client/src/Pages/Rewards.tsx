import PercentageCard from "@/components/Cards/PercentageCard";
// import ReferralCard from "@/components/Cards/ReferralCard";
import UserDetailsCard from "@/components/Cards/UserCard";
import GasOVerage from "@/components/GasOverage";
import SavingsCalendar from "@/components/SavingsCalendar";

const Rewards = () => {
  return (
    <div className="flex w-full items-start justify-between overflow-x-hidden">
      <div className="w-full md:w-2/3 space-y-4">
        <PercentageCard />
        <GasOVerage />
      </div>

      <div className="w-full md:w-1/3 space-y-4 mt-4 md:mt-0">
        <UserDetailsCard />
        {/* <ReferralCard /> */}
        <SavingsCalendar />
      </div>
    </div>
  );
};

export default Rewards;
