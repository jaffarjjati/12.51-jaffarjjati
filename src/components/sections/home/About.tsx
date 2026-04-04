"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const sentence = `hi, my name is jaffar jatmiko jati, but you can call me jaffar. i'm an introvert who loves creativity—whether through music, film, gaming,
or poetry. i adore melancholic things but also love being active and collaborative, finding that creativity exists in isolation as much as it does in shared experience.`;
const words = sentence.split(" ");

const titleChars = "About".split("");

const About = () => {
  const { ref: wordRef, inView: wordInView } = useInView({
    threshold: 0.3,
    triggerOnce: false,
  });

  const { ref: rightRef, inView: rightInView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
  });

  const { ref: titleRef, inView: titleInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <div className="py-12 px-4 overflow-hidden" id="about">
      {/* Title — each character drops in */}
      <div ref={titleRef} className="flex">
        {titleChars.map((char, i) => (
          <motion.span
            key={i}
            className="text-[3rem] sm:text-[6rem] lg:text-[8rem] font-bold font-lauren-thompson uppercase mb-4 inline-block"
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
      </div>

      <div>
        {/* "Profile" subtitle slides in from left */}
        <motion.h2
          className="text-[1rem] sm:text-[2rem] lg:text-[4rem] font-bold font-lauren-thompson uppercase"
          initial={{ x: -80, opacity: 0 }}
          animate={titleInView ? { x: 0, opacity: 1 } : { x: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.45 }}
        >
          Profile
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Word-by-word intro */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-semibold">intro</h3>
            <p ref={wordRef}>
              {words.map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    wordInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{
                    delay: wordInView ? index * 0.04 : 0,
                    duration: wordInView ? 0.4 : 0,
                  }}
                  style={{ display: "inline-block", marginRight: "4px" }}
                >
                  {word}
                </motion.span>
              ))}
            </p>
          </div>

          {/* Right paragraph — slides in from right on scroll */}
          <motion.div
            ref={rightRef}
            className="md:col-start-3 md:col-span-2"
            initial={{ x: 100, opacity: 0 }}
            animate={
              rightInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }
            }
            transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.1 }}
          >
            <p>
              I&apos;m a software engineer based in Indonesia. I love creating
              things, and I&apos;m very passionate about tech/programming and
              the creative universe. I&apos;m especially interested in frontend
              development, as it allows me to do what I love – which is code as
              well as design.
              <br />
              <br />I enjoy creating intuitive user interactions, playing around
              with animations, and building interfaces that are interactive and
              fluid. To me, frontend development is the ideal mixture of logic
              and art, where technicality and creativity unite to form something
              practical.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
