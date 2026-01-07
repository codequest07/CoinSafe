import { Button } from "@/components/ui/button";
import MemoMoneyChange from "@/icons/MoneyChange";

const auditors = [
  "Audit firm",
  "Audit firm",
  "Audit firm",
  "Audit firm",
  "Audit firm",
];

const SecurityAuditSection = () => {
  return (
    <section className="bg-[#060608] text-[#F1F1F1] px-4 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#79E7BA] text-[#0A0A0A] text-[14px] font-[400]  tracking-wide">
          vibe check!
        </span>

        <h2 className="text-[36px] sm:text-[44px] lg:text-[52px] font-[500] text-[#F1F1F1] leading-tight">
          WE PASSED THE VIBE
          <br />
          CHECK FOR SECURITY,
        </h2>
        <p className="text-lg sm:text-[30px] font-[300] text-[#CACACA]">
          BUT DON’T TAKE <span className="italic">OUR WORD</span> FOR IT
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm sm:text-[18px] text-[#C6C6C6] max-w-[26rem] leading-relaxed">
            We’ve been audited by reputable audit firms, to ensure our smart
            contracts and systems are safe for you to keep your money in!
          </p>
          <Button className="bg-[#FFFFFFE5] text-[#0F0F13] hover:bg-white/90 rounded-full px-5 py-3 h-[44px]">
            Start saving
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 pt-6">
          {auditors.map((label, idx) => (
            <div
              key={`${label}-${idx}`}
              className="flex flex-col items-center gap-2">
              <span className="w-12 h-12 rounded-full bg-[#79E7BA] text-[#0A0A0A] flex items-center justify-center">
                <MemoMoneyChange className="w-5 h-5" />
              </span>
              <span className="text-sm text-[#C6C6C6]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecurityAuditSection;
