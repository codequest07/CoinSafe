import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const WhisperDownloadCard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    AOS.init({
      duration: 2000,
    });
  }, []);
  return (
    <div
      data-aos="fade-up"
      className="w-full sm:w-[65%]  mx-auto rounded-[12px] border border-[#FFFFFF17] p-6 sm:p-12 lg:p-20">
      <div className="flex flex-col justify-center items-center text-center">
        <div className="mb-6">
          <img
            src="/assets/whisper.svg"
            alt="Whisper"
            className="w-40 h-40 sm:w-full sm:h-full"
          />
        </div>
        <div className="mb-6">
          <div className="text-xl font-semibold sm:text-2xl lg:text-3xl">
            Spend and save with Whisper
          </div>
          <div className="text-[#CACACA] sm:w-[400px]  text-sm sm:text-base lg:text-lg mt-2">
            Spend and save like a total chad. Whisper automatically locks in
            savings every time you make a move.
          </div>
        </div>
        <div>
          <button
            onClick={() => navigate("/extension")}
            className="bg-[#1E1E1E99] text-[#F1F1F1] px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-full">
            Download extension
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhisperDownloadCard;
