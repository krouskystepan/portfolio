'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_ANGLE,
  DEFAULT_POS,
  DEFAULT_SHAPE,
  DEFAULT_SHARE_PARAM,
  DEFAULT_SIZE,
  DEFAULT_TYPE,
  EXPORT_FORMATS,
  MAX_STOPS,
  MIN_STOPS,
  RADIAL_SIZES,
  addStop,
  clampAngle,
  clampPosition,
  createDefaultStops,
  createPlaceholderStops,
  exportGradient,
  gradientCssValue,
  gradientFromPreset,
  nudgePositionForRadialSize,
  parseShareParam,
  randomizeStops,
  removeStop,
  stopsFromParsed,
  toShareParam,
  updateStopHex,
  updateStopPosition,
  type Gradient,
  type GradientExportFormat,
  type GradientPreset,
  type GradientStop,
  type GradientType,
  type RadialShape,
  type RadialSize,
} from '@/utils/gradientGenerator'
import {
  bool,
  custom,
  enumParam,
  int,
  useToolUrlState,
} from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'

const TYPE_IDS = [
  'linear',
  'radial',
  'conic',
] as const satisfies readonly GradientType[]
const SHAPE_IDS = [
  'circle',
  'ellipse',
] as const satisfies readonly RadialShape[]
const SIZE_IDS = RADIAL_SIZES.map((s) => s.id)
const EXPORT_IDS = EXPORT_FORMATS.map((f) => f.id)

export function useGradientGenerator() {
  const [url, setUrl] = useToolUrlState({
    type: enumParam<GradientType>(DEFAULT_TYPE, TYPE_IDS),
    repeating: bool(false),
    angle: int(DEFAULT_ANGLE, { min: 0, max: 360 }),
    shape: enumParam<RadialShape>(DEFAULT_SHAPE, SHAPE_IDS),
    size: enumParam<RadialSize>(DEFAULT_SIZE, SIZE_IDS),
    x: int(DEFAULT_POS, { min: 0, max: 100 }),
    y: int(DEFAULT_POS, { min: 0, max: 100 }),
    export: enumParam<GradientExportFormat>('css', EXPORT_IDS),
    s: custom(
      '',
      (raw) => raw ?? '',
      (value) => (value === '' || value === DEFAULT_SHARE_PARAM ? null : value)
    ),
  })

  const [stops, setStops] = useState<GradientStop[]>(createPlaceholderStops)
  const [hydrated, setHydrated] = useState(false)
  const [hexFocusId, setHexFocusId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  const { copied, flash } = useCopyFeedback()

  useEffect(() => {
    const parsed = url.s ? parseShareParam(url.s) : null
    setStops(parsed ? stopsFromParsed(parsed) : createDefaultStops())
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const share = toShareParam(stops)
    setUrl((s) => {
      const nextS = share === DEFAULT_SHARE_PARAM ? '' : share
      if (
        s.s === nextS &&
        s.type === url.type &&
        s.repeating === url.repeating &&
        s.angle === url.angle &&
        s.shape === url.shape &&
        s.size === url.size &&
        s.x === url.x &&
        s.y === url.y &&
        s.export === url.export
      ) {
        return s
      }
      return {
        ...s,
        s: nextS,
        type: url.type,
        repeating: url.repeating,
        angle: url.angle,
        shape: url.shape,
        size: url.size,
        x: url.x,
        y: url.y,
        export: url.export,
      }
    })
  }, [
    hydrated,
    stops,
    url.type,
    url.repeating,
    url.angle,
    url.shape,
    url.size,
    url.x,
    url.y,
    url.export,
    setUrl,
  ])

  const gradient: Gradient = useMemo(
    () => ({
      type: url.type,
      repeating: url.repeating,
      angle: url.angle,
      shape: url.shape,
      size: url.size,
      posX: url.x,
      posY: url.y,
      stops,
    }),
    [
      url.type,
      url.repeating,
      url.angle,
      url.shape,
      url.size,
      url.x,
      url.y,
      stops,
    ]
  )

  const cssValue = useMemo(() => gradientCssValue(gradient), [gradient])
  const exportText = useMemo(
    () => exportGradient(url.export, gradient),
    [url.export, gradient]
  )

  const setType = (type: GradientType) =>
    setUrl((s) => (s.type === type ? s : { ...s, type }))
  const setRepeating = (repeating: boolean) =>
    setUrl((s) => (s.repeating === repeating ? s : { ...s, repeating }))
  const setAngle = (angle: number) => {
    const next = clampAngle(angle)
    setUrl((s) => (s.angle === next ? s : { ...s, angle: next }))
  }
  const setShape = (shape: RadialShape) =>
    setUrl((s) => (s.shape === shape ? s : { ...s, shape }))
  const setSize = (size: RadialSize) => {
    setUrl((s) => {
      const pos = nudgePositionForRadialSize(size, s.x, s.y)
      if (s.size === size && s.x === pos.x && s.y === pos.y) return s
      return { ...s, size, x: pos.x, y: pos.y }
    })
  }
  const setPosX = (x: number) => {
    const next = clampPosition(x)
    setUrl((s) => (s.x === next ? s : { ...s, x: next }))
  }
  const setPosY = (y: number) => {
    const next = clampPosition(y)
    setUrl((s) => (s.y === next ? s : { ...s, y: next }))
  }
  const setPosition = (x: number, y: number) => {
    const next =
      url.type === 'radial'
        ? nudgePositionForRadialSize(url.size, x, y)
        : { x: clampPosition(x), y: clampPosition(y) }
    setUrl((s) =>
      s.x === next.x && s.y === next.y ? s : { ...s, x: next.x, y: next.y }
    )
  }
  const setExportFormat = (format: GradientExportFormat) =>
    setUrl((s) => (s.export === format ? s : { ...s, export: format }))

  const handleRandomize = () => {
    setStops(randomizeStops(stops.length))
    setHexFocusId(null)
  }

  const handleApplyPreset = (preset: GradientPreset) => {
    const next = gradientFromPreset(preset)
    setStops(next.stops)
    setHexFocusId(null)
    setUrl((s) => ({
      ...s,
      type: next.type,
      repeating: next.repeating,
      angle: next.angle,
      shape: next.shape,
      size: next.size,
      x: next.posX,
      y: next.posY,
    }))
  }

  const handleAddStop = () => {
    const next = addStop(stops)
    if (!next) return
    setStops(next)
  }

  const handleRemoveStop = (id: string) => {
    const next = removeStop(stops, id)
    if (!next) return
    setStops(next)
    if (hexFocusId === id) setHexFocusId(null)
  }

  const handleStopHex = (id: string, raw: string) => {
    setStops((prev) => updateStopHex(prev, id, raw))
  }

  const handleStopPosition = (id: string, position: number) => {
    setStops((prev) => updateStopPosition(prev, id, position))
  }

  const beginHexEdit = (id: string, draft: string) => {
    setHexFocusId(id)
    setEditDraft(draft)
  }

  const endHexEdit = () => setHexFocusId(null)

  return {
    type: url.type,
    repeating: url.repeating,
    angle: url.angle,
    shape: url.shape,
    size: url.size,
    posX: url.x,
    posY: url.y,
    exportFormat: url.export,
    stops,
    hydrated,
    hexFocusId,
    editDraft,
    copied,
    flash,
    cssValue,
    exportText,
    setType,
    setRepeating,
    setAngle,
    setShape,
    setSize,
    setPosX,
    setPosY,
    setPosition,
    setExportFormat,
    setEditDraft,
    handleRandomize,
    handleApplyPreset,
    handleAddStop,
    handleRemoveStop,
    handleStopHex,
    handleStopPosition,
    beginHexEdit,
    endHexEdit,
    MIN_STOPS,
    MAX_STOPS,
  }
}
