import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const WhisperSetupCard = () => {
  useEffect(() => {
    AOS.init({
      duration: 2000,
    });
  }, []);
  return (
    <div
      data-aos="fade-up"
      className="flex justify-center items-end w-full sm:w-[35%] border border-[#FFFFFF17] rounded-[12px] p-6 sm:p-12 lg:p-20">
      <div className="w-full flex justify-center">
        <img
          src="/assets/whisper-device.svg"
          alt="Whisper Device"
          className="w-full h-auto max-w-[300px] sm:max-w-[400px] lg:max-w-[500px]"
        />
      </div>
    </div>
  );
};

export default WhisperSetupCard;
