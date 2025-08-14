import { Button } from "@/components/ui/button";
import { useState } from "react";
import { WaitlistModal } from "./Modals/Waitlist-modal";
import { Link } from "react-router-dom";

export default function Hero() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  return (
    <div className="relative overflow-hidden" id="hero">
      {/* Grid overlay background image */}
      <div className="absolute inset-0 bg-[url('/assets/herobg.svg')] bg-repeat bg-opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h1
                style={{
                  background: "linear-gradient(to right, #F1F1F1, #8B8B8B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                className="text-4xl sm:text-5xl md:text-[50px] lg:text-[50px] font-[500]  text-white tracking-tight">
                Build better saving habits,
                <br />
                one step at a time.
              </h1>

              <p className="text-base font-[400] sm:text-base text-gray-400 md:max-w-2xl">
                Whether you prefer to automate or save manually, Coinsafe helps
                you understand your money and make smarter choices, without the
                pressure.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {/* <Button
                size="lg"
                variant="default"
                className="bg-[#262628] text-[#F1F1F1] rounded-[2rem]  sm:w-auto">
                Download extension
              </Button> */}
              <Link to="https://app.coinsafe.network/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-[#010104] rounded-[2rem]  sm:w-auto">
                  Start saving
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column - Cards */}
          <div className="relative">
            {/* Top floating card */}
            <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src="/assets/heroIma.png"
                alt="Claimable Card"
                className="w-full h-auto"
              />
            </div>

            {/* Bottom floating card
            <div className="relative md:absolute md:-bottom-[4.6rem] md:-left-2 w-full md:w-[35rem]  transform -rotate-0  md:-rotate-10  ">
              <img
                src="/assets/VaultCard.svg"
                alt="Vault Card"
                className="w-full h-auto"
              />
            </div> */}
          </div>
        </div>
      </div>
      <WaitlistModal
        open={showWaitlistModal}
        onOpenChange={setShowWaitlistModal}
      />
    </div>
  );
}
