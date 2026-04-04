"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/main/navbar";
import Switch from "@/components/common/switch";
import { Bars3BottomLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import useIsMobile from "@/components/hooks/useIsMobile";

const Header = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleNavbar = () => setIsNavbarOpen(!isNavbarOpen);

  useEffect(() => {
    if (!isMobile) {
      setIsNavbarOpen(false);
    }
  }, [isMobile]);

  return (
    <motion.header
      className="py-4 px-8 md:px-16"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.1 }}
    >
      {isMobile ? (
        <div className="relative flex items-center justify-between">
          <motion.div whileTap={{ scale: 0.85 }}>
            <Bars3BottomLeftIcon
              className="h-6 w-6 cursor-pointer"
              onClick={toggleNavbar}
            />
          </motion.div>
          <span className="animate-pulse text-2xl">12:51</span>
          <Switch size="small" />
          <AnimatePresence>
            {isNavbarOpen && (
              <motion.div
                className="fixed inset-0 bg-white shadow-lg z-50"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Menu</h2>
                  <motion.div whileTap={{ rotate: 90, scale: 0.8 }}>
                    <XMarkIcon
                      className="h-6 w-6 cursor-pointer"
                      onClick={toggleNavbar}
                    />
                  </motion.div>
                </div>
                <Navbar />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid grid-cols-12 items-center gap-4">
          <motion.div
            className="col-span-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="animate-pulse text-2xl">12:51</span>
          </motion.div>
          <motion.div
            className="col-span-8 flex justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Navbar />
          </motion.div>
          <motion.div
            className="col-span-2 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Switch size="small" />
          </motion.div>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
