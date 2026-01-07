import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";
import LatestHero from "@/components/LatestHero";
import Navbar from "@/components/Navbar";
import StatsStrip from "@/components/StatsStrip";
import CoinGrowSection from "@/components/CoinGrowSection";
import SecurityAuditSection from "@/components/SecurityAuditSection";
import SecurityFeatures from "@/components/SecurityFeatures";
import TrustSection from "@/components/TrustSection";

const LandingPage = () => {
  return (
    <div>
      <main>
        <Navbar />
        <div className="mt-12">
          <LatestHero />
          <FeatureCards />
          <StatsStrip />
          <CoinGrowSection />
          <SecurityAuditSection />
          <SecurityFeatures />
          <TrustSection />
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
