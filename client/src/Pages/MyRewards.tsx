import Card from "@/components/Card";
import CoverageRewardCard from "@/components/CoverageRewardCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyRewards = () => {
  return (
    <div>
      {/* <ComingSoon /> */}
      <div>
        <div>
          <div className="flex mb-2">
            <Card
              title="Savings points"
              value={5800000}
              unit="points"
              emphasize="find out"
              text="how points will be used"
            />
            <Card
              title="Referral points"
              value={5800000}
              unit="points"
              emphasize="find out"
              text="how points will be used"
              badge="1100"
            />
            <Card
              title="Points Multiplier"
              value={1.2}
              unit="points"
              emphasize="find out"
              text="how points will be used"
              badge="1100"
            />
          </div>

          <div className="border-[1px] border-[#FFFFFF17] rounded-[12px] p-6 w-full">
            <div className="flex flex-col">
              <div className="text-[#CACACA]">Gas coverage</div>
              <div className="flex justify-between items-center">
                <div className="text-[#F1F1F1] text-2xl">$ 0.0005 / $ 2</div>
                <button className="bg-[#FFFFFFE5] px-8 py-3 text-[#010104] rounded-[100px]">
                  Save to earn more gas
                </button>
              </div>
            </div>
            <div>
              <div className="py-10">
                <Tabs defaultValue="myBadges" className="p-0">
                  <TabsList className="bg-[#1E1E1E99] rounded-[100px]">
                    <TabsTrigger
                      value="account"
                      className="rounded-[100px] font-light">
                      All Badges
                    </TabsTrigger>
                    <TabsTrigger
                      value="myBadges"
                      className="rounded-[100px] font-light">
                      My Badges
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="myBadges">
                    <div className="pt-10">
                      <CoverageRewardCard ImgSrc="/assets/coverage-reward.svg" />
                    </div>
                  </TabsContent>
                  {/* <TabsContent value="">Change your password here.</TabsContent> */}
                </Tabs>
              </div>
            </div>
          </div>
        </div>
        <div>right</div>
      </div>
    </div>
  );
};

export default MyRewards;
