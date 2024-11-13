"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import MemoLogo2 from "@/icons/Logo2";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Loading({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-6 border-[#FFFFFF17] bg-black text-white rounded-lg shadow-lg">
        <div className="h-[200px] rounded-2xl p-8 flex flex-col items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              repeat: Infinity,
            }}
            className="flex items-center justify-center mb-6">
            <MemoLogo2 className="w-80 h-20 text-[#20FFAF]" />
          </motion.div>
          <div className="flex flex-col items-center text-center">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-white text-xl font-[500] mb-2">
              SaveSense is ransacking your history...
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-400 text-sm mb-4">
              Please be patient while I assess your transactions
            </motion.p>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="w-6 h-6 text-[#20FFAF]" />
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
