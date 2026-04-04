"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const VS = 0.14; // one voxel = 0.14 world units

// ── Bresenham helpers ────────────────────────────────────────────────────────
function bLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const pts: [number, number][] = [];
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, cx = x0, cy = y0;
  for (;;) {
    pts.push([cx, cy]);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; cx += sx; }
    if (e2 <= dx) { err += dx; cy += sy; }
  }
  return pts;
}

function bCircle(cx: number, cy: number, r: number): [number, number][] {
  const set = new Set<string>();
  let x = 0, y = r, d = 3 - 2 * r;
  while (x <= y) {
    for (const [px, py] of [
      [cx+x,cy+y],[cx-x,cy+y],[cx+x,cy-y],[cx-x,cy-y],
      [cx+y,cy+x],[cx-y,cy+x],[cx+y,cy-x],[cx-y,cy-x],
    ]) set.add(`${px},${py}`);
    d = d < 0 ? d + 4 * x + 6 : (y--, d + 4 * (x - y) + 10);
    x++;
  }
  return Array.from(set).map(s => s.split(",").map(Number) as [number, number]);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BikeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth, H = mount.clientHeight;

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x393939);

    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 2.0, 5.8);
    camera.lookAt(0, 1.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    // ── Orbit controls ────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.target.set(0, 1.3, 0);
    controls.update();

    const blockScroll = (e: WheelEvent) => e.preventDefault();
    renderer.domElement.addEventListener("wheel", blockScroll, { passive: false });

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.position.set(6, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x6688ff, 0.4);
    rim.position.set(-4, 3, -5);
    scene.add(rim);

    // ── Blender grid ──────────────────────────────────────────────────────────
    const gridMain = new THREE.GridHelper(20, 20, 0x555555, 0x4a4a4a);
    (gridMain.material as THREE.LineBasicMaterial).transparent = true;
    (gridMain.material as THREE.LineBasicMaterial).opacity = 0.8;
    scene.add(gridMain);
    const gridSub = new THREE.GridHelper(20, 100, 0x454545, 0x454545);
    (gridSub.material as THREE.LineBasicMaterial).transparent = true;
    (gridSub.material as THREE.LineBasicMaterial).opacity = 0.3;
    scene.add(gridSub);

    // ── Materials ─────────────────────────────────────────────────────────────
    const mat = (color: number, metal = 0, rough = 0.9) =>
      new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });

    const MAT = {
      frame:  mat(0x1a1a3e),              // deep navy
      tire:   mat(0x111111),              // black
      rim:    mat(0xd0d8e0, 0.7, 0.2),   // polished silver
      hub:    mat(0xb8b8c0, 0.8, 0.2),
      chain:  mat(0x888888, 0.7, 0.3),
      saddle: mat(0x120f00),              // dark leather
      bar:    mat(0x282828),              // dark handlebar
      accent: mat(0xe8c820, 0.1, 0.7),   // gold logo stripe
    };

    // ── Bike group ────────────────────────────────────────────────────────────
    const bike = new THREE.Group();
    scene.add(bike);

    const WR_PX = 5;                         // wheel radius in pixels
    bike.position.set(-11 * VS, WR_PX * VS, 0); // center & lift off ground

    // Helper: place a voxel cube inside a group
    const vox = (
      grp: THREE.Group,
      px: number, py: number,
      m: THREE.Material,
      w = 1, h = 1, d = 1.2
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(VS * w, VS * h, VS * d),
        m
      );
      mesh.position.set(px * VS, py * VS, 0);
      mesh.castShadow = true;
      grp.add(mesh);
    };

    // ── Pixel-art key points (rear axle = 0,0) ────────────────────────────────
    //  RA = rear axle, FA = front axle, BB = bottom bracket
    //  ST = seat-tube top, HT = head-tube top, HB = head-tube bottom, SE = stem end
    const RA: [number,number] = [ 0,  0];
    const FA: [number,number] = [22,  0];
    const BB: [number,number] = [ 7,  0];
    const ST: [number,number] = [ 6,  9];
    const HT: [number,number] = [19, 10];
    const HB: [number,number] = [20,  5];
    const SE: [number,number] = [15, 12];

    // ── Frame ─────────────────────────────────────────────────────────────────
    const lines: [[number,number],[number,number]][] = [
      [BB, ST],   // seat tube
      [ST, HT],   // top tube
      [BB, HB],   // down tube
      [HT, HB],   // head tube
      [BB, RA],   // chain stay
      [ST, RA],   // seat stay
      [HB, FA],   // fork
    ];
    for (const [[x0,y0],[x1,y1]] of lines)
      for (const [x, y] of bLine(x0, y0, x1, y1))
        vox(bike, x, y, MAT.frame);

    // accent stripe on down tube (every other pixel = dashed gold logo)
    for (const [x, y] of bLine(BB[0], BB[1], HB[0], HB[1]))
      if ((x + y) % 3 === 0) vox(bike, x, y, MAT.accent);

    // ── Handlebar ─────────────────────────────────────────────────────────────
    for (const [x, y] of bLine(HT[0], HT[1], SE[0], SE[1]))
      vox(bike, x, y, MAT.bar);
    for (const [x, y] of bLine(SE[0]-2, SE[1], SE[0]+2, SE[1]))
      vox(bike, x, y, MAT.bar);
    // drop bars
    for (const [x, y] of bLine(SE[0]-2, SE[1], SE[0]-3, SE[1]-3))
      vox(bike, x, y, MAT.bar);
    for (const [x, y] of bLine(SE[0]+2, SE[1], SE[0]+3, SE[1]-3))
      vox(bike, x, y, MAT.bar);

    // ── Saddle ────────────────────────────────────────────────────────────────
    for (const [x, y] of bLine(ST[0], ST[1], ST[0], ST[1]+2))
      vox(bike, x, y, MAT.frame);  // seat post
    for (const [x, y] of bLine(ST[0]-3, ST[1]+2, ST[0]+2, ST[1]+2))
      vox(bike, x, y, MAT.saddle, 1, 1.3, 1.4); // saddle — slightly taller

    // ── Chain ring ────────────────────────────────────────────────────────────
    for (const [x, y] of bCircle(BB[0], BB[1], 2))
      vox(bike, x, y, MAT.chain, 0.9, 0.9, 0.7);
    vox(bike, BB[0], BB[1], MAT.hub, 1.2, 1.2, 0.8);

    // ── Wheel factory ─────────────────────────────────────────────────────────
    const buildWheel = (): THREE.Group => {
      const g = new THREE.Group();

      // Outer tyre
      for (const [px, py] of bCircle(0, 0, WR_PX)) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(VS, VS, VS * 1.5), MAT.tire);
        m.position.set(px * VS, py * VS, 0);
        m.castShadow = true;
        g.add(m);
      }

      // Inner rim ring
      for (const [px, py] of bCircle(0, 0, WR_PX - 1)) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(VS * 0.8, VS * 0.8, VS * 0.7), MAT.rim);
        m.position.set(px * VS, py * VS, 0);
        g.add(m);
      }

      // Cross spokes (4-way) + diagonal (8-way total)
      const spokeAngles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
      for (const angle of spokeAngles) {
        for (let r = 1; r < WR_PX; r++) {
          const px = Math.round(Math.cos(angle) * r);
          const py = Math.round(Math.sin(angle) * r);
          for (const [spx, spy] of [[px,py],[-px,-py]] as [number,number][]) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(VS * 0.55, VS * 0.55, VS * 0.55), MAT.rim);
            m.position.set(spx * VS, spy * VS, 0);
            g.add(m);
          }
        }
      }

      // Hub
      const hub = new THREE.Mesh(new THREE.BoxGeometry(VS * 1.5, VS * 1.5, VS * 1.5), MAT.hub);
      g.add(hub);

      return g;
    };

    const rearWheel  = buildWheel();
    rearWheel.position.set(RA[0] * VS, RA[1] * VS, 0);
    bike.add(rearWheel);

    const frontWheel = buildWheel();
    frontWheel.position.set(FA[0] * VS, FA[1] * VS, 0);
    bike.add(frontWheel);

    // ── Animation ─────────────────────────────────────────────────────────────
    let raf: number;
    const timer = new THREE.Timer();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      timer.update();
      const t = timer.getElapsed();

      rearWheel.rotation.z  = -t * 1.8;
      frontWheel.rotation.z = -t * 1.8;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("wheel", blockScroll);
      controls.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
