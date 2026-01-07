import { Button } from "@/components/ui/button";

const features = [
  {
    title: "GET SMART RECOMMENDATIONS",
    desc: "We’ve been audited by reputable audit firms, to ensure our smart contracts and systems are safe for you to keep your money in!",
    bg: "bg-[#A9D9B8]",
  },
  {
    title: "SAVE TOWARDS TARGETS",
    desc: "We’ve been audited by reputable audit firms, to ensure our smart contracts and systems are safe for you to keep your money in!",
    bg: "bg-[#C2A9D9]",
  },
  {
    title: "EARN YIELDS ON SAVINGS",
    desc: "We’ve been audited by reputable audit firms, to ensure our smart contracts and systems are safe for you to keep your money in!",
    bg: "bg-[#D9D7A9]",
  },
  {
    title: "SAVE TOWARDS TARGETS",
    desc: "We’ve been audited by reputable audit firms, to ensure our smart contracts and systems are safe for you to keep your money in!",
    bg: "bg-[#8BD7E9]",
  },
];

const SecurityFeatures = () => {
  return (
    <section className="bg-[#060608] text-[#F1F1F1] px-4 py-14 sm:py-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-[32px] sm:text-[44px] lg:text-[48px] uppercase font-[500] text-[#F1F1F1] leading-tight">
          EVERYTHING YOU <span className="italic">REALLY</span> NEED TO
          <br />
          SAVE SUCCESSFULLY.
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-3 max-w-[30rem]">
            <p className="text-sm sm:text-base text-[#C6C6C6] leading-relaxed">
              We’ve been audited by reputable audit firms, to ensure our smart
              contracts and systems are safe for you to keep your money in!
            </p>
          </div>
          <Button className="bg-white text-[#0F0F13] hover:bg-white/90 rounded-full px-5 py-3 h-[44px] w-fit">
            Start saving
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className={`${item.bg} rounded-[16px] px-5 sm:px-6 py-6 sm:py-8 shadow-lg space-y-3`}>
              <h3 className="text-base sm:text-[19px] font-[600] text-[#010104]">
                {item.title}
              </h3>
              <p className="text-xs sm:text-[15px] text-[#010104] leading-relaxed max-w-md">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityFeatures;
