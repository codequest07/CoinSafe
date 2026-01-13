import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";
import LatestHero from "@/components/LatestHero";
import Navbar from "@/components/Navbar";
import StatsStrip from "@/components/StatsStrip";
import CoinGrowSection from "@/components/CoinGrowSection";
import SecurityAuditSection from "@/components/SecurityAuditSection";
import SecurityFeatures from "@/components/SecurityFeatures";
import TrustSection from "@/components/TrustSection";
import { motion } from "framer-motion";
import { useEffect } from "react";

const LandingPage = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}>
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
    </motion.div>
  );
};

export default LandingPage;
