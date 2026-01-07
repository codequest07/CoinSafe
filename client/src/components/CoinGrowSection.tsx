import { Button } from "@/components/ui/button";

const CoinGrowSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#060608] py-12 sm:py-16 px-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-0">
        <div className="relative flex justify-start">
          <img
            src="/assets/coins.svg"
            alt="Coins"
            className="w-full sm:w-[260px] lg:w-[330px] md:ml-10"
          />
        </div>
        {/* Top green banner with imagery */}
        <div className="relative z-0 rounded-[20px] bg-[#A9D9B8] shadow-2xl overflow-hidden px-6 sm:px-8 lg:px-10 py-8 sm:py-16">
          <div className="max-w-3xl space-y-2">
            <h3 className="text-[28px] sm:text-[34px] lg:text-[64px] font-[500] text-[#0F0F13] leading-tight">
              SAVE. EARN. GROW.
            </h3>
            <p className="text-lg sm:text-[30px] text-[#0F0F13] font-medium">
              IT REALLY CAN BE THAT{" "}
              <span className="italic font-normal">SIMPLE!</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:block absolute bottom-[80px] sm:bottom-[90px] right-4 sm:right-10 lg:right-40 z-10">
          <img
            src="/assets/phone.svg"
            alt="Coinsafe app"
            className="w-[260px] sm:w-[300px] lg:w-[340px] drop-shadow-2xl rotate-3"
          />
        </div>

        {/* Bottom lavender callout */}
        <div className="relative z-10 rounded-[18px] bg-[#C2A9D9] px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-16 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-6 sm:-mt-10">
          <p className="text-sm sm:text-[20px] text-[#010104] max-w-[34rem] font-[400] leading-relaxed">
            We understand your goals and targets so we built a system to help
            you organize and ace them all, easy peasy!
          </p>
          <Button className="bg-[#FFFFFFE5] text-[#0F0F13] w-[155px] h-[50px] hover:bg-white/90 rounded-[100px] px-6 py-3">
            Start saving
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoinGrowSection;
