import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const WhisperSetupCard = () => {
  useEffect(() => {
    AOS.init({
      duration: 2000,
    });
  }, []);

  return (
    <div data-aos="fade-up">
      <Card className="bg-[#13131340] sm:w-[25rem] border-[#FFFFFF21] rounded-xl overflow-hidden">
        <CardContent className="p-8 flex flex-col items-center text-center h-full">
          <div className="mb-8 w-40 h-40 relative">
            <img
              src="/assets/schedule.svg"
              alt="Whisper Device"
              className="w-40 h-40 sm:w-60 sm:h-60"
            />
          </div>
          <h3 className="text-2xl text-[#F1F1F1] font-medium my-7">
            Earn more on your crypto
          </h3>
          <p className="text-gray-400 mb-8 flex-grow">
            With Coinsafe, you can put it to work in high-yield vaults and
            investment plans, designed to maximize your returns.
          </p>
          <a href="#hero">
            <Button
              variant="outline"
              className="bg-[#3F3F3F99] rounded-[2rem] text-white hover:text-white border-gray-700 hover:bg-[#3F3F3F99]"
            >
              Start saving
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhisperSetupCard;
