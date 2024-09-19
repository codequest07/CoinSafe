import PercentageCard from "@/components/Cards/PercentageCard";
import ReferralCard from "@/components/Cards/ReferralCard";
import UserDetailsCard from "@/components/Cards/UserCard";
import GasOVerage from "@/components/GasOverage";
import SavingsCalendar from "@/components/SavingsCalendar";

const Rewards = () => {
  return (
    <div className="flex w-full overflow-x-hidden ">
      {/* First Column - Larger */}
      <div className="w-full md:w-2/3 space-y-4">
        <PercentageCard />
        <GasOVerage />
      </div>

      {/* Second Column - Smaller */}
      <div className="w-full md:w-1/3 space-y-4">
        <UserDetailsCard />
        <ReferralCard />
        <SavingsCalendar />
      </div>
    </div>
  );
};

export default Rewards;
