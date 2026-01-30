import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function Hero() {
  return (
    <div className="relative overflow-hidden" id="hero">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left column - Text content */}
          <motion.div
            className="space-y-6 md:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible">
            <motion.div className="space-y-4" variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl md:text-[50px] lg:text-[100px] font-[400]  text-[#F1F1F1] tracking-tight">
                SAVE YOUR
                <br />
                <span className="font-[600]">FUTURE.</span>
              </h1>

              <p className="text-base font-[400] sm:text-[24px] text-[#CACACA] md:max-w-2xl">
                The smartest way to organize, grow, and secure your crypto
                assets—on your own terms.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-wrap gap-4"
              variants={itemVariants}>
              <Link to="https://app.coinsafe.network/">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white h-[56px] w-[155px] cursor-pointer text-[#010104] rounded-[100px]  sm:w-auto">
                    Start saving
                  </Button>
                </motion.div>
              </Link>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}>
                <Button
                  asChild
                  size="lg"
                  variant="default"
                  className="bg-[#262628] hover:bg-[#262628]  w-[177px] cursor-pointer h-[56px] text-[#F1F1F1] rounded-[100px]  sm:w-auto">
                  <Link
                    to="https://coinsafe.gitbook.io/coinsafe-docs/getting-started/how-coinsafe-works"
                    target="_blank"
                    rel="noopener noreferrer">
                    View documentation
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              className="flex flex-wrap items-center gap-6 pt-6"
              variants={containerVariants}>
              {["Audited", "Secured", "Seamless"].map((label, index) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-2 text-[#CACACA] text-lg"
                  variants={badgeVariants}
                  custom={index}>
                  <span className="w-6 h-6 rounded-full bg-[#6AFFA3] flex items-center justify-center text-[#0A0A0A]">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="text-[18px]">{label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right column - Cards */}
          <div className="relative">
            {/* Top floating card */}
            <motion.div
              variants={imageVariants}
              initial="hidden"
              animate="visible">
              <img
                src="/assets/here-new.svg"
                alt="Coinsafe landing"
                className="w-fit h-auto"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
