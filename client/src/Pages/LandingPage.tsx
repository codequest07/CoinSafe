import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";
import LandingFeatures from "@/components/LandingFeatures";
// import Hero from "@/components/Hero";
import LatestHero from "@/components/LatestHero";
import Navbar from "@/components/Navbar";
import PoweredBy from "@/components/PoweredBy";
import ToolsSection from "@/components/Tools-section";
import TrackProgress from "@/components/TrackProgress";

const LandingPage = () => {
  return (
    <div>
      <main>
        <Navbar />
        <div className="mt-12">
          <LatestHero />
          <FeatureCards />
          <ToolsSection />
          <LandingFeatures />
          <TrackProgress />
          <PoweredBy />
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
