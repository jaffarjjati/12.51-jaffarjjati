"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Highlight from "@/components/common/highlight";

const titleChars = "About".split("");

const facts = [
  ["name", "Jaffar Jatmiko Jati"],
  ["goes by", "jaffar"],
  ["based in", "Indonesia"],
  ["role", "Software engineer"],
  ["focus", "Interaction, motion, UI"],
  ["offline", "Music, film, gaming, poetry"],
];

// Accent marks the motion/3D tools: the part of the craft this site shows off.
const tools = [
  ["Next.js", false],
  ["React", false],
  ["TypeScript", false],
  ["Tailwind", false],
  ["Framer Motion", true],
  ["Three.js", true],
] as const;

const columns = [
  {
    label: "the work",
    text: "I'm a software engineer based in Indonesia, passionate about tech and the creative universe. I love building intuitive interactions, playing with animation, and shipping interfaces that feel fluid.",
  },
  {
    label: "the person",
    text: "An introvert who loves creativity. I adore melancholic things, but also love being active and collaborative; creativity lives in isolation as much as it does in shared experience.",
  },
];

const About = () => {
  const { ref: titleRef, inView: titleInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  const { ref: bodyRef, inView: bodyInView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section
      id="about"
      className="flex flex-col gap-16 border-t border-line py-24"
    >
      <div ref={titleRef} className="flex flex-col gap-3">
        <span className="font-mono text-sm text-muted">[ 01 ] about</span>
        {/* Title — each character drops in */}
        <h2 className="flex font-display text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.92] tracking-[-0.03em]">
          {titleChars.map((char, i) => (
            <motion.span
              key={i}
              data-perch={i === titleChars.length - 1 ? "about" : undefined}
              className="inline-block"
              initial={{ y: -120, opacity: 0, rotate: -20 }}
              animate={
                titleInView
                  ? { y: 0, opacity: 1, rotate: 0 }
                  : { y: -120, opacity: 0, rotate: -20 }
              }
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 12,
                delay: i * 0.07,
              }}
            >
              {char}
            </motion.span>
          ))}
        </h2>
      </div>

      <div
        ref={bodyRef}
        className="grid grid-cols-1 gap-12 lg:grid-cols-[380px_1fr] lg:gap-24"
      >
        {/* Fact sheet — rows slide in one by one */}
        <dl className="border-t border-ink">
          {facts.map(([k, v], i) => (
            <motion.div
              key={k}
              className="flex items-center justify-between gap-4 border-b border-ink py-3.5"
              initial={{ x: -40, opacity: 0 }}
              animate={bodyInView ? { x: 0, opacity: 1 } : { x: -40, opacity: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <dt className="font-mono text-xs text-muted">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </motion.div>
          ))}
        </dl>

        <div className="flex flex-col gap-10">
          <motion.p
            className="font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.15] tracking-[-0.01em]"
            initial={{ y: 30, opacity: 0 }}
            animate={bodyInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 14 }}
          >
            To me, frontend is the{" "}
            <Highlight delay={0.4} className="px-2">
              mix of logic and art
            </Highlight>{" "}
            — <span className="text-muted">where code meets design.</span>
          </motion.p>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
            {columns.map((c, i) => (
              <motion.div
                key={c.label}
                className="flex flex-col gap-3"
                initial={{ x: 60, opacity: 0 }}
                animate={bodyInView ? { x: 0, opacity: 1 } : { x: 60, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 60,
                  damping: 14,
                  delay: 0.15 + i * 0.1,
                }}
              >
                <span className="font-mono text-sm font-semibold">→ {c.label}</span>
                <p className="leading-relaxed text-ink/80">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbox strip */}
      <div className="flex flex-col gap-4 border-y-2 border-ink py-5 md:flex-row md:items-center md:gap-8">
        <span className="font-mono text-sm text-muted">toolbox /</span>
        <ul className="flex flex-1 flex-wrap justify-between gap-x-8 gap-y-3">
          {tools.map(([name, accent]) => (
            <li key={name} className="flex items-center gap-2 font-display text-xl">
              <span
                aria-hidden
                className={`h-2 w-2 border border-ink ${accent ? "bg-accent" : "bg-ink"}`}
              />
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default About;
