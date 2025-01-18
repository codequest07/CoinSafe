import React, { useState } from "react";
import Joyride, { Step, CallBackProps } from "react-joyride";

interface TourGuideProps {
  steps: Step[];
}

export const TourGuide: React.FC<TourGuideProps> = ({ steps }) => {
  const [run, setRun] = useState(false);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRun(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setRun(true)}
        className="fixed bottom-8 right-4 bg-[#092324] text-white font-bold py-2 px-4 rounded-[2rem] z-50 animate-pulse hover:animate-none focus:animate-none transition-all duration-700 ease-in-out transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#092324]"
        aria-label="Start Tour">
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
          Start Tour
        </span>
      </button>
      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        styles={{
          options: {
            primaryColor: "#092324",
          },
        }}
        callback={handleJoyrideCallback}
      />
    </>
  );
};
