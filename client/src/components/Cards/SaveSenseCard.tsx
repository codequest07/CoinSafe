import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Link } from "react-router-dom";

const SaveSenseCard = () => {
  useEffect(() => {
    AOS.init({
      duration: 2000,
    });
  }, []);
  return (
    <div data-aos="fade-up">
      <Card className="bg-[#13131340] sm:w-[25rem] border-[#FFFFFF21]  rounded-xl overflow-hidden">
        <CardContent className="p-8 flex flex-col items-center text-center h-full">
          <div className="mb-8 w-40 h-40 relative">
            <img
              src="/assets/whisper.svg"
              alt="Whisper Device"
              className="w-40 h-40 sm:w-60 sm:h-60"
            />
          </div>
          <h3 className="text-2xl text-[#F1F1F1] font-medium my-7">
            Get rewarded for saving
          </h3>
          <p className="text-gray-400 mb-8 flex-grow">
            Saving doesn’t have to feel boring. Earn rewards like Gas Badges and
            bonuses when you stay consistent with your financial goals.
          </p>
          <Link to="/">
            <Button
              variant="outline"
              className="bg-[#3F3F3F99] rounded-[2rem] text-white hover:text-white border-gray-700 hover:bg-[#3F3F3F99]">
              Start saving
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaveSenseCard;
