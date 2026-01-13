import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import AppLogo from "@/icons/AppLogo";
import MemoHandburggerIcon from "@/icons/handburggerIcon";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <>
      <motion.nav
        className="bg-black fixed z-50 top-0 w-full py-4 sm:px-16 px-4 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <Link to="/" className="flex items-center space-x-2">
            <AppLogo className="" />
            {/* MemoNavX */}
          </Link>
        </motion.div>
        <Button
          className="bg-transparent hover:bg-transparent"
          onClick={toggleMenu}>
          <MemoHandburggerIcon className="w-9 h-9" />
          <span className="sr-only">Menu</span>
        </Button>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 z-40"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={toggleMenu}
            />
            <motion.div
              className="fixed inset-y-0 right-0 bg-black z-50 flex flex-col w-full sm:w-96"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit">
              <div className="flex justify-between items-center p-6">
                <Link to="/" className="flex items-center space-x-2">
                  <AppLogo className="" />
                </Link>
                <Button
                  className="bg-transparent hover:bg-transparent"
                  onClick={toggleMenu}>
                  <X className="h-9 w-9" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <motion.div
                className="flex flex-col justify-center items-start p-6 space-y-8 text-white text-5xl font-bold"
                variants={containerVariants}
                initial="hidden"
                animate="visible">
                <motion.div variants={menuItemVariants}>
                  <Link
                    to="https://app.coinsafe.network/"
                    className="hover:text-[#79E7BA] transition-colors">
                    APP
                  </Link>
                </motion.div>
                {/* <motion.div variants={menuItemVariants}>
                  <Link
                    to="/faucet"
                    className="hover:text-[#79E7BA] transition-colors">
                    FAUCET
                  </Link>
                </motion.div> */}
                <motion.div variants={menuItemVariants}>
                  <Link
                    to="/contact-us"
                    className="hover:text-[#79E7BA] transition-colors">
                    CONTACT US
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
