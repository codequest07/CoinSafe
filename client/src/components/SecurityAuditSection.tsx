import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

const auditors: Array<{ label: string; logoSrc: string }> = [
  { label: "Guild Audits", logoSrc: "/assets/%20guildaudit.svg" },
  { label: "Pelz Audits", logoSrc: "/assets/Pelz.svg" },
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
          WE PASSED THE <br /> SECURITY CHECK,
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
            We don't ask for your trust; we earn it. Coinsafe is non-custodial
            and fully audited, ensuring your manual deposits are always safe,
            accessible, and under your control.
          </p>
          <motion.div
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
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6"
          variants={containerVariants}>
          {auditors.map(({ label, logoSrc }, idx) => (
            <motion.div
              key={`${label}-${idx}`}
              className="flex items-center gap-4 rounded-2xl bg-[#272727B2] border border-white/5 px-6 py-5"
              variants={auditorVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}>
              <span className="w-14 h-14 rounded-full overflow-hidden bg-black/20 flex items-center justify-center">
                <img
                  src={logoSrc}
                  alt={label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </span>
              <span className="text-lg sm:text-xl font-[400] text-[#F1F1F1]">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SecurityAuditSection;
