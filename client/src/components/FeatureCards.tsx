import RecurrentSavingsCard from "./Cards/RecurrentSavingsCard";
import SaveSenseCard from "./Cards/SaveSenseCard";
import WhisperDownloadCard from "./Cards/WhisperDownloadCard";
import WhisperSetupCard from "./Cards/WhisperSetupCard";

const FeatureCards = () => {
  return (
    <div>
      <div className="md:max-w-7xl overflow-hidden md:mx-auto">
        <div className="pt-[80px]">
          <h2 className="sm:text-5xl text-[#F1F1F1] text-center">
            CoinSafe is changing the game for good...
          </h2>
        </div>
        <div className="text-[white] pt-20">
          <div className="flex sm:flex-row flex-col">
            <WhisperDownloadCard />
            <WhisperSetupCard />
          </div>
          <div className="flex  sm:flex-row flex-col">
            <SaveSenseCard />
            <RecurrentSavingsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCards;
