"use client";

import type { HTMLAttributes } from "react";
import { useInView } from "react-intersection-observer";

/**
 * Yellow highlighter that sweeps in left→right the first time it scrolls into
 * view (styles: `.hl` in globals.css). Across a line break the sweep continues
 * onto the next line, like a real marker.
 */
const Highlight = ({
  delay = 0,
  className = "",
  style,
  ...rest
}: HTMLAttributes<HTMLElement> & { delay?: number }) => {
  const { ref, inView } = useInView({ threshold: 0.6, triggerOnce: true });

  return (
    <mark
      ref={ref}
      data-on={inView || undefined}
      className={`hl ${className}`}
      // background, then color once the sweep has passed (0.8s = sweep time in .hl)
      style={{ ...style, transitionDelay: `${delay}s, ${delay + 0.8}s` }}
      {...rest}
    />
  );
};

export default Highlight;
