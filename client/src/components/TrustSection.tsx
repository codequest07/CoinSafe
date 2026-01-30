import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

const TrustSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className="bg-[#060608] text-[#F1F1F1] px-4 py-14 sm:pt-24"
      ref={ref}>
      <motion.div
        className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}>
        <motion.h2
          className="text-[32px] sm:text-[40px] lg:text-[44px] font-[500] text-[#F1F1F1] leading-tight"
          variants={itemVariants}>
          BUILT ON TRUST, FOR TRUST.
        </motion.h2>
        <motion.p
          className="text-sm sm:text-[20px] font-[200] text-[#C6C6C6] max-w-2xl leading-relaxed"
          variants={itemVariants}>
          information about how we are built on Lisk, the human layer etc
        </motion.p>
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}>
          <Button
            asChild
            className="bg-white text-[#0F0F13] hover:bg-white/90 rounded-full px-5 py-3 h-[44px] w-fit">
            <Link
              to="https://app.coinsafe.network/"
              target="_blank"
              rel="noopener noreferrer">
              Start saving
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="max-w-4xl mx-auto mt-10"
        variants={imageVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}>
        <img
          src="/assets/trust-image.svg"
          alt="Coins on pillars"
          className="w-full h-auto object-cover"
        />
      </motion.div>
    </section>
  );
};

export default TrustSection;
