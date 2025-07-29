import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import BadgeCard from "./Cards/BadgeCard";
// import MyRewardCard from "./Cards/MyRewardCard";
// import ComingSoon from "./Coming-Soon";
import MiniComingSoon from "./Mini-Coming-Soon";

const GasOVerage = () => {
  return (
    <main className="border-[#FFFFFF17] text-white p-4 border rounded-[1rem]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center px-6 p-3 justify-between space-y-3 sm:space-y-0">
        <div>
          <p className="text-[15px] font-[300] text-[#CACACA]">Gas coverage</p>
          <p className="font-[500] text-2xl text-[#F1F1F1]">$ 0.00</p>
        </div>

        <div>
          <button className="text-[#B5B5B5] bg-[#3F3F3F99] px-4 sm:px-6 py-2 rounded-[2rem] text-sm sm:text-base w-full sm:w-auto">
            Save to earn more gas
          </button>
        </div>
      </div>
      <Tabs defaultValue="All badges" className="text-white">
        <TabsList className="flex w-full sm:w-[30%] space-x-2 bg-[#7F7F7F] rounded-[2rem] mb-4">
          <TabsTrigger
            value="All badges"
            className="text-white w-1/2 px-2 py-2 rounded-full text-sm sm:text-base">
            All badges
          </TabsTrigger>
          <TabsTrigger
            value="My badges"
            className="text-white w-1/2 px-2 py-2 rounded-full text-sm sm:text-base">
            My badges
          </TabsTrigger>
        </TabsList>
        <TabsContent value="All badges">
          <div className="">
            {/* <BadgeCard /> */}
            <MiniComingSoon />
          </div>
        </TabsContent>
        <TabsContent value="My badges">
          <div className="">
            {/* <MyRewardCard /> */}
            <MiniComingSoon />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default GasOVerage;
