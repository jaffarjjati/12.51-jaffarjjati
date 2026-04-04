"use client";

import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { motion, useMotionValue, useSpring } from "framer-motion";

import Button from "@/components/common/button";
import Social from "@/components/common/social";
import LinkedInIcon from "@/components/icons/linkedin";
import GithubIcon from "@/components/icons/github";
import InstagramIcon from "@/components/icons/instagram";
import photoProfile from "@/assets/images/1000067811.jpg";

const titleLines = [
  {
    text: "Based",
    align: "justify-start pl-[4rem]",
    x: -300,
    delay: 0,
    mb: "mb-[-2rem] sm:mb-[-6rem] sm:mt-[-4rem]",
  },
  {
    text: "Software",
    align: "justify-end",
    x: 300,
    delay: 0.15,
    mb: "mb-[-2rem] sm:mb-[-6rem]",
  },
  { text: "Engineer", align: "justify-start", x: -300, delay: 0.3, mb: "" },
];

const socials = [
  { icon: LinkedInIcon, url: "https://www.linkedin.com/in/jaffarjjati" },
  { icon: GithubIcon, url: "https://github.com/jaffarjjati" },
  { icon: InstagramIcon, url: "https://instagram.com/jaffarjjati" },
];

const Hero = () => {
  const { isDarkMode } = useTheme();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 15 });

  const handleSocialClick = (url: string) => window.open(url, "_blank");

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
    <div className="px-4 md:px-8 overflow-hidden">
      {/* Title lines */}
      {titleLines.map((line) => (
        <motion.div
          key={line.text}
          className={`flex ${line.align}`}
          initial={{ x: line.x, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 60,
            damping: 14,
            delay: line.delay,
          }}
        >
          <h1
            className={`text-[3.5rem] sm:text-[8rem] lg:text-[11rem] font-bold font-lauren-thompson uppercase ${line.mb}`}
          >
            {line.text}
          </h1>
        </motion.div>
      ))}

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Socials */}
        <div className="md:col-span-1 flex gap-4 items-baseline justify-center md:justify-start p-2">
          {socials.map((s, i) => (
            <motion.div
              key={i}
              initial={{ y: 60, opacity: 0, rotate: -15 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 12,
                delay: 0.55 + i * 0.1,
              }}
              whileHover={{ scale: 1.3, rotate: 10 }}
            >
              <Social
                iconCustom={s.icon}
                size="sm"
                color={isDarkMode ? "white" : "black"}
                onClick={() => handleSocialClick(s.url)}
              />
            </motion.div>
          ))}
        </div>

        {/* Profile photo */}
        <motion.div
          className="md:col-span-1 p-2"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 14,
            delay: 0.4,
          }}
          onMouseMove={handlePhotoMove}
          onMouseLeave={handlePhotoLeave}
        >
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
              width={800}
              height={800}
              className="w-full h-auto pt-4"
            />
          </motion.div>
        </motion.div>

        {/* Button */}
        <motion.div
          className="md:col-span-1 flex justify-center md:justify-end p-2"
          initial={{ y: 80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 12,
            delay: 0.7,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div>
            <Button
              color={isDarkMode ? "white" : "black"}
              onClick={() => console.log("Icon Only")}
            >
              let&apos;s the journey start
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
