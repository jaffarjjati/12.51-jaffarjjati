import * as THREE from "three";
import { BONE, resetPose, type Pose, type Rig } from "./rig";

/** Jump apex in rig units. */
const JUMP_HEIGHT = 1.4;

export type Kind =
  | "hero"
  | "waving"
  | "jumping"
  | "thinking"
  | "sitting"
  | "running"
  | "sleeping";

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export interface JumpState {
  /** 0…1 knee bend (anticipation and landing). */
  crouch: number;
  /** 0…1 how "in the air" the figure is (peaks at the apex). */
  air: number;
  /** 0 before takeoff, 0…1 through the flight, 1 after landing. */
  a: number;
  /** Height above the ground in rig units. */
  lift: number;
}

/** One jump cycle, u in 0…1: crouch, launch, flight, absorb the landing. */
export function jumpState(u: number): JumpState {
  let crouch = 0;
  let air = 0;
  let a = 0;
  let lift = 0;
  if (u < 0.2) crouch = smooth(0, 0.2, u);
  else if (u < 0.28) crouch = 1 - smooth(0.2, 0.28, u);
  else if (u < 0.86) {
    a = (u - 0.28) / 0.58;
    lift = 4 * JUMP_HEIGHT * a * (1 - a);
    air = Math.sin(Math.PI * a);
  } else {
    a = 1;
    crouch = 0.85 * (1 - smooth(0.86, 1, u));
  }
  return { crouch, air, a, lift };
}

/** Arms swing back in the crouch, then up into a V (not through the head). */
export function applyJump(p: Pose, s: JumpState) {
  const armsUp = Math.min(1, s.air * 2.2);
  p.armL = -(0.3 + 0.35 * s.crouch + 1.6 * armsUp);
  p.armR = -p.armL;
  p.elbowL = -0.25 * armsUp;
  p.elbowR = -p.elbowL;
  p.hipL = -0.1 - 0.85 * s.crouch - 0.35 * s.air;
  p.hipR = -p.hipL;
  p.kneeL = 1.45 * s.crouch + 0.55 * s.air;
  p.kneeR = -p.kneeL;
  p.lift = s.lift;
}

/** Knee flexion over a run cycle: bent at mid-swing, nearly straight at contact. */
const runKnee = (a: number) => 0.85 + 0.75 * Math.cos(a) - 0.35 * Math.sin(a);

/**
 * Drive the joint angles for one actor at time `t`.
 * `look` (-1…1) is only used by the hero. Pass t = 0 for a still, reduced-motion pose.
 */
export function animateActor(kind: Kind, p: Pose, t: number, look: number) {
  resetPose(p);
  switch (kind) {
    case "hero": {
      const b = Math.sin(t * 1.4);
      p.armL = -0.24 + b * 0.025;
      p.armR = 0.24 - b * 0.025;
      p.elbowL = -0.12;
      p.elbowR = 0.12;
      p.hipL = -0.11;
      p.hipR = 0.11;
      p.breath = 0.012 * b;
      // Head and torso lean toward the cursor.
      p.head = Math.sin(t * 0.7) * 0.03 - look * 0.3;
      p.lean = -look * 0.18;
      break;
    }

    case "waving": {
      // Upper arm out to the side, forearm up and waving; keeps clear of the head.
      p.armL = -1.9;
      p.elbowL = -0.75 + Math.sin(t * 6.5) * 0.45;
      p.armR = 0.3;
      p.elbowR = 0.1;
      p.head = Math.sin(t * 2) * 0.06;
      p.lean = Math.sin(t * 1.3) * 0.025;
      break;
    }

    case "running": {
      const ph = t * 9;
      const s = Math.sin(ph);
      p.hipL = 0.12 + 0.8 * s;
      p.hipR = 0.12 - 0.8 * s;
      p.kneeL = -runKnee(ph);
      p.kneeR = -runKnee(ph + Math.PI);
      p.armL = -0.95 * s;
      p.armR = 0.95 * s;
      p.elbowL = 1.35 + 0.35 * s;
      p.elbowR = 1.35 - 0.35 * s;
      p.lean = -0.3;
      p.head = 0.18;
      // Airborne moments between strides.
      p.lift = 0.05 * (1 - Math.cos(2 * ph));
      break;
    }

    case "jumping": {
      // crouch → launch → air → land, once every 1.8 s
      const T = 1.8;
      applyJump(p, jumpState((t % T) / T));
      break;
    }

    case "thinking": {
      p.lean = -0.03 + Math.sin(t * 0.7) * 0.01;
      p.head = 0.16 + Math.sin(t * 0.9) * 0.04;
      // Right hand on chin, left arm folded under it.
      p.armR = 1.25;
      p.elbowR = 2.55;
      p.armL = 0.3;
      p.elbowL = 1.9;
      p.hipL = -0.08;
      p.hipR = 0.12;
      // Impatient foot tap.
      p.kneeR = -0.05 - 0.2 * Math.max(0, Math.sin(t * 4));
      break;
    }

    case "sitting": {
      p.lean = -0.08 + Math.sin(t * 0.6) * 0.01;
      p.head = 0.22 + Math.sin(t * 1.1) * 0.03;
      // Thighs level with the stool, shins straight down.
      p.hipL = p.hipR = Math.PI / 2;
      p.kneeL = p.kneeR = -Math.PI / 2;
      // Forearms forward onto the keys, fingers tapping out of phase.
      p.armL = p.armR = 0.12;
      p.elbowL = 0.96 + Math.sin(t * 10) * 0.07;
      p.elbowR = 0.96 + Math.sin(t * 10 + 2.1) * 0.07;
      break;
    }

    case "sleeping": {
      // Lying on the back: the root is rotated, so local +x points at the floor.
      // Keep every limb angled up (negative) so nothing pokes into the ground,
      // and splay them so arms and legs read separately from the torso.
      p.ground = false;
      p.breath = 0.035 * Math.sin(t * 1.5);
      p.head = 0.1;
      p.armL = -0.6;
      p.elbowL = -0.25;
      p.armR = -0.14;
      p.elbowR = 0.1;
      p.hipL = -0.34;
      p.kneeL = 0.12;
      p.hipR = -0.09;
      break;
    }
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
function stroke(
  parent: THREE.Object3D,
  length: number,
  r: number,
  mat: THREE.Material,
  x: number,
  y: number,
  rotZ: number
) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, length, 4, 8), mat);
  m.position.set(x, y, 0);
  m.rotation.z = rotZ;
  parent.add(m);
}

/** An open laptop on the lap, sized to the sitting pose. */
export function buildLaptop(mat: THREE.Material, rig: Rig): THREE.Group {
  const g = new THREE.Group();
  const r = rig.propR;
  const hipY = BONE.shin + rig.limbR;

  const baseY = hipY + rig.limbR + r;
  stroke(g, 0.34, r, mat, 0.36, baseY, Math.PI / 2); // laptop base
  const hinge = { x: 0.53, y: baseY };
  const tilt = -0.2;
  stroke(
    g,
    0.3,
    r,
    mat,
    hinge.x + Math.sin(-tilt) * 0.15,
    hinge.y + Math.cos(tilt) * 0.15,
    tilt
  ); // laptop screen
  return g;
}
