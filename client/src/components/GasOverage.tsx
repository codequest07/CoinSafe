import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BadgeCard from "./Cards/BadgeCard";
import MyRewardCard from "./Cards/MyRewardCard";

const GasOVerage = () => {
  return (
    <main className="border-[#FFFFFF17] text-white p-4 border rounded-[1rem]">
      <div className="flex items-center px-6 p-3 justify-between">
        <div>
          <p className="text-base font-[300]">Gas coverage</p>
          <p className="font-[500] text-lg">$ 0.0005 / $ 2</p>
        </div>

        <div>
          <button className="text-[#010104] bg-[#FFFFFFE5] px-6 py-2 rounded-[2rem]">
            Save to earn more gas
          </button>
        </div>
      </div>
      <Tabs defaultValue="All badges" className="text-white">
        <TabsList className="flex w-full justify-center space-x-4 bg-[#1E1E1E99] rounded-[2rem] p-2 mb-4">
          <TabsTrigger
            value="All badges"
            className="text-white w-1/2 px-6 py-2 rounded-full">
            {" "}
            {/* Reduced padding */}
            All badges
          </TabsTrigger>
          <TabsTrigger
            value="My badges"
            className="text-white w-1/2 px-6 py-2 rounded-full">
            {" "}
            {/* Reduced padding */}
            My badges
          </TabsTrigger>
        </TabsList>
        <TabsContent value="All badges">
          <div className="p-4">
            <BadgeCard />
          </div>
        </TabsContent>
        <TabsContent value="My badges">
          <div className="p-4">
            <MyRewardCard />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default GasOVerage;
