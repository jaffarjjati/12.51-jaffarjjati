"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import Highlight from "@/components/common/highlight";
import Social from "@/components/common/social";
import { socials } from "@/components/common/socials";
import { useTheme } from "@/context/ThemeContext";
import photoProfile from "@/assets/images/1000067811.jpg";

const titleLines = [
  { text: "Based", indent: "pl-[9%]", x: -300, delay: 0 },
  { text: "Software", indent: "pl-[14%]", x: 300, delay: 0.15, mark: true },
  { text: "Engineer", indent: "", x: -300, delay: 0.3 },
];

const Hero = () => {
  const { isDarkMode } = useTheme();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 15 });

  const handlePhotoMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) * 0.06);
    mouseY.set((e.clientY - rect.top - rect.height / 2) * 0.06);
  };
  const handlePhotoLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="home"
      className="flex flex-col gap-12 overflow-x-clip pt-10 pb-20 md:pt-14"
    >
      {/* Headline — staggered lines slide in */}
      <h1 className="font-display text-[clamp(3rem,11.5vw,11rem)] uppercase leading-[0.92] tracking-[-0.03em]">
        {titleLines.map((line) => (
          <motion.span
            key={line.text}
            className={`block ${line.indent}`}
            initial={{ x: line.x, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 14,
              delay: line.delay,
            }}
          >
            {line.mark ? (
              <Highlight
                data-perch="hero"
                delay={0.7}
                className="inline-block px-[0.08em] pt-[0.04em] leading-[0.84]"
              >
                {line.text}
              </Highlight>
            ) : (
              line.text
            )}
          </motion.span>
        ))}
      </h1>

      {/* Bottom row */}
      <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-3">
        <motion.div
          className="flex flex-col gap-6"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.5 }}
        >
          <p className="max-w-xs text-lg leading-relaxed">
            Software engineer from Indonesia, building interfaces where logic
            and art meet.
          </p>
          <div className="flex gap-3">
            {socials.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ y: 60, opacity: 0, rotate: -15 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 12,
                  delay: 0.55 + i * 0.1,
                }}
                whileHover={{ scale: 1.15, rotate: 10 }}
              >
                <Social
                  icon={s.icon}
                  color={isDarkMode ? "white" : "black"}
                  onClick={() => window.open(s.url, "_blank")}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Profile photo with the accent glow behind it */}
        <motion.figure
          className="relative mx-auto w-full max-w-[300px]"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.4 }}
          onMouseMove={handlePhotoMove}
          onMouseLeave={handlePhotoLeave}
        >
          <div
            aria-hidden
            className="absolute -inset-16 top-10 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,225,77,0.8)_0%,rgba(255,225,77,0)_65%)]"
          />
          <motion.div
            style={{ x: springX, y: springY }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Image
              src={photoProfile}
              alt="Jaffar Jatmiko Jati"
              width={600}
              height={750}
              priority
              className="aspect-[4/5] w-full border-2 border-ink object-cover"
            />
          </motion.div>
          <figcaption className="mt-3 font-mono text-xs text-muted">
            fig. 01 — jaffar, somewhere green
          </figcaption>
        </motion.figure>

        <motion.div
          className="flex md:justify-end"
          initial={{ y: 80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.7 }}
        >
          <a
            href="#about"
            className="group flex items-center gap-4 bg-ink px-6 py-4 font-semibold text-paper shadow-[6px_6px_0_#ffe14d] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            let&apos;s start the journey
            <ArrowRightIcon className="h-5 w-5 text-accent transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
