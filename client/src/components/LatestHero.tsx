import { Button } from "@/components/ui/button";
import { useState } from "react";
import { WaitlistModal } from "./Modals/Waitlist-modal";

export default function Hero() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  return (
    <div className="relative overflow-hidden">
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
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                Save smarter
                <br />
                Earn effortlessly
              </h1>
              <p className="text-base sm:text-lg text-gray-400 md:max-w-2xl">
                Transform your spending into effortless savings. With
                personalized insights, high-yield vaults, and rewards built
                around your goals, Coinsafe makes growing your crypto simple and
                exciting.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                variant="default"
                className="bg-[#262628] text-[#F1F1F1] rounded-[2rem]  sm:w-auto">
                Download extension
              </Button>
              <Button
                onClick={() => setShowWaitlistModal(true)}
                size="lg"
                variant="outline"
                className="border-white text-[#010104] rounded-[2rem]  sm:w-auto">
                Join waitlist
              </Button>
            </div>
          </div>

          {/* Right column - Cards */}
          <div className="relative mt-12 md:mt-0">
            {/* Top floating card */}
            <div className="relative md:absolute md:top-10 md:right-0 w-full md:w-[35rem]  transform rotate-0  md:-rotate-0  ">
              <img
                src="/assets/ClaimableCard.svg"
                alt="Claimable Card"
                className="w-full h-auto"
              />
            </div>

            {/* Bottom floating card */}
            <div className="relative md:absolute md:-bottom-[4.6rem] md:-left-2 w-full md:w-[35rem]  transform -rotate-0  md:-rotate-10  ">
              <img
                src="/assets/VaultCard.svg"
                alt="Vault Card"
                className="w-full h-auto"
              />
            </div>
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
