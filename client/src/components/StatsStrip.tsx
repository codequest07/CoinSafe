import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
  { value: 20, suffix: "+", label: "Unique wallets" },
  { value: 500, suffix: "+", label: "Dollars locked" },
  { value: 2, suffix: "+", label: "Audits passed" },
];

const CountUp = ({
  end,
  suffix = "",
  duration = 2,
}: {
  end: number;
  suffix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

const StatsStrip = () => {
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

  return (
    <section
      className="bg-[#0C1714] text-[#F1F1F1] py-12 sm:py-14 md:py-16 px-4"
      ref={ref}>
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 text-center gap-8 sm:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}>
        {stats.map((item) => (
          <motion.div
            key={item.label}
            className="space-y-2"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}>
            <div className="text-[56px] sm:text-[80px] font-bold leading-none">
              {isInView ? (
                <CountUp end={item.value} suffix={item.suffix} />
              ) : (
                `0${item.suffix}`
              )}
            </div>
            <div className="text-sm sm:text-[20px] font-[300] uppercase tracking-wide text-[#CACACA]">
              {item.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default StatsStrip;
