import * as THREE from "three";

// ── Proportions ───────────────────────────────────────────────────────────────
export const BONE = {
  torso: 0.62,
  upperArm: 0.3,
  foreArm: 0.3,
  thigh: 0.36,
  shin: 0.36,
  headR: 0.19,
  headTube: 0.05,
  headGap: 0.02,
} as const;

/**
 * Base stroke radii in rig units. buildRig() multiplies these by a per-actor
 * radiusScale so the on-screen line weight is STROKE_PX (see Companion.tsx).
 */
export const STROKE = {
  body: 0.054,
  limb: 0.05,
  prop: 0.03,
} as const;

// ── Pose: joint angles (radians) ──────────────────────────────────────────────
// Local +x is "forward". A limb hangs along -y, and a positive z-rotation swings
// it toward +x. Torso lean is negative when leaning forward. Elbows flex with
// positive values, knees with negative values (the shin folds backward).
export interface Pose {
  lean: number;
  head: number;
  armL: number;
  elbowL: number;
  armR: number;
  elbowR: number;
  hipL: number;
  kneeL: number;
  hipR: number;
  kneeR: number;
  /** Extra height above the ground-solve, e.g. while jumping. */
  lift: number;
  /** Torso scale-y offset (breathing). */
  breath: number;
  /** true → hips are placed so the lowest foot touches y = 0. */
  ground: boolean;
}

export function resetPose(p: Pose): Pose {
  p.lean = 0;
  p.head = 0;
  p.armL = -0.25;
  p.elbowL = -0.1;
  p.armR = 0.25;
  p.elbowR = 0.1;
  p.hipL = -0.1;
  p.kneeL = 0;
  p.hipR = 0.1;
  p.kneeR = 0;
  p.lift = 0;
  p.breath = 0;
  p.ground = true;
  return p;
}

export const makePose = (): Pose => resetPose({} as Pose);

// ── Rig ───────────────────────────────────────────────────────────────────────
export interface Rig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  neck: THREE.Group;
  armL: THREE.Group;
  elbowL: THREE.Group;
  armR: THREE.Group;
  elbowR: THREE.Group;
  hipL: THREE.Group;
  kneeL: THREE.Group;
  hipR: THREE.Group;
  kneeR: THREE.Group;
  /** Actual stroke radii (rig units) after radiusScale. */
  bodyR: number;
  limbR: number;
  propR: number;
}

const capsule = (length: number, r: number) =>
  new THREE.CapsuleGeometry(r, length, 4, 10);

function chain(
  parent: THREE.Object3D,
  upper: number,
  lower: number,
  r: number,
  mat: THREE.Material
) {
  const pivot = new THREE.Group();
  parent.add(pivot);
  const upperMesh = new THREE.Mesh(capsule(upper, r), mat);
  upperMesh.position.y = -upper / 2;
  pivot.add(upperMesh);
  const joint = new THREE.Group();
  joint.position.y = -upper;
  pivot.add(joint);
  const lowerMesh = new THREE.Mesh(capsule(lower, r), mat);
  lowerMesh.position.y = -lower / 2;
  joint.add(lowerMesh);
  return { pivot, joint };
}

/**
 * Jointed stickman: every bone is a capsule (round caps for free) hung off a
 * pivot group, so limbs can be driven by joint angles instead of rebuilt
 * geometry. All meshes share one material so the whole figure fades as one.
 */
export function buildRig(mat: THREE.Material, radiusScale = 1): Rig {
  const bodyR = STROKE.body * radiusScale;
  const limbR = STROKE.limb * radiusScale;
  const propR = STROKE.prop * radiusScale;
  const tubeR = BONE.headTube * radiusScale;
  const root = new THREE.Group();
  const hips = new THREE.Group();
  root.add(hips);

  const torso = new THREE.Group();
  hips.add(torso);
  const torsoMesh = new THREE.Mesh(capsule(BONE.torso, bodyR), mat);
  torsoMesh.position.y = BONE.torso / 2;
  torso.add(torsoMesh);

  const neck = new THREE.Group();
  neck.position.y = BONE.torso;
  torso.add(neck);
  const head = new THREE.Mesh(
    new THREE.TorusGeometry(BONE.headR, tubeR, 12, 40),
    mat
  );
  head.position.y = BONE.headGap + BONE.headR + tubeR;
  neck.add(head);

  const shoulder = new THREE.Group();
  shoulder.position.y = BONE.torso - 0.07;
  torso.add(shoulder);
  const aL = chain(shoulder, BONE.upperArm, BONE.foreArm, limbR, mat);
  const aR = chain(shoulder, BONE.upperArm, BONE.foreArm, limbR, mat);
  const lL = chain(hips, BONE.thigh, BONE.shin, limbR, mat);
  const lR = chain(hips, BONE.thigh, BONE.shin, limbR, mat);

  return {
    root,
    hips,
    torso,
    neck,
    armL: aL.pivot,
    elbowL: aL.joint,
    armR: aR.pivot,
    elbowR: aR.joint,
    hipL: lL.pivot,
    kneeL: lL.joint,
    hipR: lR.pivot,
    kneeR: lR.joint,
    bodyR,
    limbR,
    propR,
  };
}

const footY = (hip: number, knee: number) =>
  -(BONE.thigh * Math.cos(hip) + BONE.shin * Math.cos(hip + knee));

/** Push a Pose onto the rig, placing the hips so the lowest foot rests on y = 0. */
export function applyPose(rig: Rig, p: Pose) {
  rig.torso.rotation.z = p.lean;
  rig.torso.scale.y = 1 + p.breath;
  rig.neck.rotation.z = p.head;
  rig.armL.rotation.z = p.armL;
  rig.elbowL.rotation.z = p.elbowL;
  rig.armR.rotation.z = p.armR;
  rig.elbowR.rotation.z = p.elbowR;
  rig.hipL.rotation.z = p.hipL;
  rig.kneeL.rotation.z = p.kneeL;
  rig.hipR.rotation.z = p.hipR;
  rig.kneeR.rotation.z = p.kneeR;

  if (p.ground) {
    const lowest = Math.min(footY(p.hipL, p.kneeL), footY(p.hipR, p.kneeR));
    rig.hips.position.y = -lowest + rig.limbR + p.lift;
  } else {
    rig.hips.position.y = p.lift;
  }
}

/** Dispose every geometry (and optionally material) below an object. */
export function disposeTree(obj: THREE.Object3D) {
  obj.traverse((o) => {
    if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
      o.geometry.dispose();
      const m = o.material;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m.dispose();
    }
  });
}
