import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Visual Goal Tracking",
    desc: "Create dedicated vaults for your big moves. See exactly how close you are to your next milestone in real-time.",
    bg: "bg-[#A9D9B8]",
  },
  {
    title: "High-Yield Vaults",
    desc: "Don’t let your assets sit idle. Deposit into secure, audited vaults and watch your balance grow with competitive DeFi yields.",
    bg: "bg-[#C2A9D9]",
  },
  {
    title: "Asset Organization",
    desc: "One dashboard, zero clutter. Manage multiple streams and targets without jumping between different apps or protocols.",
    bg: "bg-[#D9D7A9]",
  },
  {
    title: "Security First",
    desc: "Built on battle-tested smart contracts. You keep 100% control of your keys and your funds, always.",
    bg: "bg-[#8BD7E9]",
  },
];

const SecurityFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className="bg-[#060608] text-[#F1F1F1] px-4 py-14 sm:py-24"
      ref={ref}>
      <motion.div
        className="max-w-6xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}>
        <motion.h2
          className="text-[32px] sm:text-[44px] lg:text-[48px] uppercase font-[500] text-[#F1F1F1] leading-tight"
          variants={itemVariants}>
          EVERYTHING YOU <span className="italic">REALLY</span> NEED TO
          <br />
          SAVE SUCCESSFULLY.
        </motion.h2>
        <motion.div
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6"
          variants={itemVariants}>
          <div className="space-y-3 max-w-[30rem]">
            <p className="text-sm sm:text-base text-[#C6C6C6] leading-relaxed">
              We've been audited by reputable audit firms, to ensure our smart
              contracts and systems are safe for you to keep your money in!
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
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
          className="grid sm:grid-cols-2 gap-5"
          variants={containerVariants}>
          {features.map((item, idx) => (
            <motion.div
              key={`${item.title}-${idx}`}
              className={`${item.bg} rounded-[16px] px-5 sm:px-6 py-6 sm:py-8 shadow-lg space-y-3`}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2 }}>
              <h3 className="text-base sm:text-[19px] uppercase font-[600] text-[#010104]">
                {item.title}
              </h3>
              <p className="text-xs sm:text-[15px] text-[#010104] leading-relaxed max-w-md">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SecurityFeatures;
