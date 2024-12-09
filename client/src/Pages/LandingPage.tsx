import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";
import LandingFeatures from "@/components/LandingFeatures";
// import Hero from "@/components/Hero";
import LatestHero from "@/components/LatestHero";
import Navbar from "@/components/Navbar";
import PoweredBy from "@/components/PoweredBy";
import TrackProgress from "@/components/TrackProgress";

const LandingPage = () => {
  return (
    <div>
      <main>
        <Navbar />
        <LatestHero />

        <FeatureCards />
        <LandingFeatures />
        <TrackProgress />

        <PoweredBy />

        <Footer />
      </main>
    </div>
  );
};

export default LandingPage;
