import { useNavigate } from "react-router-dom";
import { Cover } from "./ui/cover";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div
      className="
          max-w-[1240px] mx-auto rounded-[12px] relative 
          flex flex-col justify-center sm:justify-start items-center
          border-[1px] border-[#FFFFFF17]
          h-[55vh] sm:h-[85vh] bg-gradient-to-tl from-[#48FF9169] via-[#0D1E15] to-[#0F271B] bg-no-repeat
          bg-bottom mt-6 bg-blend-overlay px-4 sm:px-6"
      style={{
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="absolute bottom-0">
        <img
          src="/assets/hero-image.svg"
          className="w-full h-auto max-w-[300px] sm:max-w-[800px]"
          alt="hero"
        />
      </div>
      <div className="pt-[50px] sm:pt-[100px] flex flex-col items-center">
        <div>
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#F1F1F1] text-center">
            Spend and save <Cover>like a total chad</Cover>
          </h1>
        </div>
        <div className="sm:max-w-[500px] pt-6">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-center text-[#CACACA]">
            Experience seamless savings, AI-powered insights, and a sprinkle of
            blockchain magic—built on Base
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-10">
          <button
            onClick={() => navigate("/extension")}
            className="bg-[#1E1E1E99] text-[#F1F1F1] px-5 py-2 sm:px-8 sm:py-3 rounded-[2rem]"
          >
            Download extension
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#FFFFFFE5] text-[#010104] px-5 py-2 sm:px-8 sm:py-3 rounded-[2rem]"
          >
            Launch app
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
