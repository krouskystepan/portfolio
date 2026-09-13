"use client";

import { useMemo } from "react";
import {
  DEFAULT_AMPLITUDE,
  DEFAULT_ANGLE,
  DEFAULT_BACKGROUND,
  DEFAULT_COLOR1,
  DEFAULT_COLOR2,
  DEFAULT_EDGE,
  DEFAULT_EXPORT,
  DEFAULT_FILL,
  DEFAULT_FREQUENCY,
  DEFAULT_HEIGHT,
  DEFAULT_IRREGULARITY,
  DEFAULT_LAYERS,
  DEFAULT_MODE,
  DEFAULT_PHASE,
  DEFAULT_POINTS,
  DEFAULT_SEED,
  DEFAULT_SMOOTHNESS,
  DEFAULT_STROKE,
  DEFAULT_WIDTH,
  MAX_FREQ,
  MAX_LAYERS,
  MAX_POINTS,
  MAX_SIZE,
  MAX_STROKE,
  MIN_FREQ,
  MIN_LAYERS,
  MIN_POINTS,
  MIN_SIZE,
  MIN_STROKE,
  TRANSPARENT,
  clampAngle,
  clampInt,
  clampPct,
  clampSeed,
  clampSize,
  configFromPreset,
  configFromShapePreset,
  exportBlobWave,
  randomizeBlobWave,
  parseBackground,
  parseHandles,
  parseHexParam,
  applyPreviewHandleMove,
  previewHandles,
  serializeBackground,
  serializeHandles,
  toSvgDocument,
  type BlobWaveConfig,
  type BlobWaveExportFormat,
  type BlobWaveFill,
  type BlobWaveMode,
  type BlobWavePreset,
  type BlobWaveShapePreset,
  type WaveEdge,
} from "@/utils/svgBlobWave";
import {
  bool,
  custom,
  enumParam,
  int,
  useToolUrlState,
} from "@/hooks/useToolUrlState";
import { useCopyFeedback } from "@/hooks/tools/useCopyFeedback";

const MODE_IDS = ["blob", "wave"] as const satisfies readonly BlobWaveMode[];
const FILL_IDS = [
  "solid",
  "gradient",
  "outline",
] as const satisfies readonly BlobWaveFill[];
const EDGE_IDS = [
  "top",
  "bottom",
  "both",
] as const satisfies readonly WaveEdge[];
const EXPORT_IDS = [
  "svg",
  "css",
  "clip",
] as const satisfies readonly BlobWaveExportFormat[];

function hexParam(defaultValue: string) {
  return custom(
    defaultValue,
    (raw) => parseHexParam(raw, defaultValue),
    (value) => (value === defaultValue ? null : value.replace(/^#/, "")),
  );
}

function bgParam(defaultValue: string) {
  return custom(
    defaultValue,
    (raw) => parseBackground(raw, defaultValue),
    (value) => serializeBackground(value, defaultValue),
  );
}

export function useSvgBlobWave() {
  const [url, setUrl] = useToolUrlState({
    mode: enumParam<BlobWaveMode>(DEFAULT_MODE, MODE_IDS),
    seed: int(DEFAULT_SEED, { min: 0, max: 999_999_999 }),
    pts: int(DEFAULT_POINTS, { min: MIN_POINTS, max: MAX_POINTS }),
    irr: int(DEFAULT_IRREGULARITY, { min: 0, max: 100 }),
    sm: int(DEFAULT_SMOOTHNESS, { min: 0, max: 100 }),
    ly: int(DEFAULT_LAYERS, { min: MIN_LAYERS, max: MAX_LAYERS }),
    amp: int(DEFAULT_AMPLITUDE, { min: 0, max: 100 }),
    fq: int(DEFAULT_FREQUENCY, { min: MIN_FREQ, max: MAX_FREQ }),
    ph: int(DEFAULT_PHASE, { min: 0, max: 360 }),
    edge: enumParam<WaveEdge>(DEFAULT_EDGE, EDGE_IDS),
    fill: enumParam<BlobWaveFill>(DEFAULT_FILL, FILL_IDS),
    c1: hexParam(DEFAULT_COLOR1),
    c2: hexParam(DEFAULT_COLOR2),
    bg: bgParam(DEFAULT_BACKGROUND),
    w: int(DEFAULT_WIDTH, { min: MIN_SIZE, max: MAX_SIZE }),
    h: int(DEFAULT_HEIGHT, { min: MIN_SIZE, max: MAX_SIZE }),
    a: int(DEFAULT_ANGLE, { min: 0, max: 360 }),
    sw: int(DEFAULT_STROKE, { min: MIN_STROKE, max: MAX_STROKE }),
    an: bool(false),
    export: enumParam<BlobWaveExportFormat>(DEFAULT_EXPORT, EXPORT_IDS),
    hd: custom(
      "",
      (raw) => {
        const parsed = parseHandles(raw);
        return parsed ? serializeHandles(parsed) : "";
      },
      (value) => (value === "" ? null : value),
      { text: true },
    ),
  });

  const { copied, flash } = useCopyFeedback();

  const handles = useMemo(() => parseHandles(url.hd), [url.hd]);

  const config: BlobWaveConfig = useMemo(
    () => ({
      mode: url.mode,
      seed: url.seed,
      points: url.pts,
      irregularity: url.irr,
      smoothness: url.sm,
      layers: url.ly,
      amplitude: url.amp,
      frequency: url.fq,
      phase: url.ph,
      edge: url.edge,
      fill: url.fill,
      color1: url.c1,
      color2: url.c2,
      background: url.bg,
      width: url.w,
      height: url.h,
      angle: url.a,
      strokeWidth: url.sw,
      animate: url.an,
      handles,
    }),
    [url, handles],
  );

  const svg = useMemo(() => toSvgDocument(config), [config]);
  const exportText = useMemo(
    () => exportBlobWave(url.export, config),
    [url.export, config],
  );

  const setMode = (mode: BlobWaveMode) =>
    setUrl((s) => (s.mode === mode ? s : { ...s, mode, hd: "" }));
  const setSeed = (seed: number) => {
    const next = clampSeed(seed);
    setUrl((s) => (s.seed === next ? s : { ...s, seed: next, hd: "" }));
  };
  const setPoints = (pts: number) => {
    const next = clampInt(pts, MIN_POINTS, MAX_POINTS);
    setUrl((s) => (s.pts === next ? s : { ...s, pts: next, hd: "" }));
  };
  const setIrregularity = (irr: number) => {
    const next = clampPct(irr);
    setUrl((s) => (s.irr === next ? s : { ...s, irr: next, hd: "" }));
  };
  const setSmoothness = (sm: number) => {
    const next = clampPct(sm);
    setUrl((s) => (s.sm === next ? s : { ...s, sm: next }));
  };
  const setLayers = (ly: number) => {
    const next = clampInt(ly, MIN_LAYERS, MAX_LAYERS);
    setUrl((s) => (s.ly === next ? s : { ...s, ly: next }));
  };
  const setAmplitude = (amp: number) => {
    const next = clampPct(amp);
    setUrl((s) => (s.amp === next ? s : { ...s, amp: next, hd: "" }));
  };
  const setFrequency = (fq: number) => {
    const next = clampInt(fq, MIN_FREQ, MAX_FREQ);
    setUrl((s) => (s.fq === next ? s : { ...s, fq: next, hd: "" }));
  };
  const setPhase = (ph: number) => {
    const next = clampAngle(ph);
    setUrl((s) => (s.ph === next ? s : { ...s, ph: next, hd: "" }));
  };
  const setEdge = (edge: WaveEdge) =>
    setUrl((s) => (s.edge === edge ? s : { ...s, edge, hd: "" }));
  const setFill = (fill: BlobWaveFill) =>
    setUrl((s) => (s.fill === fill ? s : { ...s, fill }));
  const setColor1 = (c1: string) => {
    const next = parseHexParam(c1, url.c1);
    setUrl((s) => (s.c1 === next ? s : { ...s, c1: next }));
  };
  const setColor2 = (c2: string) => {
    const next = parseHexParam(c2, url.c2);
    setUrl((s) => (s.c2 === next ? s : { ...s, c2: next }));
  };
  const setBackground = (bg: string) => {
    const next = bg === TRANSPARENT ? TRANSPARENT : parseHexParam(bg, url.bg);
    setUrl((s) => (s.bg === next ? s : { ...s, bg: next }));
  };
  const setWidth = (w: number) => {
    const next = clampSize(w);
    setUrl((s) => {
      if (s.w === next) return s;
      const current = parseHandles(s.hd);
      if (!current) return { ...s, w: next };
      const sx = next / s.w;
      return {
        ...s,
        w: next,
        hd: serializeHandles(current.map((p) => ({ x: p.x * sx, y: p.y }))),
      };
    });
  };
  const setHeight = (h: number) => {
    const next = clampSize(h);
    setUrl((s) => {
      if (s.h === next) return s;
      const current = parseHandles(s.hd);
      if (!current) return { ...s, h: next };
      const sy = next / s.h;
      return {
        ...s,
        h: next,
        hd: serializeHandles(current.map((p) => ({ x: p.x, y: p.y * sy }))),
      };
    });
  };
  const setAngle = (a: number) => {
    const next = clampAngle(a);
    setUrl((s) => (s.a === next ? s : { ...s, a: next }));
  };
  const setStrokeWidth = (sw: number) => {
    const next = clampInt(sw, MIN_STROKE, MAX_STROKE);
    setUrl((s) => (s.sw === next ? s : { ...s, sw: next }));
  };
  const setAnimate = (an: boolean) =>
    setUrl((s) => (s.an === an ? s : { ...s, an }));
  const setExportFormat = (format: BlobWaveExportFormat) =>
    setUrl((s) => (s.export === format ? s : { ...s, export: format }));

  const moveHandle = (index: number, x: number, y: number) => {
    const shown = previewHandles(config)[index];
    if (!shown) return;
    if (!config.handles && Math.hypot(x - shown.x, y - shown.y) < 3) return;
    const next = serializeHandles(applyPreviewHandleMove(config, index, x, y));
    setUrl((s) => (s.hd === next ? s : { ...s, hd: next }));
  };

  const handleRandomize = () => {
    setUrl((s) => {
      const next = randomizeBlobWave({
        mode: s.mode,
        width: s.w,
        height: s.h,
        animate: s.an,
      });
      return {
        ...s,
        seed: next.seed,
        pts: next.points,
        irr: next.irregularity,
        sm: next.smoothness,
        ly: next.layers,
        amp: next.amplitude,
        fq: next.frequency,
        ph: next.phase,
        edge: next.edge,
        fill: next.fill,
        c1: next.color1,
        c2: next.color2,
        bg: next.background,
        a: next.angle,
        sw: next.strokeWidth,
        hd: "",
      };
    });
  };

  const handleApplyPreset = (preset: BlobWavePreset) => {
    const next = configFromPreset(preset, { animate: url.an });
    setUrl((s) => ({
      ...s,
      mode: next.mode,
      seed: next.seed,
      pts: next.points,
      irr: next.irregularity,
      sm: next.smoothness,
      ly: next.layers,
      amp: next.amplitude,
      fq: next.frequency,
      ph: next.phase,
      edge: next.edge,
      fill: next.fill,
      c1: next.color1,
      c2: next.color2,
      bg: next.background,
      w: next.width,
      h: next.height,
      a: next.angle,
      sw: next.strokeWidth,
      hd: "",
    }));
  };

  const handleApplyShapePreset = (preset: BlobWaveShapePreset) => {
    const next = configFromShapePreset(preset, config);
    setUrl((s) => ({
      ...s,
      mode: next.mode,
      seed: next.seed,
      pts: next.points,
      irr: next.irregularity,
      sm: next.smoothness,
      ly: next.layers,
      amp: next.amplitude,
      fq: next.frequency,
      ph: next.phase,
      edge: next.edge,
      w: next.width,
      h: next.height,
      hd: "",
    }));
  };

  return {
    config,
    svg,
    exportText,
    exportFormat: url.export,
    copied,
    flash,
    moveHandle,
    setMode,
    setSeed,
    setPoints,
    setIrregularity,
    setSmoothness,
    setLayers,
    setAmplitude,
    setFrequency,
    setPhase,
    setEdge,
    setFill,
    setColor1,
    setColor2,
    setBackground,
    setWidth,
    setHeight,
    setAngle,
    setStrokeWidth,
    setAnimate,
    setExportFormat,
    handleRandomize,
    handleApplyPreset,
    handleApplyShapePreset,
  };
}
