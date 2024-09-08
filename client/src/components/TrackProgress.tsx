import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const TrackProgress = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 2000,
    });
  }, []);
  return (
    <div className="relative flex justify-center px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="w-full max-w-screen-lg">
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 md:pt-[200px] pb-8 md:pb-[80px]">
          <div className="text-[24px] md:text-[40px] text-[#F1F1F1] max-w-full md:max-w-[658px] text-center md:text-left">
            Track your progress, manage your savings, and stay in control
          </div>
          <div className="mt-6 md:mt-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-[#1E1E1E99] text-[#F1F1F1] px-4 py-2 md:px-6 md:py-3 rounded-full">
              Get Started
            </button>
          </div>
        </div>
        <div data-aos="fade-up" className="w-full flex justify-center">
          <img
            src="/assets/dashboard-image.svg"
            alt="Dashboard"
            className="w-full max-w-[500px] md:max-w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default TrackProgress;
