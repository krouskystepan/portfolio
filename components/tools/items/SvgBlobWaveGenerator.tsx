"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { useAchievementContext } from "@/context/AchievementContext";
import ToolLayout from "@/components/tools/_shared/ToolLayout";
import { SecondaryButton } from "@/components/tools/_shared/ToolButtons";
import {
  toolCheckboxLabelClass,
  toolCompactInputClass,
  toolEmptyHintClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolNumberInputClass,
  toolPanelClass,
  toolPickerShellClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel,
} from "@/components/tools/_shared/toolUi";
import { hexToRgb, rgbToHex } from "@/utils/colorUtils";
import {
  BLOB_WAVE_PRESETS,
  BLOB_WAVE_SHAPE_PRESETS,
  EXPORT_FORMATS,
  FILL_MODES,
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
  MODES,
  TRANSPARENT,
  WAVE_EDGES,
  downloadSvgDocument,
  isTransparent,
  presetMatches,
  previewHandles,
  primaryPath,
  roundHandle,
  rasterizeSvgToPng,
  shapePresetMatches,
  triggerDownload,
  type BlobWaveShapePreset,
} from "@/utils/svgBlobWave";
import { useSvgBlobWave } from "@/hooks/tools/useSvgBlobWave";

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="w-24 shrink-0 text-sm font-medium text-neutral-300">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  );
}

function ShapePresetThumb({ preset }: { preset: BlobWaveShapePreset }) {
  const d = primaryPath({
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
    fill: "solid",
    color1: "#ffffff",
    color2: "#ffffff",
    background: TRANSPARENT,
    width: preset.width,
    height: preset.height,
    angle: 0,
    strokeWidth: 8,
    animate: false,
    handles: null,
  });
  return (
    <svg
      viewBox={`0 0 ${preset.width} ${preset.height}`}
      className={
        preset.mode === "wave" ? "h-6 w-10 shrink-0" : "size-6 shrink-0"
      }
      aria-hidden
    >
      <path d={d} fill="currentColor" className="text-white/80" />
    </svg>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <ControlRow label={label}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="hidden min-w-0 flex-1 cursor-pointer accent-custom_blue sm:block"
        aria-label={label}
      />
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          if (!Number.isFinite(n)) return;
          onChange(n);
        }}
        className={`${toolNumberInputClass} !w-[3.75rem] max-w-[3.75rem]`}
        aria-label={`${label} value`}
      />
      {suffix ? <span className={toolHintMetaClass}>{suffix}</span> : null}
    </ControlRow>
  );
}

const PICKER_W = 260;
const PICKER_H = 292;

function placePicker(anchor: DOMRect) {
  const pad = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = anchor.right + pad;
  if (left + PICKER_W > vw - pad) left = anchor.left - PICKER_W - pad;
  if (left < pad) left = pad;
  let top = anchor.top;
  if (top + PICKER_H > vh - pad) top = vh - PICKER_H - pad;
  if (top < pad) top = pad;
  return { top, left };
}

function ColorSwatch({
  hex,
  label,
  open,
  onToggle,
  onClose,
  onChange,
  checker = false,
}: {
  hex: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onChange: (hex: string) => void;
  checker?: boolean;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [draft, setDraft] = useState(hex);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = btnRef.current;
      if (!el) return;
      setCoords(placePicker(el.getBoundingClientRect()));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    setDraft(hex);
  }, [hex]);

  const commitDraft = (raw: string) => {
    const value = raw.trim();
    const rgb = hexToRgb(value.startsWith("#") ? value : `#${value}`);
    if (rgb) onChange(rgbToHex(rgb.r, rgb.g, rgb.b).toLowerCase());
  };

  return (
    <div className="flex items-center gap-2">
      <button
        ref={btnRef}
        type="button"
        title="Pick color"
        aria-label={label}
        aria-expanded={open}
        className={`size-8 shrink-0 rounded-md border border-white/20 shadow-inner ${
          checker ? checkerboardClass : ""
        }`}
        style={checker ? undefined : { backgroundColor: hex }}
        onClick={onToggle}
      />
      <input
        type="text"
        value={checker ? "" : draft}
        placeholder="#rrggbb"
        aria-label={`${label} hex`}
        title="Edit hex"
        spellCheck={false}
        autoComplete="off"
        className={`${toolCompactInputClass} !w-[7.25rem] max-w-[7.25rem] shrink-0 font-mono tracking-wide`}
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          commitDraft(v);
        }}
        onBlur={() => commitDraft(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(hex);
            e.currentTarget.blur();
          }
        }}
      />
      {open &&
        createPortal(
          <div
            ref={panelRef}
            className={`fixed z-[200] w-[260px] shadow-2xl ${toolPickerShellClass} !bg-neutral-900`}
            style={{ top: coords.top, left: coords.left }}
          >
            <HexColorPicker color={hex} onChange={onChange} />
          </div>,
          document.body,
        )}
    </div>
  );
}

const checkerboardClass =
  "bg-neutral-800 bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] bg-[linear-gradient(45deg,#2a2a2a_25%,transparent_25%),linear-gradient(-45deg,#2a2a2a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#2a2a2a_75%),linear-gradient(-45deg,transparent_75%,#2a2a2a_75%)]";

function clientToViewBox(svg: SVGSVGElement, clientX: number, clientY: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: pt.x, y: pt.y };
}

function ShapePreview({
  svg,
  config,
  transparentBg,
  onMoveHandle,
}: {
  svg: string;
  config: Parameters<typeof previewHandles>[0];
  transparentBg: boolean;
  onMoveHandle: (index: number, x: number, y: number) => void;
}) {
  const overlayRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    index: number;
    startX: number;
    startY: number;
    grabX: number;
    grabY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const handles = previewHandles(config);
  const unlocked = Boolean(config.handles);
  const r = roundHandle(
    Math.max(8, Math.min(config.width, config.height) * 0.018),
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
      if (!drag.moved && dist < 10) return;
      drag.moved = true;
      e.preventDefault();
      const el = overlayRef.current;
      if (!el) return;
      const pt = clientToViewBox(el, e.clientX, e.clientY);
      if (!pt) return;
      onMoveHandle(
        drag.index,
        pt.x + (drag.grabX - drag.originX),
        pt.y + (drag.grabY - drag.originY),
      );
    };
    const onUp = () => {
      dragRef.current = null;
      setActive(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [onMoveHandle]);

  const onHandleDown = (index: number, e: ReactPointerEvent<SVGGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const el = overlayRef.current;
    const handle = handles[index];
    if (!el || !handle) return;
    const pt = clientToViewBox(el, e.clientX, e.clientY);
    if (!pt) return;
    dragRef.current = {
      index,
      startX: e.clientX,
      startY: e.clientY,
      grabX: handle.x,
      grabY: handle.y,
      originX: pt.x,
      originY: pt.y,
      moved: false,
    };
    setActive(index);
  };

  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-3 sm:p-4">
      <p className={toolHintMetaClass}>
        {unlocked
          ? `Preview · ${config.width}×${config.height} - unlocked from seed, drag to reshape`
          : `Preview · ${config.width}×${config.height} - seeded. Drag a dot to unlock; the shape stays until you move.`}
      </p>
      <div
        className={`relative mx-auto mt-3 h-64 w-full overflow-hidden rounded-xl sm:h-72 md:h-80 ${
          transparentBg ? checkerboardClass : ""
        }`}
        style={
          transparentBg ? undefined : { backgroundColor: config.background }
        }
      >
        <div
          className="pointer-events-none absolute inset-0 [&_svg]:block [&_svg]:size-full"
          aria-hidden
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <svg
          ref={overlayRef}
          viewBox={`0 0 ${config.width} ${config.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute inset-0 size-full touch-none"
          aria-label={
            unlocked
              ? "Unlocked from seed - drag the dots to reshape"
              : "Seeded shape - drag a dot to unlock and reshape"
          }
          role="img"
        >
          {handles.map((p, i) => (
            <g
              key={i}
              className="cursor-grab touch-none"
              style={{ pointerEvents: "all" }}
              onPointerDown={(e) => onHandleDown(i, e)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={roundHandle(r * 2.4)}
                fill="transparent"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={active === i ? roundHandle(r * 1.25) : r}
                fill={active === i ? "#4169e1" : "#fff"}
                stroke="#4169e1"
                strokeWidth={roundHandle(r * 0.28)}
              >
                <title>
                  {unlocked
                    ? "Drag to reshape"
                    : "Drag to unlock the seed and reshape"}
                </title>
              </circle>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function SvgBlobWaveGeneratorInner() {
  const { unlockAchievement } = useAchievementContext();
  const {
    config,
    svg,
    exportText,
    exportFormat,
    copied,
    flash,
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
    moveHandle,
  } = useSvgBlobWave();

  const [pickerId, setPickerId] = useState<string | null>(null);
  const [pngBusy, setPngBusy] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    flash(key);
    unlockAchievement("clipboard-master");
  };

  const handleDownloadSvg = () => {
    downloadSvgDocument(svg);
  };

  const handleDownloadPng = async () => {
    if (pngBusy) return;
    setPngBusy(true);
    try {
      const blob = await rasterizeSvgToPng(svg, config.width, config.height);
      triggerDownload(blob, "blob-wave.png");
    } catch {
      // Keep the tool usable if canvas encode fails
    } finally {
      setPngBusy(false);
    }
  };

  const transparentBg = isTransparent(config.background);
  const showSecondColor = config.fill === "gradient";
  const showStroke = config.fill === "outline";
  const showAngle = config.fill === "gradient";

  return (
    <ToolLayout title="SVG blob / wave generator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Organic blobs and hero waves as copy-paste SVG. The seed draws the
            starting silhouette. Drag a dot to unlock it and reshape - the SVG
            keeps that outline until you actually move. Shape presets change
            only the silhouette; look presets bring colors too. Randomize rolls
            a new shape, fill, and colors. Transparent export drops into OBS
            browser sources, and the URL stays in sync.
          </p>
        }
      >
        <div className="space-y-4">
          <ControlRow label="Mode">
            <ToolChipRow>
              {MODES.map((m) => (
                <ToolChipButton
                  key={m.id}
                  active={config.mode === m.id}
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                </ToolChipButton>
              ))}
            </ToolChipRow>
            <div className="ml-auto">
              <SecondaryButton onClick={handleRandomize}>
                Randomize
              </SecondaryButton>
            </div>
          </ControlRow>

          <ControlRow label="Shape">
            {BLOB_WAVE_SHAPE_PRESETS.map((preset) => {
              const active = shapePresetMatches(preset, config);
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.hint}
                  onClick={() => handleApplyShapePreset(preset)}
                  className={`flex h-10 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-neutral-100 transition ${
                    active
                      ? "ring-2 ring-white/70 bg-white/10"
                      : "ring-1 ring-white/15 hover:ring-white/35"
                  }`}
                >
                  <ShapePresetThumb preset={preset} />
                  {preset.label}
                </button>
              );
            })}
          </ControlRow>

          <ControlRow label="Look">
            {BLOB_WAVE_PRESETS.map((preset) => {
              const active = presetMatches(preset, config);
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.hint}
                  onClick={() => handleApplyPreset(preset)}
                  className={`h-8 min-w-[4.75rem] rounded-md px-2.5 text-xs font-medium text-white transition [text-shadow:0_1px_2px_rgb(0_0_0_/_75%)] ${
                    active
                      ? "ring-2 ring-white/70"
                      : "ring-1 ring-white/15 hover:ring-white/35"
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`,
                    backgroundColor: isTransparent(preset.background)
                      ? undefined
                      : preset.background,
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
          </ControlRow>
        </div>
      </ToolInputPanel>

      <ShapePreview
        svg={svg}
        config={config}
        transparentBg={transparentBg}
        onMoveHandle={moveHandle}
      />

      <div className={toolPanelClass}>
        <h3 className={`${toolSectionTitleClass} mb-4`}>Controls</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-x-3 gap-y-2">
            <span className="w-24 shrink-0 pt-1.5 text-sm font-medium text-neutral-300">
              Seed
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={config.seed}
                  onChange={(e) => {
                    const n = Number.parseInt(e.target.value, 10);
                    if (!Number.isFinite(n)) return;
                    setSeed(n);
                  }}
                  className={`${toolNumberInputClass} !max-w-36`}
                  aria-label="Shape seed"
                  title={
                    config.handles
                      ? "Unlocked - changing seed generates a new shape"
                      : "Shape seed"
                  }
                />
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    config.handles
                      ? "bg-amber-400/15 text-amber-200"
                      : "bg-white/10 text-neutral-300"
                  }`}
                >
                  {config.handles ? "Unlocked" : "Seeded"}
                </span>
              </div>
              <p className={toolHintMetaClass}>
                {config.handles
                  ? "Dragging froze this silhouette. Seed no longer drives the path — change the seed or Randomize to generate again."
                  : "Drag a dot to unlock this seed. Clicking without moving leaves the SVG as-is."}
              </p>
            </div>
          </div>

          {config.mode === "blob" ? (
            <>
              <SliderField
                label="Points"
                value={config.points}
                min={MIN_POINTS}
                max={MAX_POINTS}
                onChange={setPoints}
              />
              <SliderField
                label="Irregularity"
                value={config.irregularity}
                min={0}
                max={100}
                onChange={setIrregularity}
              />
              <SliderField
                label="Smoothness"
                value={config.smoothness}
                min={0}
                max={100}
                onChange={setSmoothness}
              />
            </>
          ) : (
            <>
              <SliderField
                label="Amplitude"
                value={config.amplitude}
                min={0}
                max={100}
                onChange={setAmplitude}
              />
              <SliderField
                label="Frequency"
                value={config.frequency}
                min={MIN_FREQ}
                max={MAX_FREQ}
                onChange={setFrequency}
              />
              <SliderField
                label="Phase"
                value={config.phase}
                min={0}
                max={360}
                onChange={setPhase}
                suffix="°"
              />
              <ControlRow label="Edge">
                <ToolChipRow>
                  {WAVE_EDGES.map((e) => (
                    <ToolChipButton
                      key={e.id}
                      active={config.edge === e.id}
                      onClick={() => setEdge(e.id)}
                    >
                      {e.label}
                    </ToolChipButton>
                  ))}
                </ToolChipRow>
              </ControlRow>
            </>
          )}

          <SliderField
            label="Layers"
            value={config.layers}
            min={MIN_LAYERS}
            max={MAX_LAYERS}
            onChange={setLayers}
          />

          <ControlRow label="Fill">
            <ToolChipRow>
              {FILL_MODES.map((f) => (
                <ToolChipButton
                  key={f.id}
                  active={config.fill === f.id}
                  onClick={() => setFill(f.id)}
                >
                  {f.label}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </ControlRow>

          <ControlRow label={showStroke ? "Stroke" : "Color"}>
            <ColorSwatch
              hex={config.color1}
              label={showStroke ? "Stroke color" : "Fill color"}
              open={pickerId === "c1"}
              onToggle={() => setPickerId((id) => (id === "c1" ? null : "c1"))}
              onClose={() => setPickerId(null)}
              onChange={setColor1}
            />
            {showSecondColor ? (
              <ColorSwatch
                hex={config.color2}
                label="Gradient end color"
                open={pickerId === "c2"}
                onToggle={() =>
                  setPickerId((id) => (id === "c2" ? null : "c2"))
                }
                onClose={() => setPickerId(null)}
                onChange={setColor2}
              />
            ) : null}
          </ControlRow>

          {showAngle ? (
            <SliderField
              label="Angle"
              value={config.angle}
              min={0}
              max={360}
              onChange={setAngle}
              suffix="°"
            />
          ) : null}

          {showStroke ? (
            <SliderField
              label="Stroke"
              value={config.strokeWidth}
              min={MIN_STROKE}
              max={MAX_STROKE}
              onChange={setStrokeWidth}
              suffix="px"
            />
          ) : null}

          <ControlRow label="Background">
            <ToolChipButton
              active={transparentBg}
              onClick={() => setBackground(TRANSPARENT)}
            >
              Transparent
            </ToolChipButton>
            <ColorSwatch
              hex={transparentBg ? "#0d1117" : config.background}
              label="Background color"
              open={pickerId === "bg"}
              onToggle={() => setPickerId((id) => (id === "bg" ? null : "bg"))}
              onClose={() => setPickerId(null)}
              onChange={setBackground}
              checker={transparentBg}
            />
          </ControlRow>

          <ControlRow label="Size">
            <label className="flex items-center gap-1.5">
              <span className={toolHintMetaClass}>W</span>
              <input
                type="number"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={config.width}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10);
                  if (!Number.isFinite(n)) return;
                  setWidth(n);
                }}
                className={`${toolNumberInputClass} !w-[4.25rem] max-w-[4.25rem]`}
                aria-label="ViewBox width"
              />
            </label>
            <label className="flex items-center gap-1.5">
              <span className={toolHintMetaClass}>H</span>
              <input
                type="number"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={config.height}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10);
                  if (!Number.isFinite(n)) return;
                  setHeight(n);
                }}
                className={`${toolNumberInputClass} !w-[4.25rem] max-w-[4.25rem]`}
                aria-label="ViewBox height"
              />
            </label>
          </ControlRow>

          <ControlRow label="Motion">
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={config.animate}
                onChange={() => setAnimate(!config.animate)}
                className="size-4 accent-custom_blue"
              />
              Animate (SMIL morph in the exported SVG)
            </label>
          </ControlRow>
        </div>
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h3 className={toolSectionTitleClass}>Export</h3>
          <div className="flex flex-wrap justify-end gap-2">
            <SecondaryButton onClick={handleDownloadSvg}>
              Download SVG
            </SecondaryButton>
            <SecondaryButton onClick={handleDownloadPng} disabled={pngBusy}>
              {pngBusy ? "Rendering…" : "Download PNG"}
            </SecondaryButton>
            <ToolCopyButton
              copied={copied === "export"}
              onClick={() => handleCopy(exportText, "export")}
            />
          </div>
        </div>
        <ToolChipRow className="mb-3">
          {EXPORT_FORMATS.map((f) => (
            <ToolChipButton
              key={f.id}
              active={exportFormat === f.id}
              onClick={() => setExportFormat(f.id)}
            >
              {f.label}
            </ToolChipButton>
          ))}
        </ToolChipRow>
        {exportFormat === "clip" ? (
          <p className={`${toolHintMetaClass} mb-3`}>
            CSS <code>path()</code> uses these coordinates as pixels and does
            not scale with the box. Size the element to the viewBox, or use the
            SVG as a mask instead.
          </p>
        ) : null}
        <pre className={toolPreOutputClass}>{exportText}</pre>
      </div>
    </ToolLayout>
  );
}

const SvgBlobWaveGenerator = () => (
  <Suspense
    fallback={
      <ToolLayout title="SVG blob / wave generator">
        <p className={toolEmptyHintClass}>Loading blob / wave…</p>
      </ToolLayout>
    }
  >
    <SvgBlobWaveGeneratorInner />
  </Suspense>
);

export default SvgBlobWaveGenerator;
