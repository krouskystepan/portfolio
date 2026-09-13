import { hexToRgb, hslToHex, rgbToHex } from "./colorUtils";

export type BlobWaveMode = "blob" | "wave";
export type BlobWaveFill = "solid" | "gradient" | "outline";
export type WaveEdge = "top" | "bottom" | "both";
export type BlobWaveExportFormat = "svg" | "css" | "clip";
export type BlobPoint = { x: number; y: number };

export type BlobWaveConfig = {
  mode: BlobWaveMode;
  seed: number;
  points: number;
  irregularity: number;
  smoothness: number;
  layers: number;
  amplitude: number;
  frequency: number;
  phase: number;
  edge: WaveEdge;
  fill: BlobWaveFill;
  color1: string;
  color2: string;
  background: string;
  width: number;
  height: number;
  angle: number;
  strokeWidth: number;
  animate: boolean;
  /** Dragged vertices; when set they replace seed-based geometry. */
  handles: BlobPoint[] | null;
};

export const MODES: { id: BlobWaveMode; label: string }[] = [
  { id: "blob", label: "Blob" },
  { id: "wave", label: "Wave" },
];

export const FILL_MODES: { id: BlobWaveFill; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "gradient", label: "Gradient" },
  { id: "outline", label: "Outline" },
];

export const WAVE_EDGES: { id: WaveEdge; label: string }[] = [
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
  { id: "both", label: "Both" },
];

export const EXPORT_FORMATS: { id: BlobWaveExportFormat; label: string }[] = [
  { id: "svg", label: "SVG" },
  { id: "css", label: "CSS" },
  { id: "clip", label: "clip-path" },
];

export const DEFAULT_MODE: BlobWaveMode = "blob";
export const DEFAULT_FILL: BlobWaveFill = "gradient";
export const DEFAULT_EDGE: WaveEdge = "bottom";
export const DEFAULT_EXPORT: BlobWaveExportFormat = "svg";
export const DEFAULT_SEED = 42;
export const DEFAULT_POINTS = 8;
export const DEFAULT_IRREGULARITY = 55;
export const DEFAULT_SMOOTHNESS = 80;
export const DEFAULT_LAYERS = 2;
export const DEFAULT_AMPLITUDE = 42;
export const DEFAULT_FREQUENCY = 3;
export const DEFAULT_PHASE = 20;
export const DEFAULT_COLOR1 = "#f83a89";
export const DEFAULT_COLOR2 = "#4169e1";
export const DEFAULT_BACKGROUND = "transparent";
export const DEFAULT_WIDTH = 800;
export const DEFAULT_HEIGHT = 800;
export const DEFAULT_ANGLE = 135;
export const DEFAULT_STROKE = 8;
export const DEFAULT_ANIMATE = false;

export const MIN_POINTS = 3;
export const MAX_POINTS = 16;
export const MIN_LAYERS = 1;
export const MAX_LAYERS = 3;
export const MIN_SIZE = 120;
export const MAX_SIZE = 2400;
export const MIN_FREQ = 1;
export const MAX_FREQ = 10;
export const MIN_STROKE = 1;
export const MAX_STROKE = 40;
export const WAVE_SAMPLES = 64;
export const WAVE_HANDLE_COUNT = 12;
export const MAX_HANDLES = WAVE_SAMPLES + 1;

export const TRANSPARENT = "transparent";

export type BlobWavePreset = {
  id: string;
  label: string;
  /** Tooltip - what this preset is demonstrating. */
  hint: string;
  mode: BlobWaveMode;
  fill: BlobWaveFill;
  color1: string;
  color2: string;
  background: string;
  layers: number;
  points: number;
  irregularity: number;
  smoothness: number;
  amplitude: number;
  frequency: number;
  phase: number;
  edge: WaveEdge;
  width: number;
  height: number;
  angle: number;
  strokeWidth: number;
  seed: number;
};

export const BLOB_WAVE_PRESETS: BlobWavePreset[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    hint: "Gradient blob, 2 layers, brand pink → blue",
    mode: "blob",
    fill: "gradient",
    color1: "#f83a89",
    color2: "#4169e1",
    background: TRANSPARENT,
    layers: 2,
    points: 8,
    irregularity: 55,
    smoothness: 80,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    phase: DEFAULT_PHASE,
    edge: "bottom",
    width: 800,
    height: 800,
    angle: 135,
    strokeWidth: DEFAULT_STROKE,
    seed: 42,
  },
  {
    id: "overlay-dark",
    label: "Overlay dark",
    hint: "Gradient blob on a solid GitHub-dark background",
    mode: "blob",
    fill: "gradient",
    color1: "#3fb950",
    color2: "#161b22",
    background: "#0d1117",
    layers: 2,
    points: 7,
    irregularity: 48,
    smoothness: 72,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    phase: DEFAULT_PHASE,
    edge: "bottom",
    width: 800,
    height: 800,
    angle: 160,
    strokeWidth: DEFAULT_STROKE,
    seed: 128,
  },
  {
    id: "obs-clear",
    label: "OBS clear",
    hint: "White/pink blob, transparent for OBS",
    mode: "blob",
    fill: "gradient",
    color1: "#ffffff",
    color2: "#f83a89",
    background: TRANSPARENT,
    layers: 2,
    points: 9,
    irregularity: 62,
    smoothness: 78,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    phase: DEFAULT_PHASE,
    edge: "bottom",
    width: 800,
    height: 800,
    angle: 120,
    strokeWidth: 10,
    seed: 77,
  },
  {
    id: "hero-wave",
    label: "Hero wave",
    hint: "Layered bottom divider, wide viewBox",
    mode: "wave",
    fill: "gradient",
    color1: "#f83a89",
    color2: "#4169e1",
    background: TRANSPARENT,
    layers: 3,
    points: DEFAULT_POINTS,
    irregularity: DEFAULT_IRREGULARITY,
    smoothness: DEFAULT_SMOOTHNESS,
    amplitude: 48,
    frequency: 3,
    phase: 20,
    edge: "bottom",
    width: 1440,
    height: 360,
    angle: 90,
    strokeWidth: DEFAULT_STROKE,
    seed: 9,
  },
  {
    id: "ink-outline",
    label: "Ink outline",
    hint: "Stroke only - 1 layer, many points, high smoothness",
    mode: "blob",
    fill: "outline",
    color1: "#e2e8f0",
    color2: "#94a3b8",
    background: TRANSPARENT,
    layers: 1,
    points: 12,
    irregularity: 32,
    smoothness: 94,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    phase: DEFAULT_PHASE,
    edge: "bottom",
    width: 800,
    height: 800,
    angle: 135,
    strokeWidth: 16,
    seed: 201,
  },
  {
    id: "spike",
    label: "Spike",
    hint: "Solid fill - few points, high irregularity, low smoothness",
    mode: "blob",
    fill: "solid",
    color1: "#f97316",
    color2: "#fb923c",
    background: TRANSPARENT,
    layers: 1,
    points: 5,
    irregularity: 82,
    smoothness: 14,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    phase: DEFAULT_PHASE,
    edge: "bottom",
    width: 800,
    height: 800,
    angle: 135,
    strokeWidth: DEFAULT_STROKE,
    seed: 314,
  },
  {
    id: "ribbon",
    label: "Ribbon",
    hint: "Wave on both edges, high frequency, 2 layers",
    mode: "wave",
    fill: "gradient",
    color1: "#22d3ee",
    color2: "#6366f1",
    background: TRANSPARENT,
    layers: 2,
    points: DEFAULT_POINTS,
    irregularity: DEFAULT_IRREGULARITY,
    smoothness: DEFAULT_SMOOTHNESS,
    amplitude: 30,
    frequency: 7,
    phase: 40,
    edge: "both",
    width: 1440,
    height: 320,
    angle: 90,
    strokeWidth: DEFAULT_STROKE,
    seed: 55,
  },
  {
    id: "top-swell",
    label: "Top swell",
    hint: "Top-edge wash - 1 slow wave, high amplitude, 3 layers",
    mode: "wave",
    fill: "gradient",
    color1: "#4169e1",
    color2: "#38bdf8",
    background: "#020617",
    layers: 3,
    points: DEFAULT_POINTS,
    irregularity: DEFAULT_IRREGULARITY,
    smoothness: DEFAULT_SMOOTHNESS,
    amplitude: 72,
    frequency: 1,
    phase: 90,
    edge: "top",
    width: 1440,
    height: 480,
    angle: 180,
    strokeWidth: DEFAULT_STROKE,
    seed: 3,
  },
];

export type BlobWaveShapePreset = {
  id: string;
  label: string;
  hint: string;
  mode: BlobWaveMode;
  seed: number;
  points: number;
  irregularity: number;
  smoothness: number;
  layers: number;
  amplitude: number;
  frequency: number;
  phase: number;
  edge: WaveEdge;
  width: number;
  height: number;
};

/** Silhouette only - does not change fill, colors, or stroke. */
export const BLOB_WAVE_SHAPE_PRESETS: BlobWaveShapePreset[] = [
  {
    id: "shape-soft",
    label: "Soft",
    hint: "Round blob - 8 points, high smoothness",
    mode: "blob",
    seed: 42,
    points: 8,
    irregularity: 40,
    smoothness: 88,
    layers: 2,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    phase: DEFAULT_PHASE,
    edge: "bottom",
    width: 800,
    height: 800,
  },
  {
    id: "shape-cloud",
    label: "Cloud",
    hint: "Puffy blob - many points, very smooth",
    mode: "blob",
    seed: 88,
    points: 12,
    irregularity: 50,
    smoothness: 92,
    layers: 2,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    phase: DEFAULT_PHASE,
    edge: "bottom",
    width: 800,
    height: 800,
  },
  {
    id: "shape-pebble",
    label: "Pebble",
    hint: "Simple stone - few points, high smoothness",
    mode: "blob",
    seed: 12,
    points: 6,
    irregularity: 28,
    smoothness: 90,
    layers: 1,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    phase: DEFAULT_PHASE,
    edge: "bottom",
    width: 800,
    height: 800,
  },
  {
    id: "shape-spike",
    label: "Spike",
    hint: "Jagged blob - few points, low smoothness",
    mode: "blob",
    seed: 314,
    points: 5,
    irregularity: 82,
    smoothness: 14,
    layers: 1,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    phase: DEFAULT_PHASE,
    edge: "bottom",
    width: 800,
    height: 800,
  },
  {
    id: "shape-divider",
    label: "Divider",
    hint: "Classic bottom hero wave, 3 layers",
    mode: "wave",
    seed: 9,
    points: DEFAULT_POINTS,
    irregularity: DEFAULT_IRREGULARITY,
    smoothness: DEFAULT_SMOOTHNESS,
    layers: 3,
    amplitude: 48,
    frequency: 3,
    phase: 20,
    edge: "bottom",
    width: 1440,
    height: 360,
  },
  {
    id: "shape-ripple",
    label: "Ripple",
    hint: "Tight waves on both edges",
    mode: "wave",
    seed: 55,
    points: DEFAULT_POINTS,
    irregularity: DEFAULT_IRREGULARITY,
    smoothness: DEFAULT_SMOOTHNESS,
    layers: 2,
    amplitude: 30,
    frequency: 7,
    phase: 40,
    edge: "both",
    width: 1440,
    height: 320,
  },
  {
    id: "shape-swell",
    label: "Swell",
    hint: "One slow top wave, high amplitude",
    mode: "wave",
    seed: 3,
    points: DEFAULT_POINTS,
    irregularity: DEFAULT_IRREGULARITY,
    smoothness: DEFAULT_SMOOTHNESS,
    layers: 3,
    amplitude: 72,
    frequency: 1,
    phase: 90,
    edge: "top",
    width: 1440,
    height: 480,
  },
  {
    id: "shape-calm",
    label: "Calm",
    hint: "Gentle single-layer bottom swell",
    mode: "wave",
    seed: 21,
    points: DEFAULT_POINTS,
    irregularity: DEFAULT_IRREGULARITY,
    smoothness: DEFAULT_SMOOTHNESS,
    layers: 1,
    amplitude: 28,
    frequency: 2,
    phase: 10,
    edge: "bottom",
    width: 1440,
    height: 280,
  },
];

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return clamp(Math.round(n), min, max);
}

export function clampPct(n: number): number {
  return clampInt(n, 0, 100);
}

export function clampAngle(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_ANGLE;
  return clampInt(n, 0, 360);
}

export function clampSize(n: number): number {
  return clampInt(n, MIN_SIZE, MAX_SIZE);
}

export function clampSeed(n: number): number {
  return clampInt(n, 0, 999_999_999);
}

export function normalizeHex(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHex(rgb.r, rgb.g, rgb.b).toLowerCase();
}

export function parseHexParam(raw: string | null, fallback: string): string {
  if (raw == null || raw === "") return fallback;
  return normalizeHex(raw) ?? fallback;
}

export function parseBackground(raw: string | null, fallback: string): string {
  if (raw == null) return fallback;
  if (raw === "t" || raw === TRANSPARENT || raw === "") return TRANSPARENT;
  return normalizeHex(raw) ?? fallback;
}

export function serializeBackground(
  value: string,
  fallback: string,
): string | null {
  if (value === fallback) return null;
  if (value === TRANSPARENT) return "t";
  return value.replace(/^#/, "");
}

export function isTransparent(value: string): boolean {
  return value === TRANSPARENT || value === "" || value === "none";
}

/** Seeded mulberry32 - same seed always draws the same shape. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % 1_000_000_000;
  }
  return Math.floor(Math.random() * 1_000_000_000);
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomFillHex(h: number, s: number, l: number): string {
  return hslToHex(((h % 360) + 360) % 360, s, l).toLowerCase();
}

/** New geometry, fill, and colors. Keeps mode, canvas size, and animate. */
export function randomizeBlobWave(
  current: Pick<BlobWaveConfig, "mode" | "width" | "height" | "animate">,
): BlobWaveConfig {
  const hue = Math.random() * 360;
  const fillRoll = Math.random();
  const fill: BlobWaveFill =
    fillRoll < 0.5 ? "gradient" : fillRoll < 0.78 ? "solid" : "outline";
  const bgRoll = Math.random();
  const background =
    bgRoll < 0.55
      ? TRANSPARENT
      : bgRoll < 0.82
        ? randomFillHex(hue, randInt(12, 28), randInt(4, 14))
        : randomFillHex(hue + 180, randInt(8, 20), randInt(88, 96));

  return {
    mode: current.mode,
    seed: randomSeed(),
    points: randInt(MIN_POINTS, MAX_POINTS),
    irregularity: randInt(18, 92),
    smoothness: randInt(20, 96),
    layers: randInt(MIN_LAYERS, MAX_LAYERS),
    amplitude: randInt(18, 78),
    frequency: randInt(MIN_FREQ, MAX_FREQ),
    phase: randInt(0, 360),
    edge: pickOne(WAVE_EDGES).id,
    fill,
    color1: randomFillHex(hue, randInt(52, 90), randInt(42, 68)),
    color2: randomFillHex(
      hue + randInt(28, 140),
      randInt(48, 86),
      randInt(38, 72),
    ),
    background,
    width: current.width,
    height: current.height,
    angle: randInt(0, 360),
    strokeWidth: randInt(4, 22),
    animate: current.animate,
    handles: null,
  };
}

function fmt(n: number): string {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? "0" : String(v);
}

type Pt = BlobPoint;

export function roundHandle(n: number): number {
  return Math.round(n * 100) / 100;
}

export function serializeHandles(pts: BlobPoint[]): string {
  return pts.map((p) => `${roundHandle(p.x)}_${roundHandle(p.y)}`).join("~");
}

export function parseHandles(raw: string | null): BlobPoint[] | null {
  if (raw == null || raw === "") return null;
  const parts = raw.split("~").filter(Boolean);
  if (parts.length < MIN_POINTS || parts.length > MAX_HANDLES) return null;
  const pts: BlobPoint[] = [];
  for (const part of parts) {
    const at = part.indexOf("_");
    if (at <= 0) return null;
    const x = Number.parseFloat(part.slice(0, at));
    const y = Number.parseFloat(part.slice(at + 1));
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    pts.push({ x, y });
  }
  return pts;
}

function closedCubicPath(pts: Pt[], smoothness: number): string {
  const n = pts.length;
  if (n < 3) return "";
  const s = clamp(smoothness, 0, 1.75);
  const parts = [`M${fmt(pts[0].x)} ${fmt(pts[0].y)}`];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + ((p2.x - p0.x) / 6) * s;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * s;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * s;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * s;
    parts.push(
      `C${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2.x)} ${fmt(p2.y)}`,
    );
  }
  parts.push("Z");
  return parts.join("");
}

function cubicThrough(pts: Pt[], smoothness: number): string {
  if (pts.length < 2) return "";
  const s = clamp(smoothness, 0, 1.75);
  const n = pts.length;
  const parts = [`M${fmt(pts[0].x)} ${fmt(pts[0].y)}`];
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const c1x = p1.x + ((p2.x - p0.x) / 6) * s;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * s;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * s;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * s;
    parts.push(
      `C${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2.x)} ${fmt(p2.y)}`,
    );
  }
  return parts.join("");
}

function closeWith(path: string, corners: Pt[]): string {
  const tail = corners.map((p) => `L${fmt(p.x)} ${fmt(p.y)}`).join("");
  return `${path}${tail}Z`;
}

export function blobPoints(
  seed: number,
  points: number,
  irregularity: number,
  opts?: { cx?: number; cy?: number; radius?: number },
): BlobPoint[] {
  const count = clampInt(points, MIN_POINTS, MAX_POINTS);
  const irr = clamp(irregularity, 0, 1);
  const cx = opts?.cx ?? 400;
  const cy = opts?.cy ?? 400;
  const radius = opts?.radius ?? 280;
  const rand = mulberry32(clampSeed(seed));
  const slice = (Math.PI * 2) / count;
  const pts: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * slice + (rand() - 0.5) * slice * irr;
    const r = radius * (1 + (rand() - 0.5) * 2 * irr * 0.72);
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return pts;
}

export function blobPathFromPoints(
  pts: BlobPoint[],
  smoothness: number,
): string {
  return closedCubicPath(pts, smoothness);
}

export function blobPath(
  seed: number,
  points: number,
  irregularity: number,
  smoothness: number,
  opts?: { cx?: number; cy?: number; radius?: number },
): string {
  return closedCubicPath(
    blobPoints(seed, points, irregularity, opts),
    smoothness,
  );
}

export function wavePath({
  amplitude,
  frequency,
  phase,
  layers = 1,
  layerIndex = 0,
  width,
  height,
  edge,
  seed = 0,
}: {
  amplitude: number;
  frequency: number;
  phase: number;
  layers?: number;
  layerIndex?: number;
  width: number;
  height: number;
  edge: WaveEdge;
  seed?: number;
}): string {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const layerCount = clampInt(layers, MIN_LAYERS, MAX_LAYERS);
  const idx = clampInt(layerIndex, 0, layerCount - 1);
  const freq = clamp(frequency, MIN_FREQ, MAX_FREQ);
  const amp = Math.max(0, amplitude) * (1 - idx * 0.16);
  const phaseRad = phase + idx * 0.85;
  const jitter = amp * 0.12;

  const sample = (base: number) => {
    const local = mulberry32(
      clampSeed(seed) + idx * 97 + Math.round(base * 10),
    );
    const pts: Pt[] = [];
    for (let i = 0; i <= WAVE_SAMPLES; i++) {
      const x = (i / WAVE_SAMPLES) * w;
      const t = (x / w) * freq * Math.PI * 2 + phaseRad;
      const wave = Math.sin(t) + 0.22 * Math.sin(t * 2 + 0.4);
      const noise = (local() - 0.5) * 2 * jitter;
      pts.push({ x, y: clamp(base + wave * amp + noise, 0, h) });
    }
    return pts;
  };

  const layerShift = idx * h * 0.07;
  if (edge === "top") {
    const pts = sample(h * 0.32 + layerShift);
    return closeWith(cubicThrough(pts, 1), [
      { x: w, y: 0 },
      { x: 0, y: 0 },
    ]);
  }
  if (edge === "both") {
    const top = sample(h * 0.28 + layerShift * 0.4);
    const mid = h / 2;
    const bot = top
      .map((p) => ({ x: p.x, y: clamp(mid + (mid - p.y), 0, h) }))
      .reverse();
    const topCurve = cubicThrough(top, 1);
    const botCurve = cubicThrough(bot, 1);
    const botStart = bot[0];
    const botBody = botCurve.replace(/^M[^C]+/, "");
    return `${topCurve}L${fmt(botStart.x)} ${fmt(botStart.y)}${botBody}Z`;
  }
  const pts = sample(h * 0.58 - layerShift);
  return closeWith(cubicThrough(pts, 1), [
    { x: w, y: h },
    { x: 0, y: h },
  ]);
}

function gradientStops(angle: number): {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
} {
  const rad = ((clampAngle(angle) - 90) * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  const pct = (n: number) => `${fmt((0.5 + n / 2) * 100)}%`;
  return {
    x1: pct(-x),
    y1: pct(-y),
    x2: pct(x),
    y2: pct(y),
  };
}

function fillPaint(config: BlobWaveConfig): string {
  if (config.fill === "gradient") return "url(#bw-fill)";
  if (config.fill === "outline") return "none";
  return config.color1;
}

function strokePaint(config: BlobWaveConfig): string {
  if (config.fill !== "outline") return "none";
  return config.color1;
}

function layerOpacity(indexFromFront: number): number {
  if (indexFromFront === 0) return 1;
  return Math.round((0.4 / indexFromFront) * 100) / 100;
}

function layerScale(indexFromFront: number): number {
  return 1 + indexFromFront * 0.1;
}

export function blobFrame(config: Pick<BlobWaveConfig, "width" | "height">): {
  cx: number;
  cy: number;
  radius: number;
} {
  return {
    cx: config.width / 2,
    cy: config.height / 2,
    radius: Math.min(config.width, config.height) * 0.34,
  };
}

export function scalePointsAround(
  pts: BlobPoint[],
  cx: number,
  cy: number,
  scale: number,
): BlobPoint[] {
  if (scale === 1) return pts;
  return pts.map((p) => ({
    x: cx + (p.x - cx) * scale,
    y: cy + (p.y - cy) * scale,
  }));
}

export function generatedBlobHandles(config: BlobWaveConfig): BlobPoint[] {
  const { cx, cy, radius } = blobFrame(config);
  return blobPoints(config.seed, config.points, config.irregularity / 100, {
    cx,
    cy,
    radius,
  });
}

function waveLayerCrest(
  config: BlobWaveConfig,
  layerFromFront: number,
  seedOffset = 0,
): BlobPoint[] {
  const w = Math.max(1, config.width);
  const h = Math.max(1, config.height);
  const idx = clampInt(layerFromFront, 0, MAX_LAYERS - 1);
  const amp = (config.amplitude / 100) * h * 0.42 * (1 - idx * 0.16);
  const freq = clamp(config.frequency, MIN_FREQ, MAX_FREQ);
  const phaseRad = (config.phase * Math.PI) / 180 + idx * 0.85;
  const jitter = amp * 0.12;
  const layerShift = idx * h * 0.07;
  const base =
    config.edge === "top"
      ? h * 0.32 + layerShift
      : config.edge === "both"
        ? h * 0.28 + layerShift * 0.4
        : h * 0.58 - layerShift;
  const local = mulberry32(
    clampSeed(config.seed + seedOffset) + idx * 97 + Math.round(base * 10),
  );
  const pts: BlobPoint[] = [];
  for (let i = 0; i <= WAVE_SAMPLES; i++) {
    const x = (i / WAVE_SAMPLES) * w;
    const t = (x / w) * freq * Math.PI * 2 + phaseRad;
    const wave = Math.sin(t) + 0.22 * Math.sin(t * 2 + 0.4);
    const noise = (local() - 0.5) * 2 * jitter;
    pts.push({ x, y: clamp(base + wave * amp + noise, 0, h) });
  }
  return pts;
}

export function generatedWaveHandles(config: BlobWaveConfig): BlobPoint[] {
  return subsampleWaveHandles(waveLayerCrest(config, 0));
}

export function geometryPoints(config: BlobWaveConfig): BlobPoint[] {
  if (config.handles && config.handles.length >= MIN_POINTS) {
    return config.handles;
  }
  return config.mode === "blob"
    ? generatedBlobHandles(config)
    : waveLayerCrest(config, 0);
}

function wavePreviewIndices(count: number): number[] {
  if (count <= 0) return [];
  if (count <= WAVE_HANDLE_COUNT + 1) {
    return Array.from({ length: count }, (_, i) => i);
  }
  const last = count - 1;
  const idx: number[] = [];
  for (let i = 0; i <= WAVE_HANDLE_COUNT; i++) {
    idx.push(Math.round((i / WAVE_HANDLE_COUNT) * last));
  }
  return idx;
}

function subsampleWaveHandles(crest: BlobPoint[]): BlobPoint[] {
  return wavePreviewIndices(crest.length).map((i) => crest[i]);
}

export function previewHandles(config: BlobWaveConfig): BlobPoint[] {
  const geom = geometryPoints(config);
  const pts = config.mode === "blob" ? geom : subsampleWaveHandles(geom);
  return pts.map((p) => ({ x: roundHandle(p.x), y: roundHandle(p.y) }));
}

export function applyPreviewHandleMove(
  config: BlobWaveConfig,
  previewIndex: number,
  x: number,
  y: number,
): BlobPoint[] {
  const geom = geometryPoints(config).map((p) => ({ ...p }));
  if (config.mode === "blob") {
    if (!geom[previewIndex]) return geom;
    geom[previewIndex] = {
      x: clamp(x, 0, config.width),
      y: clamp(y, 0, config.height),
    };
    return geom;
  }

  const indices = wavePreviewIndices(geom.length);
  const gi = indices[previewIndex];
  if (gi == null || !geom[gi]) return geom;

  const toY = clamp(y, 0, config.height);
  const dy = toY - geom[gi].y;
  const left = indices[previewIndex - 1];
  const right = indices[previewIndex + 1];
  const radius = Math.max(
    left == null ? 0 : Math.abs(gi - left),
    right == null ? 0 : Math.abs(right - gi),
    1,
  );

  for (let i = 0; i < geom.length; i++) {
    const t = Math.abs(i - gi) / radius;
    if (t >= 1) continue;
    const weight = 0.5 * (1 + Math.cos(Math.PI * t));
    geom[i] = {
      x: geom[i].x,
      y: clamp(geom[i].y + dy * weight, 0, config.height),
    };
  }
  geom[gi] = { x: geom[gi].x, y: toY };
  return geom;
}

export function wavePathFromHandles(
  pts: BlobPoint[],
  width: number,
  height: number,
  edge: WaveEdge,
  yShift = 0,
): string {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const sorted = [...pts]
    .map((p) => ({
      x: clamp(p.x, 0, w),
      y: clamp(p.y + yShift, 0, h),
    }))
    .sort((a, b) => a.x - b.x);
  if (sorted.length < 2) return "";
  const tension = pts.length >= WAVE_SAMPLES / 2 ? 1 : 0.45;
  if (edge === "top") {
    return closeWith(cubicThrough(sorted, tension), [
      { x: w, y: 0 },
      { x: 0, y: 0 },
    ]);
  }
  if (edge === "both") {
    const mid = h / 2;
    const bot = sorted
      .map((p) => ({ x: p.x, y: clamp(mid + (mid - p.y), 0, h) }))
      .reverse();
    const topCurve = cubicThrough(sorted, tension);
    const botCurve = cubicThrough(bot, tension);
    const botStart = bot[0];
    const botBody = botCurve.replace(/^M[^C]+/, "");
    return `${topCurve}L${fmt(botStart.x)} ${fmt(botStart.y)}${botBody}Z`;
  }
  return closeWith(cubicThrough(sorted, tension), [
    { x: w, y: h },
    { x: 0, y: h },
  ]);
}

export function blobLayerPath(
  config: BlobWaveConfig,
  layerFromFront: number,
  seedOffset = 0,
): string {
  const { cx, cy, radius } = blobFrame(config);
  const smoothness = (config.smoothness / 100) * 1.35;
  if (
    config.handles &&
    config.handles.length >= MIN_POINTS &&
    seedOffset === 0
  ) {
    const scaled = scalePointsAround(
      config.handles,
      cx,
      cy,
      layerScale(layerFromFront),
    );
    return blobPathFromPoints(scaled, smoothness);
  }
  return blobPath(
    config.seed + layerFromFront + seedOffset,
    config.points,
    config.irregularity / 100,
    smoothness,
    { cx, cy, radius },
  );
}

export function waveLayerPath(
  config: BlobWaveConfig,
  layerFromFront: number,
  seedOffset = 0,
): string {
  const pts =
    config.handles &&
    config.handles.length >= MIN_POINTS &&
    seedOffset === 0 &&
    layerFromFront === 0
      ? config.handles
      : waveLayerCrest(config, layerFromFront, seedOffset);
  return wavePathFromHandles(pts, config.width, config.height, config.edge);
}

export function primaryPath(config: BlobWaveConfig): string {
  return config.mode === "blob"
    ? blobLayerPath(config, 0)
    : waveLayerPath(config, 0);
}

function pathElement(
  d: string,
  morph: string | null,
  config: BlobWaveConfig,
  extra: { opacity: number; transform?: string },
): string {
  const fill = fillPaint(config);
  const stroke = strokePaint(config);
  const sw = config.fill === "outline" ? config.strokeWidth : 0;
  const attrs = [
    `d="${d}"`,
    `fill="${fill}"`,
    extra.opacity < 1 ? `opacity="${extra.opacity}"` : "",
    stroke === "none"
      ? 'stroke="none"'
      : `stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`,
    extra.transform ? `transform="${extra.transform}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!morph || !config.animate) {
    return `  <path ${attrs}/>`;
  }

  return [
    `  <path ${attrs}>`,
    `    <animate attributeName="d" dur="12s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" values="${d};${morph};${d}"/>`,
    extra.opacity < 1
      ? `    <animate attributeName="opacity" dur="8s" repeatCount="indefinite" values="${extra.opacity};${Math.min(1, extra.opacity + 0.12)};${extra.opacity}"/>`
      : "",
    `  </path>`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function toSvgDocument(config: BlobWaveConfig): string {
  const w = clampSize(config.width);
  const h = clampSize(config.height);
  const sized = { ...config, width: w, height: h };
  const layers = clampInt(config.layers, MIN_LAYERS, MAX_LAYERS);
  const cx = w / 2;
  const cy = h / 2;
  const lines: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet">`,
  ];

  if (sized.fill === "gradient") {
    const g = gradientStops(sized.angle);
    lines.push("  <defs>");
    lines.push(
      `    <linearGradient id="bw-fill" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}">`,
    );
    lines.push(`      <stop offset="0%" stop-color="${sized.color1}"/>`);
    lines.push(`      <stop offset="100%" stop-color="${sized.color2}"/>`);
    lines.push("    </linearGradient>");
    lines.push("  </defs>");
  }

  if (!isTransparent(sized.background)) {
    lines.push(
      `  <rect width="100%" height="100%" fill="${sized.background}"/>`,
    );
  }

  for (let i = layers - 1; i >= 0; i--) {
    const d =
      sized.mode === "blob" ? blobLayerPath(sized, i) : waveLayerPath(sized, i);
    const morph =
      sized.animate && !(sized.handles && sized.handles.length >= MIN_POINTS)
        ? sized.mode === "blob"
          ? blobLayerPath(sized, i, 1)
          : waveLayerPath(sized, i, 1)
        : null;
    const opacity = layerOpacity(i);
    const scale = sized.mode === "blob" ? layerScale(i) : 1;
    const transform =
      sized.mode === "blob" && scale !== 1
        ? `translate(${fmt(cx)} ${fmt(cy)}) scale(${fmt(scale)}) translate(${fmt(-cx)} ${fmt(-cy)})`
        : undefined;
    lines.push(pathElement(d, morph, sized, { opacity, transform }));
  }

  lines.push("</svg>");
  return lines.join("\n");
}

export function toCssBackground(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
  return `background-image: url("data:image/svg+xml,${encoded}");`;
}

export function toClipPathCss(config: BlobWaveConfig): string {
  const d = primaryPath(config);
  return [
    `/* clip-path: path() uses these coordinates as CSS pixels and does not scale with the box.`,
    `   Size the element to ${config.width}×${config.height}px, or use the SVG as a mask instead. */`,
    `clip-path: path('${d}');`,
  ].join("\n");
}

export function exportBlobWave(
  format: BlobWaveExportFormat,
  config: BlobWaveConfig,
): string {
  const svg = toSvgDocument(config);
  switch (format) {
    case "svg":
      return svg;
    case "css":
      return toCssBackground(svg);
    case "clip":
      return toClipPathCss(config);
  }
}

export function configFromPreset(
  preset: BlobWavePreset,
  current: Pick<BlobWaveConfig, "animate">,
): BlobWaveConfig {
  return {
    mode: preset.mode,
    seed: preset.seed,
    points: preset.points,
    irregularity: preset.irregularity,
    smoothness: preset.smoothness,
    layers: preset.layers,
    amplitude: preset.amplitude,
    frequency: preset.frequency,
    phase: preset.phase,
    edge: preset.edge,
    fill: preset.fill,
    color1: preset.color1,
    color2: preset.color2,
    background: preset.background,
    width: preset.width,
    height: preset.height,
    angle: preset.angle,
    strokeWidth: preset.strokeWidth,
    animate: current.animate,
    handles: null,
  };
}

export function presetMatches(
  preset: BlobWavePreset,
  config: BlobWaveConfig,
): boolean {
  return (
    !config.handles &&
    preset.mode === config.mode &&
    preset.fill === config.fill &&
    preset.color1 === config.color1 &&
    preset.color2 === config.color2 &&
    preset.background === config.background &&
    preset.layers === config.layers &&
    preset.points === config.points &&
    preset.irregularity === config.irregularity &&
    preset.smoothness === config.smoothness &&
    preset.amplitude === config.amplitude &&
    preset.frequency === config.frequency &&
    preset.phase === config.phase &&
    preset.edge === config.edge &&
    preset.width === config.width &&
    preset.height === config.height &&
    preset.angle === config.angle &&
    preset.strokeWidth === config.strokeWidth
  );
}

export function configFromShapePreset(
  preset: BlobWaveShapePreset,
  current: BlobWaveConfig,
): BlobWaveConfig {
  return {
    ...current,
    mode: preset.mode,
    seed: preset.seed,
    points: preset.points,
    irregularity: preset.irregularity,
    smoothness: preset.smoothness,
    layers: preset.layers,
    amplitude: preset.amplitude,
    frequency: preset.frequency,
    phase: preset.phase,
    edge: preset.edge,
    width: preset.width,
    height: preset.height,
    handles: null,
  };
}

export function shapePresetMatches(
  preset: BlobWaveShapePreset,
  config: BlobWaveConfig,
): boolean {
  return (
    !config.handles &&
    preset.mode === config.mode &&
    preset.seed === config.seed &&
    preset.points === config.points &&
    preset.irregularity === config.irregularity &&
    preset.smoothness === config.smoothness &&
    preset.layers === config.layers &&
    preset.amplitude === config.amplitude &&
    preset.frequency === config.frequency &&
    preset.phase === config.phase &&
    preset.edge === config.edge &&
    preset.width === config.width &&
    preset.height === config.height
  );
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadSvgDocument(
  svg: string,
  filename = "blob-wave.svg",
): void {
  triggerDownload(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    filename,
  );
}

export function rasterizeSvgToPng(
  svg: string,
  width: number,
  height: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof Image === "undefined" || typeof document === "undefined") {
      reject(new Error("PNG export needs a browser"));
      return;
    }
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas unsupported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((png) => {
        URL.revokeObjectURL(url);
        if (!png) reject(new Error("PNG encode failed"));
        else resolve(png);
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG rasterize failed"));
    };
    img.src = url;
  });
}
