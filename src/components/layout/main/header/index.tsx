"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/main/navbar";
import Switch from "@/components/common/switch";
import { Bars3BottomLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

const Header = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  return (
    <motion.header
      className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.1 }}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-4 md:px-16">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden"
            onClick={() => setIsNavbarOpen(true)}
          >
            <Bars3BottomLeftIcon className="h-6 w-6" />
          </button>
          <Link href="/" className="font-mono text-lg font-bold">
            <span className="animate-pulse">12:51</span>
          </Link>
          <span className="hidden font-mono text-sm text-muted sm:inline">
            jaffarjjati
          </span>
        </div>

        <div className="hidden md:block">
          <Navbar />
        </div>

        <Switch />
      </div>

      <AnimatePresence>
        {isNavbarOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-paper md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <span className="font-mono text-lg font-bold">12:51</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsNavbarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <Navbar vertical onNavigate={() => setIsNavbarOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
