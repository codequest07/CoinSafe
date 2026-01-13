import { Button } from "@/components/ui/button";
import MemoMoneyChange from "@/icons/MoneyChange";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const auditors = [
  "Audit firm",
  "Audit firm",
  "Audit firm",
  "Audit firm",
  "Audit firm",
];

const SecurityAuditSection = () => {
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

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "backOut",
      },
    },
  };

  const auditorVariants = {
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

  return (
    <section
      className="bg-[#060608] text-[#F1F1F1] px-4 py-12 sm:py-20"
      ref={ref}>
      <motion.div
        className="max-w-4xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}>
        <motion.span
          className="inline-flex items-center px-3 py-1 rounded-full bg-[#79E7BA] text-[#0A0A0A] text-[14px] font-[400]  tracking-wide"
          variants={badgeVariants}>
          vibe check!
        </motion.span>

        <motion.h2
          className="text-[36px] sm:text-[44px] lg:text-[52px] font-[500] text-[#F1F1F1] leading-tight"
          variants={itemVariants}>
          WE PASSED THE VIBE
          <br />
          CHECK FOR SECURITY,
        </motion.h2>
        <motion.p
          className="text-lg sm:text-[30px] font-[300] text-[#CACACA]"
          variants={itemVariants}>
          BUT DON'T TAKE <span className="italic">OUR WORD</span> FOR IT
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          variants={itemVariants}>
          <p className="text-sm sm:text-[18px] text-[#C6C6C6] max-w-[26rem] leading-relaxed">
            We've been audited by reputable audit firms, to ensure our smart
            contracts and systems are safe for you to keep your money in!
          </p>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}>
            <Button className="bg-[#FFFFFFE5] text-[#0F0F13] hover:bg-white/90 rounded-full px-5 py-3 h-[44px]">
              Start saving
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 pt-6"
          variants={containerVariants}>
          {auditors.map((label, idx) => (
            <motion.div
              key={`${label}-${idx}`}
              className="flex flex-col items-center gap-2"
              variants={auditorVariants}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}>
              <span className="w-12 h-12 rounded-full bg-[#79E7BA] text-[#0A0A0A] flex items-center justify-center">
                <MemoMoneyChange className="w-5 h-5" />
              </span>
              <span className="text-sm text-[#C6C6C6]">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SecurityAuditSection;
