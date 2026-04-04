"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ── Stickman definition — each limb is a curve (array of control points) ──────
interface StickmanDef {
  head: THREE.Vector3;
  body: THREE.Vector3[]; // neck → hip
  larm: THREE.Vector3[]; // shoulder → hand
  rarm: THREE.Vector3[];
  lleg: THREE.Vector3[]; // hip → foot
  rleg: THREE.Vector3[];
}

// Shared material per stickman so we can fade it
function makeMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 1,
    roughness: 0.35,
    metalness: 0.0,
  });
}

const R_HEAD = 0.19;
const R_RING = 0.055;
const R_BODY = 0.054;
const R_LIMB = 0.05;

function buildStickman(def: StickmanDef, boldness = 1) {
  const mat = makeMat();
  const g = new THREE.Group();

  function tube(pts: THREE.Vector3[], r: number) {
    if (pts.length < 2) return;
    const curve = new THREE.CatmullRomCurve3(pts);
    g.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, 22, r * boldness, 18, false),
        mat
      )
    );
  }

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(R_HEAD * boldness, R_RING * boldness, 18, 52),
    mat
  );
  ring.position.copy(def.head);
  g.add(ring);

  tube(def.body, R_BODY);
  tube(def.larm, R_LIMB);
  tube(def.rarm, R_LIMB);
  tube(def.lleg, R_LIMB);
  tube(def.rleg, R_LIMB);

  return { group: g, mat };
}

// ── Poses ─────────────────────────────────────────────────────────────────────
type PoseName =
  | "standing"
  | "waving"
  | "running"
  | "thinking"
  | "jumping"
  | "sitting"
  | "sleeping";

const POSES: Record<PoseName, () => StickmanDef> = {
  standing: () => ({
    head: v(0.0, 0.84, 0.0),
    body: [v(0.0, 0.6, 0.0), v(0.0, -0.04, 0.0)],
    larm: [v(0.0, 0.52, 0.0), v(-0.2, 0.44, 0.0), v(-0.28, 0.12, 0.0)],
    rarm: [v(0.0, 0.52, 0.0), v(0.2, 0.44, 0.0), v(0.28, 0.12, 0.0)],
    lleg: [v(0.0, 0.04, 0.0), v(-0.12, -0.12, 0.0), v(-0.2, -0.44, 0.0)],
    rleg: [v(0.0, 0.04, 0.0), v(0.12, -0.12, 0.0), v(0.2, -0.44, 0.0)],
  }),
  waving: () => ({
    head: v(0.03, 0.76, 0),
    body: [v(0.02, 0.55, 0), v(0, 0.18, 0)],
    larm: [v(0, 0.43, 0), v(-0.06, 0.64, 0.04), v(-0.12, 0.92, 0.06)],
    rarm: [v(0, 0.43, 0), v(0.2, 0.38, 0), v(0.42, 0.3, 0)],
    lleg: [v(0, 0.18, 0), v(-0.12, 0.0, 0), v(-0.2, -0.26, 0)],
    rleg: [v(0, 0.18, 0), v(0.12, 0.0, 0), v(0.2, -0.26, 0)],
  }),
  running: () => ({
    head: v(0.16, 0.95, 0.0),
    body: [v(0.09, 0.74, 0.0), v(-0.08, 0.18, 0.0)],
    larm: [v(0.03, 0.6, 0.0), v(-0.1, 0.65, 0.08), v(-0.25, 0.4, 0.14)],
    rarm: [v(0.03, 0.6, 0.0), v(0.19, 0.3, -0.08), v(0.32, 0.44, -0.14)],
    lleg: [v(-0.09, 0.18, 0.0), v(-0.19, 0.08, 0.16), v(-0.48, -0.02, 0.32)],
    rleg: [v(-0.07, 0.18, 0.0), v(0.1, -0.02, -0.12), v(-0.08, -0.22, -0.26)],
  }),
  thinking: () => ({
    head: v(0.06, 0.75, 0),
    body: [v(0.04, 0.54, 0), v(0, 0.18, 0)],
    larm: [v(0, 0.43, 0), v(0.08, 0.54, 0.06), v(0.18, 0.65, 0.1)],
    rarm: [v(0, 0.43, 0), v(-0.15, 0.37, 0), v(-0.34, 0.3, 0)],
    lleg: [v(0, 0.18, 0), v(-0.08, 0.0, 0), v(-0.14, -0.26, 0)],
    rleg: [v(0, 0.18, 0), v(0.1, 0.0, 0), v(0.18, -0.26, 0)],
  }),
  jumping: () => ({
    head: v(0, 0.9, 0),
    body: [v(0, 0.7, 0), v(0, 0.34, 0)],
    larm: [v(0, 0.58, 0), v(-0.26, 0.74, 0), v(-0.5, 0.9, 0)],
    rarm: [v(0, 0.58, 0), v(0.26, 0.74, 0), v(0.5, 0.9, 0)],
    lleg: [v(0, 0.34, 0), v(-0.22, 0.16, 0), v(-0.4, 0.02, 0)],
    rleg: [v(0, 0.34, 0), v(0.22, 0.16, 0), v(0.4, 0.02, 0)],
  }),
  sitting: () => ({
    head: v(0.0, 0.99, 0.0),
    body: [v(0.0, 0.8, 0.0), v(0.0, 0.18, 0.0)],
    larm: [v(0.0, 0.68, 0.0), v(-0.12, 0.52, 0.08), v(-0.33, 0.45, 0.16)],
    rarm: [v(0.0, 0.68, 0.0), v(0.24, 0.33, 0.08), v(-0.08, 0.45, 0.16)],
    lleg: [
      v(0.0, 0.18, 0.0),
      v(-0.16, 0.18, 0.22),
      v(-0.18, 0.18, 0.38),
      v(-0.18, -0.2, 0.38),
    ],
    rleg: [
      v(0.0, 0.18, 0.0),
      v(0.16, 0.18, 0.22),
      v(0.18, 0.18, 0.38),
      v(0.18, -0.2, 0.38),
    ],
  }),
  sleeping: () => ({
    head: v(0, 0.75, 0),
    body: [v(0, 0.54, 0), v(0, 0.18, 0)],
    larm: [v(0, 0.43, 0), v(-0.18, 0.36, 0.06), v(-0.36, 0.28, 0.1)],
    rarm: [v(0, 0.43, 0), v(0.18, 0.36, 0.06), v(0.36, 0.28, 0.1)],
    lleg: [v(0, 0.18, 0), v(-0.1, 0.0, 0.04), v(-0.16, -0.26, 0.06)],
    rleg: [v(0, 0.18, 0), v(0.1, 0.0, 0.04), v(0.16, -0.26, 0.06)],
  }),
};

// ── Scene layout ──────────────────────────────────────────────────────────────
interface StickmanConfig {
  x: number;
  y: number;
  z: number;
  rotY: number;
  pose: PoseName;
  disappearAt: number;
  boldness?: number;
}

const CONFIG: StickmanConfig[] = [
  { x: -20, y: 0, z: -12, rotY: 0.6, pose: "waving", disappearAt: 200 },
  { x: 33.2, y: 1, z: -10, rotY: -0.5, pose: "jumping", disappearAt: 400 },
  { x: -29, y: 0, z: 0, rotY: 0.8, pose: "running", disappearAt: 600 },
  { x: 27.3, y: 0, z: 0, rotY: -0.7, pose: "thinking", disappearAt: 800 },
  {
    x: -13,
    y: 0.2,
    z: 13.5,
    rotY: 0.4,
    pose: "sitting",
    disappearAt: 1000,
    boldness: 0.9,
  },
  { x: 16, y: 0, z: 10, rotY: -0.5, pose: "sleeping", disappearAt: 1200 },
  { x: 0, y: 4.7, z: 0.5, rotY: 0, pose: "standing", disappearAt: Infinity },
];

const FADE_SPAN = 150;

// ── Pose editor types ──────────────────────────────────────────────────────────
type EV = { x: number; y: number; z: number };
interface EPose {
  head: EV;
  body: EV[];
  larm: EV[];
  rarm: EV[];
  lleg: EV[];
  rleg: EV[];
}

function defToEPose(def: StickmanDef): EPose {
  const e = (vec: THREE.Vector3): EV => ({ x: vec.x, y: vec.y, z: vec.z });
  return {
    head: e(def.head),
    body: def.body.map(e),
    larm: def.larm.map(e),
    rarm: def.rarm.map(e),
    lleg: def.lleg.map(e),
    rleg: def.rleg.map(e),
  };
}

function ePoseToDef(ep: EPose): StickmanDef {
  const t = (e: EV) => v(e.x, e.y, e.z);
  return {
    head: t(ep.head),
    body: ep.body.map(t),
    larm: ep.larm.map(t),
    rarm: ep.rarm.map(t),
    lleg: ep.lleg.map(t),
    rleg: ep.rleg.map(t),
  };
}

// ── Internal stickman ref type ────────────────────────────────────────────────
type SMRef = {
  group: THREE.Group;
  mat: THREE.MeshStandardMaterial;
  baseY: number;
  baseRotZ: number;
  threshold: number;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function StickmanScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const stickmenRef = useRef<SMRef[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const auraOverlayRef = useRef<HTMLDivElement>(null);
  const projVecRef = useRef(new THREE.Vector3());
const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [editPose, setEditPose] = useState<EPose | null>(null);
  const [editPos, setEditPos] = useState<EV>({ x: 0, y: 0, z: 0 });
  const [boldness, setBoldness] = useState(1);
  const historyRef = useRef<Array<{ pose: EPose; pos: EV; boldness: number }>>(
    []
  );
  const [canUndo, setCanUndo] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Build scene (runs once) ──────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    document.documentElement.style.setProperty(
      "background-color",
      "transparent",
      "important"
    );
    document.body.style.setProperty(
      "background-color",
      "transparent",
      "important"
    );

    const W = window.innerWidth,
      H = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    scene.fog = new THREE.FogExp2(0xf5f5f5, 0.008);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(62, W / H, 0.1, 1000);
    camera.position.set(0, 5.0, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(5, 10, 8);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xeeeeff, 0.3);
    fill.position.set(-4, -3, 4);
    scene.add(fill);

    const grid = new THREE.GridHelper(80, 50, 0xbbbbbb, 0xd0d0d0);
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    (grid.material as THREE.LineBasicMaterial).opacity = 0.45;
    grid.position.y = -0.28;
    scene.add(grid);

    stickmenRef.current = CONFIG.map((cfg) => {
      const { group, mat } = buildStickman(
        POSES[cfg.pose](),
        cfg.boldness ?? 1
      );
      group.position.set(cfg.x, cfg.y, cfg.z);
      group.rotation.y = cfg.rotY;
      if (cfg.pose === "sleeping") {
        group.rotation.z = -Math.PI / 2;
        group.position.y = 0.12;
      }
      scene.add(group);
      return {
        group,
        mat,
        baseY: group.position.y,
        baseRotZ: group.rotation.z,
        threshold: cfg.disappearAt,
      };
    });

    let raf: number;
    const timer = new THREE.Timer();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();
      const scroll = window.scrollY;

      stickmenRef.current.forEach((sm, i) => {
        const progress =
          sm.threshold === Infinity
            ? 0
            : Math.min(Math.max((scroll - sm.threshold) / FADE_SPAN, 0), 1);
        const bob = (1 - progress) * Math.sin(t * 1.5 + i * 1.1) * 0.045;
        const sway = (1 - progress) * Math.sin(t * 1.0 + i * 0.9) * 0.025;
        sm.group.position.y = sm.baseY + bob - progress * 3.5;
        sm.group.rotation.z = sm.baseRotZ + sway;
        sm.mat.opacity = 1 - progress;
        sm.group.visible = progress < 1;
      });

      // Track CSS aura overlay to standing stickman screen position
      if (auraOverlayRef.current && cameraRef.current) {
        const standCfg = CONFIG[CONFIG.length - 1];
        projVecRef.current.set(standCfg.x, standCfg.y + 0.4, standCfg.z);
        projVecRef.current.project(cameraRef.current);
        const sx = (projVecRef.current.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-projVecRef.current.y * 0.5 + 0.5) * window.innerHeight;
        auraOverlayRef.current.style.left = `${sx}px`;
        auraOverlayRef.current.style.top = `${sy}px`;
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = window.innerWidth,
        h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.documentElement.style.removeProperty("background-color");
      document.body.style.removeProperty("background-color");
      if (mount.contains(renderer.domElement))
        mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // ── Rebuild stickman when editPose changes ────────────────────────────────
  useEffect(() => {
    if (selectedIdx === null || !editPose || !sceneRef.current) return;
    const scene = sceneRef.current;
    const sm = stickmenRef.current[selectedIdx];
    if (!sm) return;

    // Dispose old geometry
    scene.remove(sm.group);
    sm.group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });

    // Rebuild with new pose
    const cfg = CONFIG[selectedIdx];
    const { group, mat } = buildStickman(ePoseToDef(editPose), boldness);
    group.position.set(editPos.x, editPos.y, editPos.z);
    group.rotation.y = cfg.rotY;
    if (cfg.pose === "sleeping") group.rotation.z = -Math.PI / 2;
    scene.add(group);

    stickmenRef.current[selectedIdx] = {
      group,
      mat,
      baseY: group.position.y,
      baseRotZ: group.rotation.z,
      threshold: cfg.disappearAt,
    };
  }, [editPose, editPos, selectedIdx, boldness]);

  // ── History helpers ───────────────────────────────────────────────────────
  const pushHistory = () => {
    if (!editPose) return;
    historyRef.current.push({ pose: editPose, pos: editPos, boldness });
    if (historyRef.current.length > 50) historyRef.current.shift();
    setCanUndo(true);
  };

  const undo = () => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    setEditPose(prev.pose);
    setEditPos(prev.pos);
    setBoldness(prev.boldness);
    setCanUndo(historyRef.current.length > 0);
  };

  // ── Pose update helpers ───────────────────────────────────────────────────
  const updateHead = (axis: keyof EV, val: number) => {
    setEditPose((prev) =>
      prev ? { ...prev, head: { ...prev.head, [axis]: val } } : prev
    );
  };

  const updateLimb = (
    limb: keyof Omit<EPose, "head">,
    ptIdx: number,
    axis: keyof EV,
    val: number
  ) => {
    setEditPose((prev) => {
      if (!prev) return prev;
      const arr = [...(prev[limb] as EV[])];
      arr[ptIdx] = { ...arr[ptIdx], [axis]: val };
      return { ...prev, [limb]: arr };
    });
  };

  const copyToClipboard = () => {
    if (!editPose || selectedIdx === null) return;
    const cfg = CONFIG[selectedIdx];
    const fmt = (e: EV) =>
      `v(${e.x.toFixed(2)}, ${e.y.toFixed(2)}, ${e.z.toFixed(2)})`;
    const poseLines = [
      `    head: ${fmt(editPose.head)},`,
      `    body: [${editPose.body.map(fmt).join(", ")}],`,
      `    larm: [${editPose.larm.map(fmt).join(", ")}],`,
      `    rarm: [${editPose.rarm.map(fmt).join(", ")}],`,
      `    lleg: [${editPose.lleg.map(fmt).join(", ")}],`,
      `    rleg: [${editPose.rleg.map(fmt).join(", ")}],`,
    ];
    const n = (v: number, d = 1) => v.toFixed(d);
    const configLine = `  { x: ${n(editPos.x)}, y: ${n(editPos.y)}, z: ${n(editPos.z)}, rotY: ${n(cfg.rotY, 2)}, pose: "${cfg.pose}", disappearAt: ${cfg.disappearAt === Infinity ? "Infinity" : cfg.disappearAt}, boldness: ${n(boldness, 2)} },`;
    const output = `// CONFIG entry:\n${configLine}\n\n// POSES["${cfg.pose}"] update:\n  ${cfg.pose}: () => ({\n${poseLines.join("\n")}\n  }),`;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes ssj-glow {
          0%,100% { opacity:.45; transform:translate(-50%,-50%) scale(1); }
          50%      { opacity:.85; transform:translate(-50%,-50%) scale(1.12); }
        }
        @keyframes ssj-ring {
          0%   { transform:translate(-50%,-50%) scale(.4); opacity:.9; }
          100% { transform:translate(-50%,-50%) scale(2.2); opacity:0; }
        }
        @keyframes ssj-bolt {
          0%,79%,100% { opacity:0; }
          80%,95%     { opacity:1; }
          87%         { opacity:.3; }
        }
      `}</style>

      <div ref={mountRef} className="fixed inset-0 -z-10 pointer-events-none" />

      {/* Super Saiyan aura overlay */}
      <div
        ref={auraOverlayRef}
        style={{ position: "fixed", width: 0, height: 0, pointerEvents: "none", zIndex: -1 }}
      >
        {/* Base golden glow */}
        <div style={{
          position: "absolute", width: 220, height: 320, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,200,0,.38) 0%, rgba(255,140,0,.14) 45%, transparent 70%)",
          animation: "ssj-glow 1.3s ease-in-out infinite",
        }} />
        {/* Expanding rings */}
        {[0, 0.7].map((delay, i) => (
          <div key={i} style={{
            position: "absolute", width: 160, height: 160, borderRadius: "50%",
            border: "2px solid rgba(255,215,0,.75)",
            animation: `ssj-ring 1.4s ease-out infinite ${delay}s`,
          }} />
        ))}
        {/* Lightning bolts */}
        {[{ r: "-18deg", tx: "-8px", ty: "-110px", delay: "0s" },
          { r: "22deg",  tx:  "14px", ty:  "-90px", delay: "0.5s" },
          { r: "-35deg", tx: "-22px", ty:  "-75px", delay: "1.1s" },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 2, height: 70,
            background: "linear-gradient(to top, transparent, rgba(255,240,80,.6), white)",
            transform: `translate(${b.tx}, ${b.ty}) rotate(${b.r})`,
            transformOrigin: "bottom center",
            animation: `ssj-bolt 2.2s ease-in-out infinite ${b.delay}`,
          }} />
        ))}
      </div>

      {/* Copy success alert */}
      {copied && (
        <div className="fixed bottom-4 right-4 z-50 w-64 transition-all">
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <AlertTitle>Copied!</AlertTitle>
            <AlertDescription>
              Pose config copied to clipboard.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Stickman selector buttons */}
      <div className="fixed top-4 right-4 z-50 flex flex-wrap justify-end gap-1.5 max-w-xs">
        {CONFIG.map((cfg, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedIdx(i);
              setEditPose(defToEPose(POSES[cfg.pose]()));
              setEditPos({ x: cfg.x, y: cfg.y, z: cfg.z });
              setBoldness(cfg.boldness ?? 1);
              historyRef.current = [];
              setCanUndo(false);
            }}
            className={`px-2.5 py-1 rounded border text-[11px] font-mono cursor-pointer transition-colors ${
              selectedIdx === i
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200"
            }`}
          >
            {cfg.pose}
          </button>
        ))}
        {selectedIdx !== null && (
          <button
            onClick={() => {
              setSelectedIdx(null);
              setEditPose(null);
            }}
            className="px-2.5 py-1 rounded border text-[11px] font-mono cursor-pointer bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
          >
            close
          </button>
        )}
      </div>

      {/* Pose editor panel */}
      {editPose && selectedIdx !== null && (
        <div className="fixed top-20 right-4 z-50 w-[330px] max-h-[75vh] overflow-y-auto rounded-lg border border-neutral-200 bg-white/95 shadow-lg p-3 text-[11px] font-mono">
          {/* Header row: title + undo button */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[12px] font-bold">
              editing:{" "}
              <span className="text-neutral-500">
                {CONFIG[selectedIdx].pose}
              </span>
            </span>
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`px-3 py-1 rounded text-[11px] font-mono transition-colors ${
                canUndo
                  ? "bg-neutral-700 text-white cursor-pointer hover:bg-neutral-900"
                  : "bg-neutral-200 text-neutral-400 cursor-default"
              }`}
            >
              undo
            </button>
          </div>

          {/* Position */}
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
              position
            </div>
            {(["x", "y", "z"] as (keyof EV)[]).map((axis) => (
              <div key={axis} className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] uppercase tracking-wide text-neutral-400 w-14">
                  {axis}
                </span>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={0.5}
                  value={editPos[axis]}
                  onPointerDown={pushHistory}
                  onChange={(e) =>
                    setEditPos((p) => ({
                      ...p,
                      [axis]: parseFloat(e.target.value),
                    }))
                  }
                  className="flex-1"
                />
                <span className="w-8 text-right text-neutral-700">
                  {editPos[axis].toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Boldness */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] uppercase tracking-wide text-neutral-400 w-14">
              boldness
            </span>
            <input
              type="range"
              min={0.1}
              max={4}
              step={0.05}
              value={boldness}
              onPointerDown={pushHistory}
              onChange={(e) => setBoldness(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-8 text-right text-neutral-700">
              {boldness.toFixed(2)}
            </span>
          </div>

          {/* Head */}
          <LimbSection label="head">
            <PointRow
              pt={editPose.head}
              ptIdx={0}
              onBeforeChange={pushHistory}
              onChange={(ax, val) => updateHead(ax, val)}
            />
          </LimbSection>

          {/* Limbs */}
          {(
            ["body", "larm", "rarm", "lleg", "rleg"] as (keyof Omit<
              EPose,
              "head"
            >)[]
          ).map((limb) => (
            <LimbSection key={limb} label={limb}>
              {(editPose[limb] as EV[]).map((pt, pi) => (
                <PointRow
                  key={pi}
                  pt={pt}
                  ptIdx={pi}
                  onBeforeChange={pushHistory}
                  onChange={(ax, val) => updateLimb(limb, pi, ax, val)}
                />
              ))}
            </LimbSection>
          ))}

          <button
            onClick={copyToClipboard}
            className="w-full mt-2 py-1.5 rounded bg-neutral-900 text-white text-[11px] font-mono cursor-pointer hover:bg-neutral-700 transition-colors"
          >
            copy pose to clipboard
          </button>
        </div>
      )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function LimbSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function PointRow({
  pt,
  ptIdx,
  onChange,
  onBeforeChange,
}: {
  pt: EV;
  ptIdx: number;
  onChange: (axis: keyof EV, val: number) => void;
  onBeforeChange: () => void;
}) {
  return (
    <div className="flex items-center gap-1 mb-0.5">
      <span className="text-neutral-300 w-3 text-right">{ptIdx}</span>
      {(["x", "y", "z"] as (keyof EV)[]).map((axis) => (
        <label key={axis} className="flex items-center gap-0.5">
          <span className="text-neutral-400 w-2">{axis}</span>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.01}
            value={pt[axis]}
            onPointerDown={onBeforeChange}
            onChange={(e) => onChange(axis, parseFloat(e.target.value))}
            className="w-14"
          />
          <span className="w-9 text-right text-neutral-700">
            {pt[axis].toFixed(2)}
          </span>
        </label>
      ))}
    </div>
  );
}
