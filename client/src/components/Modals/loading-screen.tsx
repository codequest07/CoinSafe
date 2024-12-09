"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import MemoLogo2 from "@/icons/Logo2";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const messages = [
  "SaveSense is thinking...",
  "SaveSense is plotting...",
  "SaveSense is admiring your chad moves...",
  "SaveSense is ransacking your history...",
];

const LogoAnimation = () => (
  <motion.svg
    width="20"
    height="20"
    viewBox="0 0 31 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 3,
      ease: "easeInOut",
      times: [0, 0.2, 0.8, 1],
      repeat: Infinity,
    }}>
    <motion.path
      d="M29.4896 15.249H2.80193C2.3194 15.249 1.92822 15.8787 1.92822 16.6555V23.3322C1.92822 24.109 2.3194 24.7387 2.80193 24.7387H29.4896C29.9721 24.7387 30.3633 24.109 30.3633 23.3322V16.6555C30.3633 15.8787 29.9721 15.249 29.4896 15.249Z"
      fill="#79E7BA"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.path
      d="M29.3056 4.62236L2.91805 0.630676C2.44096 0.558505 1.96002 1.12259 1.84384 1.89059L0.845184 8.49232C0.729007 9.26032 1.02159 9.94141 1.49868 10.0136L27.8862 14.0053C28.3633 14.0774 28.8442 13.5134 28.9604 12.7454L29.9591 6.14362C30.0753 5.37562 29.7827 4.69453 29.3056 4.62236Z"
      fill="#79E7BA"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5,
      }}
    />
    <motion.path
      d="M1.49813 29.9866L27.8857 25.9949C28.3628 25.9228 28.8437 26.4868 28.9599 27.2548L29.9585 33.8566C30.0747 34.6246 29.7821 35.3057 29.305 35.3778L2.9175 39.3695C2.44041 39.4417 1.95947 38.8776 1.84329 38.1096L0.844635 31.5079C0.728458 30.7399 1.02104 30.0588 1.49813 29.9866Z"
      fill="#79E7BA"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      }}
    />
  </motion.svg>
);

export default function Loading({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-6 border-[#FFFFFF17] bg-black text-white rounded-lg shadow-lg">
        <div className="h-[200px] rounded-2xl p-8 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-6">
            {/* <MemoLogo2 className="w-80 h-20 text-[#20FFAF]" /> */}
            <LogoAnimation />
          </div>
          <div className="flex flex-col items-center text-center">
            <AnimatePresence mode="popLayout">
              <motion.h2
                key={messageIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-white text-xl font-[500] mb-2">
                {messages[messageIndex]}
              </motion.h2>
            </AnimatePresence>
            <motion.p
              animate={{
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                times: [0, 0.5, 1],
                repeat: Infinity,
                delay: 0.5,
              }}
              className="text-gray-400 text-sm mb-4">
              Please be patient while I assess your transactions
            </motion.p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
