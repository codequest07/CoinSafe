import { Button } from "@/components/ui/button";
import { WaitlistModal } from "./Waitlist-modal";
import { useState } from "react";

export default function LandingFeatures() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  return (
    <div className="  px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-between gap-8 pb-16 md:flex-row md:pb-24">
          <h1
            className="max-w-4xl text-center text-4xl font-medium tracking-tight md:text-left "
            style={{
              background: "linear-gradient(to right, #F1F1F1, #8B8B8B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            Coinsafe makes saving and investing with <br /> crypto simple,
            secure, and rewarding.
          </h1>

          <Button
            onClick={() => setShowWaitlistModal(true)}
            variant="secondary"
            className="whitespace-nowrap rounded-full px-6 py-2">
            Join waitlist
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden border border-[#FFFFFF21] rounded-3xl bg-[#1D1D1D73] p-6 md:p-8">
            <div className="mb-4 h-16 w-16">
              <img src="/assets/Mask.svg" alt="Mask" className="w-16 h-16" />
            </div>
            <p className="text-white text-[14px]">
              Coinsafe automates saving, so you can focus on what matters.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#FFFFFF21]  bg-[#1D1D1D73] p-6 md:p-8">
            <div className="mb-4 h-16 w-16">
              <img
                src="/assets/Cylinder.svg"
                alt="Cylinder"
                className="w-16 h-16"
              />
            </div>
            <p className="text-white text-[14px]">
              Get personalized savings and investment plans built for your
              goals.
            </p>
          </div>

          <div className="relative overflow-hidden border border-[#FFFFFF21] rounded-3xl bg-[#1D1D1D73] p-6 md:p-8">
            <div className="mb-4 h-16 w-16">
              <img
                src="/assets/FlatCylinder.svg"
                alt="FlatCylinder"
                className="w-16 h-16"
              />
            </div>
            <p className="text-white text-[14px]">
              Save confidently with advanced encryption and top-notch security.
            </p>
          </div>

          <div className="relative overflow-hidden border border-[#FFFFFF21] rounded-3xl bg-[#1D1D1D73] p-6 md:p-8">
            <div className="mb-4 h-16 w-16">
              <img src="assets/Pill.svg" alt="Pill" className="w-16 h-16" />
            </div>
            <p className="text-white text-[14px]">
              Coinsafe makes saving easy, whether you&apos;re new to crypto or a
              pro.
            </p>
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
