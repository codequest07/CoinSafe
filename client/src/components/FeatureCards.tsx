import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const FeatureCards = () => {
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
    hidden: { opacity: 0, y: 30 },
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
    hidden: { opacity: 0, scale: 0.8, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "backOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="px-4 sm:py-20 md:px-6 lg:px-8" ref={ref}>
      <div className="sm:mx-auto sm:max-w-[75rem]">
        <div className="grid md:grid-cols-1 gap-10 items-center">
          <motion.div
            className="space-y-4 max-w-[40rem] mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}>
            <motion.span
              className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFD504] text-[#010104] text-[14px] font-[400]  tracking-wide w-fit"
              variants={badgeVariants}>
              got goals?
            </motion.span>
            <motion.h2
              className="text-[36px] sm:text-[48px] lg:text-[56px] font-[500] uppercase text-[#F1F1F1] leading-tight"
              variants={itemVariants}>
              Smash your many money goals in one{" "}
              <span className="italic font-[100]">coool</span> place.
            </motion.h2>
            <motion.main
              className="flex items-center gap-4 justify-between"
              variants={itemVariants}>
              <div className="max-w-[24.5rem]">
                <p className="text-base sm:text-lg text-[#C6C6C6] max-w-2xl leading-relaxed">
                  We understand your goals and targets so we built a system to
                  help you organize and ace them all, easy peesy!
                </p>
              </div>
              <div className="pt-4">
                <motion.button
                  className="px-5 py-3 bg-[#FFFFFF] text-[#0F0F13] rounded-full text-sm font-medium shadow-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}>
                  Start saving
                </motion.button>
              </div>
            </motion.main>
          </motion.div>
          <motion.div
            className="relative flex justify-center"
            variants={imageVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}>
            <img
              src="/assets/phones.svg"
              alt="Coinsafe app preview"
              className="w-full max-w-[520px] drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
