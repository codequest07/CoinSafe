import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CoinGrowSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [startFloating, setStartFloating] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setStartFloating(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section
      className="relative overflow-hidden bg-[#060608] py-12 sm:py-16 px-4"
      ref={ref}>
      <div className="max-w-6xl mx-auto flex flex-col gap-0">
        <motion.div
          className="relative flex justify-start"
          initial={{ opacity: 0, y: 20 }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: startFloating ? [0, -10, 0] : 0,
                }
              : { opacity: 0, y: 20 }
          }
          transition={
            startFloating
              ? {
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : { duration: 0.6, ease: "easeOut" }
          }>
          <img
            src="/assets/coins.svg"
            alt="Coins"
            className="w-full sm:w-[260px] lg:w-[330px] md:ml-10"
          />
        </motion.div>
        {/* Top green banner with imagery */}
        <motion.div
          className="relative z-0 rounded-[20px] bg-[#A9D9B8] shadow-2xl overflow-hidden px-6 sm:px-8 lg:px-10 py-8 sm:py-16"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}>
          <div className="max-w-3xl space-y-2">
            <h3 className="text-[28px] sm:text-[34px] lg:text-[64px] font-[500] text-[#0F0F13] leading-tight">
              SAVE. EARN. GROW.
            </h3>
            <p className="text-lg sm:text-[30px] text-[#0F0F13] font-medium">
              IT REALLY CAN BE THAT{" "}
              <span className="italic font-normal">SIMPLE!</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          className="hidden sm:block absolute bottom-[80px] sm:bottom-[90px] right-4 sm:right-10 lg:right-40 z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  scale: 1,
                  y: startFloating ? [0, -15, 0] : 0,
                  rotate: startFloating ? [3, 5, 3] : 3,
                }
              : { opacity: 0, scale: 0.8 }
          }
          transition={
            startFloating
              ? {
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : { duration: 0.6, ease: "easeOut" }
          }>
          <img
            src="/assets/phone.svg"
            alt="Coinsafe app"
            className="w-[260px] sm:w-[300px] lg:w-[340px] drop-shadow-2xl"
          />
        </motion.div>

        {/* Bottom lavender callout */}
        <motion.div
          className="relative z-10 rounded-[18px] bg-[#C2A9D9] px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-16 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-6 sm:-mt-10"
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}>
          <p className="text-sm sm:text-[20px] text-[#010104] max-w-[34rem] font-[400] leading-relaxed">
            No complex strategies or hidden fees. Just a clean, secure interface
            designed to help you organize your capital and maximize your returns
            without the headache.
          </p>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}>
            <Button
              asChild
              className="bg-[#FFFFFFE5] text-[#0F0F13] w-[155px] h-[50px] hover:bg-white/90 rounded-[100px] px-6 py-3">
              <Link
                to="https://app.coinsafe.network/"
                target="_blank"
                rel="noopener noreferrer">
                Start saving
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CoinGrowSection;
