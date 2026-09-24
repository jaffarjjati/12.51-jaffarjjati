"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Highlight from "@/components/common/highlight";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

interface Project {
  name: string;
  kind: string;
  year: string;
  summary: string;
  stack: string[];
  link: string;
  images: { src: string; alt: string; description: string }[];
  story: ReactNode;
}

const projects: Project[] = [
  {
    name: "Project-06sdd",
    kind: "personal project",
    year: "2025",
    summary:
      "A library management system: an API for books, users and borrowing records, grown into a real app I keep improving.",
    stack: ["Python", "Django", "REST API"],
    link: "https://project-06sdd.vercel.app/",
    images: [
      {
        src: "/images/06sdd 2025-03-16 231058.png",
        alt: "Project-06sdd home page",
        description: "Home page of Project-06sdd.",
      },
      {
        src: "/images/06sdd 2025-03-16 231642.png",
        alt: "Project-06sdd book collections page",
        description: "Book collections page of Project-06sdd.",
      },
    ],
    story: (
      <>
        i started building a library management system as a personal project
        while learning backend development with python and django. at first, my
        focus was just on creating an api to manage books, users, and borrowing
        records. but after finishing the api, i wanted to take it further and
        see it in action with a real use case.
        <br />
        <br />i built it with that in mind, and i want this to be a project that
        i keep improving over time. there&apos;s always something to refine,
        add, or optimize, and i see it as a way to continuously learn and apply
        new things as i go.
      </>
    ),
  },
  {
    name: "PT Aino Indonesia",
    kind: "work, acasia team",
    year: "2023",
    summary:
      "Acasia manages routes, stops, ticketing, transactions and settlements for public transport, parking and tourism.",
    stack: ["Go", "Echo", "PostgreSQL", "MongoDB", "Vue.js"],
    link: "https://www.ainosi.co.id",
    images: [
      {
        src: "/images/aino-1.jpg",
        alt: "Aino Indonesia Home page",
        description: "Home page of Aino Indonesia.",
      },
      {
        src: "/images/aino-2.jpg",
        alt: "Aino Indonesia update teman bus impact.",
        description: "Aino Indonesia update teman bus impact.",
      },
      {
        src: "/images/WhatsApp Image 2025-03-25 at 10.30.51 PM.jpeg",
        alt: "Acasia team full squad 7 September 2023.",
        description: "Acasia team full squad 7 September 2023.",
      },
      {
        src: "/images/WhatsApp Image 2025-03-25 at 10.30.52 PM.jpeg",
        alt: "Acasia team lembur hari ke..",
        description: "Acasia team lembur hari ke..",
      },
    ],
    story: (
      <>
        PT Aino Indonesia is a company specializing in public transportation and
        its surrounding ecosystem, including parking and tourism/ticketing. At
        Aino, I am part of the Acasia team. Acasia is a product designed to
        manage routes, stops, ticketing, transactions, and settlements.
        <br />
        <br />
        In Acasia, we use Golang with the Echo framework for the backend,
        PostgreSQL and MongoDB for the databases, and Vue.js for frontend
        development.
      </>
    ),
  },
];

// Chars are grouped by word so a narrow screen wraps between words, never
// mid-word. `i` is the running index (spaces included) that drives the stagger.
const titleWords = (() => {
  let n = 0;
  return "Latest Work".split(" ").map((word) => {
    const chars = word.split("").map((char) => ({ char, i: n++ }));
    n++; // the space
    return chars;
  });
})();

// Variants read the direction via `custom`, so the leaving card uses the
// latest direction too (a plain exit prop would keep its stale value).
const slide = {
  enter: (d: number) => ({ x: d * 80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d * -80, opacity: 0 }),
};

const pad = (n: number) => String(n).padStart(2, "0");
const squareBtn =
  "flex h-14 w-14 items-center justify-center border-2 border-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const LatestWork = () => {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const p = projects[index];

  const { ref: titleRef, inView: titleInView } = useInView({
    threshold: 0.4,
    triggerOnce: true,
  });

  const go = (step: number) => {
    setDir(step);
    setExpanded(false);
    setIndex((i) => (i + step + projects.length) % projects.length);
  };

  return (
    <section id="work" className="flex flex-col gap-10 border-t border-line py-24">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div ref={titleRef} className="flex flex-col gap-3">
          <span className="font-mono text-sm text-muted">
            [ 02 ] selected projects
          </span>
          {/* Title — characters wave in */}
          <h2 className="flex flex-wrap font-display text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.92] tracking-[-0.03em]">
            {titleWords.map((chars, wi) => (
              <span
                key={wi}
                className={`inline-flex whitespace-nowrap ${wi < titleWords.length - 1 ? "mr-[0.25em]" : ""}`}
              >
                {chars.map(({ char, i }) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ y: 100, opacity: 0, skewX: 20 }}
                    animate={
                      titleInView
                        ? { y: 0, opacity: 1, skewX: 0 }
                        : { y: 100, opacity: 0, skewX: 20 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 90,
                      damping: 12,
                      delay: i * 0.05,
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <p className="mr-2 flex items-baseline gap-1" aria-live="polite">
            <span className="font-display text-3xl">{pad(index + 1)}</span>
            <span className="font-mono text-muted">/ {pad(projects.length)}</span>
          </p>
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => go(-1)}
            className={`${squareBtn} hover:bg-accent hover:text-black`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => go(1)}
            className={`${squareBtn} bg-ink text-accent hover:bg-accent hover:text-black dark:text-black`}
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.article
          key={p.name}
          data-perch="work"
          className="flex flex-col border-2 border-ink bg-panel shadow-[10px_10px_0_var(--ink)] md:shadow-[14px_14px_0_var(--ink)] lg:flex-row"
          custom={dir}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 90, damping: 16 }}
        >
          <div className="relative aspect-[16/10] border-b-2 border-ink bg-[#ededea] lg:aspect-auto lg:min-h-[520px] lg:flex-1 lg:border-r-2 lg:border-b-0 dark:bg-[#1c1c1d]">
            <Image
              src={p.images[0].src}
              alt={p.images[0].alt}
              fill
              sizes="(min-width: 1024px) 880px, 100vw"
              className="object-contain p-4 md:p-8"
            />
          </div>

          <div className="flex flex-col justify-between gap-10 p-8 lg:w-[420px] lg:p-10">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                {/* Remounts with the card, so it sweeps again on every project */}
                <Highlight
                  delay={0.25}
                  className="px-2.5 py-1 font-mono text-sm font-semibold"
                >
                  {pad(index + 1)} — {p.kind}
                </Highlight>
                <span className="font-mono text-sm text-muted">{p.year}</span>
              </div>
              <h3 className="font-display text-4xl leading-none tracking-tight">
                {p.name}
              </h3>
              <p className="leading-relaxed text-ink/75">{p.summary}</p>
              <ul className="flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <li key={s} className="border border-ink px-2.5 py-1 font-mono text-xs">
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <a
                href={p.link}
                target="_blank"
                rel="noreferrer"
                className="flex h-14 flex-1 items-center justify-between bg-ink px-5 font-semibold text-paper hover:bg-accent hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                view live
                <ArrowUpRightIcon className="h-5 w-5" />
              </a>
              <button
                type="button"
                aria-expanded={expanded}
                aria-label={expanded ? "Hide details" : "Show details"}
                onClick={() => setExpanded((e) => !e)}
                className={`${squareBtn} hover:bg-accent hover:text-black`}
              >
                {expanded ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>

      {/* Details: the full story and every image */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-[1fr_2fr]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <p className="leading-relaxed">{p.story}</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {p.images.map((img) => (
                <figure key={img.src} className="flex flex-col gap-2">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={800}
                    height={500}
                    className="h-auto w-full border border-ink"
                  />
                  <figcaption className="font-mono text-xs text-muted">
                    ( {img.description} )
                  </figcaption>
                </figure>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LatestWork;
