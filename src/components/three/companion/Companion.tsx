"use client";

// One stickman ("jaffar") who hops from section to section and whose mood
// follows the visitor's local time. Reuses the V2 rig + poses.
//
// The canvas is a transparent overlay in screen space: 1 world unit = 1 CSS px
// (y flipped), so perches come straight from getBoundingClientRect() and he
// rides along with the element while you scroll.
//
// Preview a time of day with ?hour=21 (morning 5–11, day 11–17, evening 17–22, night).

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";
import {
  animateActor,
  applyJump,
  buildLaptop,
  jumpState,
  type Kind,
} from "../stickman-v2/actors";
import {
  BONE,
  STROKE,
  applyPose,
  buildRig,
  disposeTree,
  makePose,
  resetPose,
} from "../stickman-v2/rig";

type Mood = "morning" | "day" | "evening" | "night";

const moodAt = (h: number): Mood =>
  h >= 5 && h < 11
    ? "morning"
    : h >= 11 && h < 17
      ? "day"
      : h >= 17 && h < 22
        ? "evening"
        : "night";

const MOOD_LINE: Record<Mood, string> = {
  morning: "morning, warming up",
  day: "afternoon, deep in code",
  evening: "evening, winding down",
  night: "past midnight, asleep (mostly)",
};

/** Accent glow strength behind him; at night it reads as a desk lamp. */
const GLOW: Record<Mood, number> = {
  morning: 0.35,
  day: 0.25,
  evening: 0.55,
  night: 0.85,
};

interface Perch {
  /** id of the section that activates this perch. */
  section: string;
  /** Element he stands on; sections mark it with data-perch. */
  selector: string;
  /** 0…1 along the element's width. */
  ax: number;
  /**
   * Where the visible top edge sits inside the box, 0…1 of its height.
   * Display text has empty line-height above the caps; re-tune if the font changes.
   */
  topFrac?: number;
  face: 1 | -1;
  /** Draw him in light ink (on the always-dark footer). */
  lightInk?: boolean;
  kinds: Record<Mood, Kind>;
}

const PERCHES: Perch[] = [
  {
    // on the yellow "SOFTWARE" block
    section: "home",
    selector: "[data-perch=hero]",
    ax: 0.93,
    face: -1,
    kinds: { morning: "waving", day: "hero", evening: "hero", night: "thinking" },
  },
  {
    // on the "T" of "ABOUT", legs over the edge
    section: "about",
    selector: "[data-perch=about]",
    ax: 0.86, // hips near the right end, so the shins hang past the crossbar
    topFrac: 0.07,
    face: 1,
    kinds: { morning: "thinking", day: "sitting", evening: "sitting", night: "sitting" },
  },
  {
    // on the project card's top border, in the gap between title and pager
    section: "work",
    selector: "[data-perch=work]",
    ax: 0.74,
    face: -1,
    kinds: { morning: "jumping", day: "running", evening: "thinking", night: "thinking" },
  },
  {
    section: "contact",
    selector: "[data-perch=contact]",
    ax: 0.9,
    topFrac: 0.1,
    face: 1,
    lightInk: true,
    kinds: { morning: "waving", day: "waving", evening: "sitting", night: "sleeping" },
  },
];

const STROKE_PX = 2.5;
const HOP_S = 1.1;
const INK = { light: 0x111111, dark: 0xf1f1f1 };
const KEYS = [
  "lean",
  "head",
  "armL",
  "elbowL",
  "armR",
  "elbowR",
  "hipL",
  "kneeL",
  "hipR",
  "kneeR",
  "lift",
  "breath",
] as const;

const clamp = (x: number, a: number, b: number) => Math.min(Math.max(x, a), b);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** CSS px per rig unit: ~90px tall on desktop, ~65px on phones. */
const scaleFor = (w: number) => (w < 768 ? 40 : 55);

function perchPoint(p: Perch) {
  const el = document.querySelector(p.selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + p.ax * r.width, y: r.top + (p.topFrac ?? 0) * r.height };
}

/** Root offset (rig units) and roll: sitting hangs its shins over the edge, sleeping lies on it. */
const rootFor = (k: Kind) =>
  k === "sitting"
    ? { y: -BONE.shin, rot: 0 }
    : k === "sleeping"
      ? { y: BONE.headR + BONE.headTube, rot: -Math.PI / 2 } // head ring rests on the edge
      : { y: 0, rot: 0 };

export default function Companion() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();
  const darkRef = useRef(isDarkMode);

  const [clock, setClock] = useState<{ hour: number; preview: boolean } | null>(
    null
  );
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("hour");
    const q = raw === null ? NaN : Number(raw);
    const fixed = Number.isInteger(q) && q >= 0 && q < 24;
    const tick = () =>
      setClock({ hour: fixed ? q : new Date().getHours(), preview: fixed });
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  const mood = moodAt(clock?.hour ?? 12);
  const moodRef = useRef(mood);

  useEffect(() => {
    moodRef.current = mood;
    darkRef.current = isDarkMode;
  }, [mood, isDarkMode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let S = scaleFor(W);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, W, 0, -H, -100, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    // Flat ink, like a pen line; no lights needed.
    const mat = new THREE.MeshBasicMaterial({ color: INK.light });
    const rig = buildRig(mat, STROKE_PX / 2 / (STROKE.limb * S));
    const laptop = buildLaptop(mat, rig);
    rig.root.add(laptop);
    scene.add(rig.root);

    // Accent glow (#FFE14D) behind him.
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,225,77,1)");
    grd.addColorStop(1, "rgba(255,225,77,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(c);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, depthWrite: false })
    );
    scene.add(glow);

    const shown = makePose();
    const target = makePose();
    const pos = new THREE.Vector2();
    let offY = 0;
    let rot = 0;
    let face = 1;
    let active = -1;
    let hop: { from: THREE.Vector2; t0: number } | null = null;

    let mouseX = W / 2;
    const onPointer = (e: PointerEvent) => {
      mouseX = e.clientX;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      S = scaleFor(W);
      camera.right = W;
      camera.bottom = -H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const timer = new THREE.Timer();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      timer.update();
      const t = timer.getElapsed();
      const dt = Math.min(timer.getDelta(), 0.05);
      const still = motionQuery.matches;
      const m = moodRef.current;

      // Active perch = last section whose top has passed 55% of the viewport,
      // or the last one once the page is scrolled to the bottom (the footer is
      // too short to ever reach that line).
      let idx = 0;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) idx = PERCHES.length - 1;
      else
        PERCHES.forEach((p, i) => {
          const el = document.getElementById(p.section);
          if (el && el.getBoundingClientRect().top < H * 0.55) idx = i;
        });
      const perch = PERCHES[idx];
      const pt = perchPoint(perch);
      rig.root.visible = glow.visible = !!pt;
      if (!pt) {
        renderer.render(scene, camera);
        return;
      }
      if (idx !== active) {
        if (active >= 0 && !still) hop = { from: pos.clone(), t0: t };
        else pos.set(pt.x, pt.y);
        active = idx;
      }

      const kind = perch.kinds[m];
      const u = hop ? (t - hop.t0) / HOP_S : 1;
      if (hop && u < 1) {
        // Crouch, leap along an arc to the new perch, land.
        const s = jumpState(u);
        resetPose(target);
        applyJump(target, s);
        target.lift = 0;
        const arc = Math.max(
          60,
          Math.hypot(pt.x - hop.from.x, pt.y - hop.from.y) * 0.3
        );
        pos.set(
          lerp(hop.from.x, pt.x, s.a),
          lerp(hop.from.y, pt.y, s.a) - arc * 4 * s.a * (1 - s.a)
        );
        if (Math.abs(pt.x - hop.from.x) > 4) face = Math.sign(pt.x - hop.from.x);
      } else {
        hop = null;
        pos.set(pt.x, pt.y);
        face = perch.face;
        const look = clamp((mouseX - pt.x) / 300, -1, 1) * face;
        animateActor(kind, target, still ? 0 : t, look);
      }

      // Ease every joint toward the target, so pose and mood changes blend.
      const k = still ? 1 : 1 - Math.exp(-dt * 12);
      for (const key of KEYS) shown[key] += (target[key] - shown[key]) * k;
      shown.ground = target.ground;
      applyPose(rig, shown);

      const r = hop ? { y: 0, rot: 0 } : rootFor(kind);
      offY += (r.y - offY) * k;
      rot += (r.rot - rot) * k;
      laptop.visible = !hop && kind === "sitting" && m === "day";
      mat.color.set(perch.lightInk || darkRef.current ? INK.dark : INK.light);

      rig.root.position.set(pos.x, -pos.y + offY * S, 0);
      rig.root.scale.set(face * S, S, S);
      rig.root.rotation.z = rot;
      // Centre the glow on the chest; lying down that's beside the hips.
      const lying = -rot / (Math.PI / 2);
      glow.scale.set(S * 3, S * 3, 1);
      glow.position.set(
        pos.x + face * lying * S * 0.5,
        -pos.y + S * (0.8 - 0.5 * lying),
        -10
      );
      glow.material.opacity = GLOW[m];
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      disposeTree(rig.root);
      glowTex.dispose();
      glow.material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <div
        ref={mountRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40"
      />
      {clock && (
        <p className="fixed right-3 bottom-3 z-40 hidden border border-line bg-paper/90 px-2 py-1 font-mono text-[11px] text-muted sm:block">
          {clock.preview
            ? `${String(clock.hour).padStart(2, "0")}:00 preview · `
            : ""}
          jaffar: {MOOD_LINE[mood]}
        </p>
      )}
    </>
  );
}
