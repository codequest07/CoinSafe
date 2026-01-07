import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden" id="hero">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-[50px] lg:text-[100px] font-[400]  text-[#F1F1F1] tracking-tight">
                SAVE YOUR
                <br />
                <span className="font-[600]">FUTURE.</span>
              </h1>

              <p className="text-base font-[400] sm:text-[24px] text-[#CACACA] md:max-w-2xl">
                Automate your savings so they happen in the background, or
                deposit manually when it suits you.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="https://app.coinsafe.network/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white h-[56px] w-[155px] cursor-pointer text-[#010104] rounded-[100px]  sm:w-auto">
                  Start saving
                </Button>
              </Link>

              <Button
                size="lg"
                variant="default"
                className="bg-[#262628] hover:bg-[#262628]  w-[177px] cursor-pointer h-[56px] text-[#F1F1F1] rounded-[100px]  sm:w-auto">
                View documentation
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-6">
              {["Audited", "Secured", "Seamless"].map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-[#CACACA] text-lg">
                  <span className="w-6 h-6 rounded-full bg-[#6AFFA3] flex items-center justify-center text-[#0A0A0A]">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="text-[18px]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Cards */}
          <div className="relative">
            {/* Top floating card */}
            <div>
              <img
                src="/assets/here-new.svg"
                alt="Coinsafe landing"
                className="w-fit h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
