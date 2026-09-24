"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { socials } from "@/components/common/socials";

const Footer = () => {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const linkedin = socials[0];

  return (
    <footer
      id="contact"
      ref={ref}
      className="bg-[#0b0b0b] text-white dark:border-t dark:border-line"
    >
      <div className="mx-auto max-w-[1440px] px-6 pt-20 pb-10 md:px-16">
        <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end">
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-mono text-sm text-white/50">[ 03 ] contact</span>
            <h2
              data-perch="contact"
              className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-tight"
            >
              let&apos;s build something.
            </h2>
            <a
              href={linkedin.url}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center gap-2 border-b-2 border-accent pb-1 text-xl text-accent hover:gap-3 transition-all"
            >
              say hi on linkedin
              <ArrowUpRightIcon className="h-5 w-5" />
            </a>
          </motion.div>

          <ul className="flex flex-col gap-2 font-mono text-sm md:items-end">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent"
                >
                  {s.name} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/15 pt-5 font-mono text-xs text-white/50 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} jaffarjjati</span>
          <span>12.51 is the time when my head found the focus that i sought.</span>
          <span>built with next.js, tailwind &amp; three.js</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
