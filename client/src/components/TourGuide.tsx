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
        className="fixed bottom-8 right-4 bg-[#092324]  text-white font-bold py-2 px-4 rounded-[2rem] z-50">
        Start Tour
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
