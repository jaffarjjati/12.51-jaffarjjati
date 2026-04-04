"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Footer = () => {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  const items = [
    "Built with Next.js, Tailwind CSS, and TypeScript.",
    "12.51 is the time when my head found the focus that i sought.",
    `© ${new Date().getFullYear()} jaffarjjati. All rights reserved.`,
  ];

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-3 border-t border-black border-separate"
    >
      {items.map((text, i) => (
        <motion.div
          key={i}
          className={`col-span-1 p-4 ${i < 2 ? "md:border-r border-black" : ""} ${i > 0 ? "border-t md:border-t-0 border-black" : ""}`}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: i * 0.12, duration: 0.5 }}
        >
          <span className="text-sm">{text}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default Footer;
