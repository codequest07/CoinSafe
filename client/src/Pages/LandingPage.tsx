import RecurrentSavingsCard from "@/components/Cards/RecurrentSavingsCard";
import SaveSenseCard from "@/components/Cards/SaveSenseCard";
import WhisperDownloadCard from "@/components/Cards/WhisperDownloadCard";
import WhisperSetupCard from "@/components/Cards/WhisperSetupCard";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import PoweredBy from "@/components/PoweredBy";
import TrackProgress from "@/components/TrackProgress";

const LandingPage = () => {
  return (
    <div>
      <main>
        <Navbar />
        <Hero />

        <div>
          <div className="max-w-[1240px] mx-auto">
            <div className="pt-[200px]">
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

        <TrackProgress />

        <PoweredBy />

        <Footer />
      </main>
    </div>
  );
};

export default LandingPage;
