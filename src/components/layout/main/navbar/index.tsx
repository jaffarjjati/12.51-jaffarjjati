"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const menuList = ["home", "about", "work", "contact"];

// Highlights the section in the middle of the viewport (home page only; on
// other pages none of the ids exist, so nothing is highlighted).
const Navbar = ({
  vertical = false,
  onNavigate,
}: {
  vertical?: boolean;
  onNavigate?: () => void;
}) => {
  const [active, setActive] = useState("");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    menuList.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="Main">
      <ul className={`flex gap-2 font-mono text-sm ${vertical ? "flex-col" : ""}`}>
        {menuList.map((id) => (
          <li key={id} className="relative">
            {/* One yellow block that slides to whichever section is active */}
            {active === id && (
              <motion.span
                layoutId={vertical ? "nav-hl-mobile" : "nav-hl"}
                aria-hidden
                className="absolute inset-0 bg-accent"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Link
              href={`/#${id}`}
              onClick={onNavigate}
              aria-current={active === id ? "location" : undefined}
              className={`relative block px-3 py-1.5 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                active === id ? "text-black" : "hover:bg-accent/50"
              }`}
            >
              {id}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
