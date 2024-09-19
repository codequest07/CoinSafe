import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const SaveSenseCard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    AOS.init({
      duration: 2000,
    });
  }, []);
  return (
    <div data-aos="fade-right" className="w-full sm:w-1/2 ">
      <div className="flex flex-col justify-between h-full rounded-[12px] border-[1px] border-[#FFFFFF17] p-6 sm:p-12 lg:p-20">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/assets/savesense.svg"
            alt="SaveSense"
            className="w-24 h-24 sm:w-60 sm:h-60"
          />
          <div className="text-center mt-4">
            <div className="text-xl font-semibold">
              Smart savings with SaveSense
            </div>
            <div className="text-[#CACACA] mt-2 text-sm sm:text-base lg:text-lg">
              Our AI isn’t just smart—it’s a wealth wizard. It analyzes your
              spending and crafts a savings plan that’s borderline genius.
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#1E1E1E99] text-[#F1F1F1] px-6 py-3 rounded-full">
            Start saving
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveSenseCard;
