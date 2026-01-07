import { Button } from "@/components/ui/button";

const TrustSection = () => {
  return (
    <section className="bg-[#060608] text-[#F1F1F1] px-4 py-14 sm:pt-24">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
        <h2 className="text-[32px] sm:text-[40px] lg:text-[44px] font-[500] text-[#F1F1F1] leading-tight">
          BUILT ON TRUST, FOR TRUST.
        </h2>
        <p className="text-sm sm:text-[20px] font-[200] text-[#C6C6C6] max-w-2xl leading-relaxed">
          information about how we are built on Lisk, the human layer etc
        </p>
        <Button className="bg-white text-[#0F0F13] hover:bg-white/90 rounded-full px-6 py-3 h-[44px]">
          Start saving
        </Button>
      </div>

      <div className="max-w-4xl mx-auto mt-10">
        <img
          src="/assets/trust-image.svg"
          alt="Coins on pillars"
          className="w-full h-auto object-cover"
        />
      </div>
    </section>
  );
};

export default TrustSection;
