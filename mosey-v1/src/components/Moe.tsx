import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import { Platform, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import * as THREE from 'three';

import { registerMoe } from '@/lib/askMoe';
import { colors, HIT } from '@/lib/theme';

import { GLScene, SceneSetup } from './GLScene';

export type MoeMood = 'idle' | 'thinking' | 'happy' | 'rolling' | 'listening';

type Props = {
  /** Rendered size in points. The touch target never drops below 44x44. */
  size?: number;
  mood?: MoeMood;
  onPress?: () => void;
  /** Stop the render loop, e.g. while the screen is covered. */
  paused?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

// Moe is a mosaic: a rounded square of small glazed tiles with a lowercase
// "m" set into it, an eye looking out from under each arch, and a smile
// underneath. Every tile can move on its own, which is how he animates.

const FACE = 1.2; // half-width of the square
const STEP = 0.14; // distance between rows of tiles
const RIM = 7; // corners per tile
const GROUT = '#3C2238';
const FIELD = [colors.plum, '#7A4572', '#5E3257', '#74406C'];
const CREAM = ['#F6ECD6', '#EFE2C8', '#FBF4E4'];

// The "m": where its strokes run, and so where the eyes sit.
const M_LEFT = -0.64;
const M_RIGHT = 0.64;
const M_FOOT = -0.36;
const M_SHOULDER = 0.3;
const M_ARCH = (M_RIGHT - M_LEFT) / 4; // radius of each arch
const EYE_Y = 0.12;
const MOUTH_Y = -0.66;
const MOUTH_HALF = 0.42;
const SMILE = 0.13; // how far the middle of the mouth dips at rest
const SMIRK = 0.075; // how much higher the right corner sits than the left
const EYE_R = 0.03; // room to leave clear around each eye
const EYES: [number, number][] = [
  [M_LEFT + M_ARCH, EYE_Y],
  [M_RIGHT - M_ARCH, EYE_Y],
];

type Kind = 'field' | 'letter' | 'eye' | 'pupil' | 'mouth';

type Tile = {
  kind: Kind;
  x: number;
  y: number;
  /** The tile's outline, as offsets from its middle. */
  shape: number[];
  /** Distance from the middle, for ripples. */
  d: number;
  rand: number;
  /** Letter tiles: how far along the "m" they are. Mouth tiles: -1..1 along the mouth. */
  u: number;
  /** Eye tiles: which eye. */
  eye: number;
  color: THREE.Color;
};

/** A point on a rounded square of half-width r, at angle a. */
function squircle(r: number, a: number): [number, number] {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [r * Math.sign(c) * Math.sqrt(Math.abs(c)), r * Math.sign(s) * Math.sqrt(Math.abs(s))];
}

/** A line of points as a path you can walk along at a steady pace. */
function walk(pts: [number, number][]) {
  const at: number[] = [0];
  for (let i = 1; i < pts.length; i++) at.push(at[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const length = at[at.length - 1];
  const locate = (s: number) => {
    let lo = 0;
    let hi = pts.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (at[mid] <= s) lo = mid;
      else hi = mid;
    }
    return { lo, hi, f: (s - at[lo]) / (at[hi] - at[lo] || 1) };
  };
  const point = (s: number): [number, number] => {
    const { lo, hi, f } = locate(Math.max(0, Math.min(length, s)));
    return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f];
  };
  /** The direction square to the path at s. */
  const normal = (s: number): [number, number] => {
    const { lo, hi } = locate(Math.max(0, Math.min(length, s)));
    const dx = pts[hi][0] - pts[lo][0];
    const dy = pts[hi][1] - pts[lo][1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  return { length, point, normal };
}

function edgePath(r: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 480; i++) pts.push(squircle(r, (i / 480) * Math.PI * 2));
  const path = walk(pts);
  const loop = (s: number) => path.point(((s % path.length) + path.length) % path.length);
  return { length: path.length, point: loop };
}

/** The three strokes of a lowercase "m": a stem, then two arches that each drop to the baseline. */
function letterStrokes() {
  const left = M_LEFT;
  const right = M_RIGHT;
  const foot = M_FOOT;
  const shoulder = M_SHOULDER;
  const half = M_ARCH;
  const arch = (cx: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI - (i / 24) * Math.PI;
      pts.push([cx + Math.cos(a) * half, shoulder + Math.sin(a) * half]);
    }
    pts.push([cx + half, foot]);
    return pts;
  };
  return [
    walk([
      [left, foot],
      [left, shoulder + half],
    ]),
    walk(arch(left + half)),
    walk(arch(right - half)),
  ];
}

function layTiles() {
  let seed = 21;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const pick = (glaze: string[]) => glaze[Math.floor(rand() * glaze.length)];
  const tiles: Tile[] = [];

  const add = (kind: Kind, x: number, y: number, radius: number, glaze: string, u = 0, eye = 0) => {
    // Hand-cut: a slightly lopsided, slightly turned pebble.
    const shape: number[] = [];
    const turn = rand() * Math.PI * 2;
    for (let k = 0; k < RIM; k++) {
      const a = turn + (k / RIM) * Math.PI * 2;
      const r = radius * (0.92 + rand() * 0.18);
      shape.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    const color = new THREE.Color(glaze);
    color.offsetHSL(0, 0, (rand() - 0.5) * 0.06);
    tiles.push({ kind, x, y, shape, d: Math.hypot(x, y), rand: rand(), u, eye, color });
  };

  // The letter first, so the field knows where to leave room: two rows of tiles along each stroke.
  const letter: { x: number; y: number; u: number }[] = [];
  const spine: [number, number][] = [];
  let along = 0;
  letterStrokes().forEach((stroke) => {
    const count = Math.round(stroke.length / STEP);
    for (let i = 0; i <= count; i++) {
      const s = (i / count) * stroke.length;
      const [x, y] = stroke.point(s);
      const [nx, ny] = stroke.normal(s);
      spine.push([x, y]);
      for (const side of [-1, 1]) letter.push({ x: x + nx * side * STEP * 0.4, y: y + ny * side * STEP * 0.4, u: along + s });
    }
    along += stroke.length;
  });

  // The field: rows of tiles working inward from the edge.
  for (let row = 0, r = FACE - STEP / 2; r > STEP * 0.4; row++, r -= STEP) {
    const path = edgePath(r);
    const count = Math.max(4, Math.round(path.length / STEP));
    const offset = rand() * STEP;
    for (let i = 0; i < count; i++) {
      const s = offset + (i / count) * path.length;
      const [x, y] = path.point(s);
      if (spine.some(([lx, ly]) => Math.hypot(x - lx, y - ly) < STEP * 1.28)) continue;
      if (EYES.some(([ex, ey]) => Math.hypot(x - ex, y - ey) < EYE_R + STEP * 0.75)) continue;
      const mouthY = MOUTH_Y - SMILE * (1 - (x / MOUTH_HALF) ** 2) + (x / MOUTH_HALF) * SMIRK;
      if (Math.abs(x) < MOUTH_HALF + STEP * 0.6 && Math.abs(y - mouthY) < STEP * 0.8) continue;
      add('field', x + (rand() - 0.5) * 0.012, y + (rand() - 0.5) * 0.012, STEP * 0.58, pick(FIELD));
    }
  }

  letter.forEach((t) => add('letter', t.x, t.y, STEP * 0.5, pick(CREAM), t.u));

  // Eyes: one soft, bright tile under each arch. No pupils; they read as friendlier without.
  EYES.forEach(([ex, ey], eye) => add('pupil', ex, ey, 0.095, '#FFFDF7', 0, eye));
  // Mouth: a single line of tiles that curves into a smile.
  const teeth = 8;
  for (let k = 0; k < teeth; k++) {
    const u = (k / (teeth - 1)) * 2 - 1;
    add('mouth', u * MOUTH_HALF + 0.03, MOUTH_Y, STEP * 0.54, pick(CREAM), u);
  }

  return { tiles, letterLength: along };
}

/** All of Moe in a single mesh: a slab of grout, then every tile as a small fan of triangles. */
function buildMoe() {
  const { tiles, letterLength } = layTiles();
  const SEG = 72;
  const first = SEG + 1;
  const perTile = RIM + 1;
  const vertices = first + tiles.length * perTile;
  const position = new Float32Array(vertices * 3);
  const color = new Float32Array(vertices * 3);
  const index: number[] = [];

  const grout = new THREE.Color(GROUT);
  for (let i = 0; i <= SEG; i++) {
    const [x, y] = i === 0 ? [0, 0] : squircle(FACE + 0.035, ((i - 1) / SEG) * Math.PI * 2);
    position.set([x, y, 0], i * 3);
    color.set([grout.r, grout.g, grout.b], i * 3);
    if (i > 0) index.push(0, i, i === SEG ? 1 : i + 1);
  }

  const lit = new THREE.Color();
  tiles.forEach((tile, n) => {
    const base = first + n * perTile;
    // A bright middle and a darker rim, lighter toward the top left: enough to read as a glazed pebble.
    lit.copy(tile.color).offsetHSL(0, 0, 0.07);
    color.set([lit.r, lit.g, lit.b], base * 3);
    for (let k = 0; k < RIM; k++) {
      const lx = tile.shape[k * 2];
      const ly = tile.shape[k * 2 + 1];
      const towardLight = (ly - lx) / (Math.hypot(lx, ly) || 1);
      lit.copy(tile.color).offsetHSL(0, 0, -0.07 + towardLight * 0.045);
      color.set([lit.r, lit.g, lit.b], (base + 1 + k) * 3);
      index.push(base, base + 1 + k, base + 1 + ((k + 1) % RIM));
    }
  });

  const geometry = new THREE.BufferGeometry();
  const positions = new THREE.BufferAttribute(position, 3);
  positions.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', positions);
  geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));
  geometry.setIndex(index);

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, depthTest: false, depthWrite: false }),
  );
  mesh.frustumCulled = false;
  return { mesh, tiles, letterLength, positions, first, perTile };
}

export function Moe({ size = 56, mood = 'idle', onPress, paused = false, label = 'Moe', style }: Props) {
  const moodRef = useRef<MoeMood>(mood);
  const tapped = useRef(false);
  const button = useRef<View>(null);
  moodRef.current = mood;

  // The Moe you can tap on the focused screen is the one the chat panel grows out of.
  useEffect(() => {
    if (!onPress || paused) return;
    return registerMoe({
      react: () => {
        tapped.current = true;
      },
      measure: (done) => {
        const node = button.current;
        if (!node) return done(null);
        node.measureInWindow((x, y, w, h) => done(w ? { x: x + w / 2, y: y + h / 2, size: Math.min(w, h) } : null));
      },
    });
  }, [onPress, paused]);

  const setup = useCallback<SceneSetup>((scene) => {
    const { mesh, tiles, letterLength, positions, first, perTile } = buildMoe();
    scene.add(mesh);
    const out = positions.array as Float32Array;

    let burst = 0;
    let smile = SMILE;
    let gazeX = 0;
    let gazeY = 0;
    let wanderX = 0;
    let wanderY = 0;
    let nextWander = 1.2;
    let nextBlink = 2.2;
    let lid = 0;
    // How strongly each mood is showing, eased so one blends into the next.
    let think = 0;
    let glad = 0;
    let roll = 0;
    let hear = 0;

    return (t, dt) => {
      const now = moodRef.current;
      const ease = Math.min(1, dt * 5);
      think += ((now === 'thinking' ? 1 : 0) - think) * ease;
      glad += ((now === 'happy' ? 1 : 0) - glad) * ease;
      roll += ((now === 'rolling' ? 1 : 0) - roll) * ease;
      hear += ((now === 'listening' ? 1 : 0) - hear) * ease;

      // A tap: his tiles jump apart, then settle back into place.
      if (tapped.current) {
        tapped.current = false;
        burst = 1;
        nextBlink = t;
      }
      burst *= Math.exp(-dt * 5);

      // Mouth: a steady smile that widens when he's pleased and mumbles a little while he thinks.
      const wantSmile = SMILE + glad * 0.07 + think * (Math.sin(t * 9) * 0.035 - 0.05) + Math.sin(t * 1.3) * 0.01;
      smile += (wantSmile - smile) * Math.min(1, dt * 10);

      // Eyes: glance about when idle, look somewhere particular in other moods, and blink.
      if (t > nextWander) {
        wanderX = Math.random() * 2 - 1;
        wanderY = Math.random() * 2 - 1;
        nextWander = t + 1.2 + Math.random() * 2.2;
      }
      const fixed: [number, number] | null =
        now === 'thinking' ? [0.7, 0.9] : now === 'rolling' ? [1, 0] : now === 'listening' || now === 'happy' ? [0, 0.5] : null;
      gazeX += ((fixed ? fixed[0] : wanderX) - gazeX) * Math.min(1, dt * 9);
      gazeY += ((fixed ? fixed[1] : wanderY) - gazeY) * Math.min(1, dt * 9);
      if (t > nextBlink + 0.15) nextBlink = t + 1.8 + Math.random() * 3.2;
      lid += ((t > nextBlink ? 1 : 0) - lid) * Math.min(1, dt * 28);

      mesh.rotation.y = Math.sin(t * 0.9) * 0.16;
      mesh.rotation.x = Math.sin(t * 0.7 + 1) * 0.08;
      mesh.rotation.z = Math.sin(t * 7) * 0.05 * roll;
      mesh.position.y = Math.abs(Math.sin(t * 7)) * 0.1 * glad + Math.sin(t * 2.1) * 0.02;

      for (let n = 0; n < tiles.length; n++) {
        const tile = tiles[n];
        let x = tile.x;
        let y = tile.y;
        let scale = 1 + Math.sin(t * 1.5 - tile.d * 3) * 0.035;
        let squash = 1;

        if (tile.kind === 'mouth') {
          // Tilted up at one corner: a smirk, not a plain smile.
          y = MOUTH_Y - smile * (1 - tile.u * tile.u) + tile.u * SMIRK;
          scale += glad * 0.12;
        } else if (tile.kind === 'eye' || tile.kind === 'pupil') {
          const ey = EYES[tile.eye][1];
          if (tile.kind === 'pupil') {
            x += gazeX * 0.045;
            y += gazeY * 0.04;
          }
          // A blink folds the eye down onto its middle.
          y = ey + (y - ey) * (1 - lid * 0.85);
          squash = 1 - lid * 0.85;
          scale += hear * 0.12 + glad * 0.1;
        } else if (tile.kind === 'letter') {
          // A pulse runs along the "m" from its first stroke to its last, as if it were being written.
          const phase = (tile.u / letterLength) * Math.PI * 2;
          scale += Math.max(0, Math.sin(t * 2.2 - phase)) ** 2 * (0.1 + think * 0.22);
          // Pleased: the letter does a little wave. Listening: it swells, like it's leaning in.
          y += Math.sin(t * 9 - phase * 2) * 0.035 * glad;
          scale += (0.12 + Math.sin(t * 5) * 0.06) * hear;
        } else {
          // Thinking sends a ring of tiles swelling outward from the middle.
          scale += Math.max(0, Math.sin(t * 5 - tile.d * 5)) * 0.2 * Math.max(think, roll);
        }

        // Tap burst: outward, with a spin.
        const push = burst * (0.1 + tile.rand * 0.3);
        if (tile.d > 0.01) {
          x += (tile.x / tile.d) * push;
          y += (tile.y / tile.d) * push;
        }
        const spin = burst * (tile.rand - 0.5) * 3;
        const cos = Math.cos(spin) * scale;
        const sin = Math.sin(spin) * scale;

        let o = (first + n * perTile) * 3;
        out[o] = x;
        out[o + 1] = y;
        o += 3;
        for (let k = 0; k < RIM; k++, o += 3) {
          const lx = tile.shape[k * 2];
          const ly = tile.shape[k * 2 + 1] * squash;
          out[o] = x + lx * cos - ly * sin;
          out[o + 1] = y + lx * sin + ly * cos;
        }
      }
      positions.needsUpdate = true;
    };
  }, []);

  if (!onPress) {
    return (
      <View style={[{ width: size, height: size }, style]} accessibilityElementsHidden importantForAccessibility="no">
        <GLScene size={size} setup={setup} paused={paused} />
      </View>
    );
  }

  const hit = Math.max(size, HIT);
  return (
    <Pressable
      ref={button}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={[{ width: hit, height: hit, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <GLScene size={size} setup={setup} paused={paused} />
    </Pressable>
  );
}
