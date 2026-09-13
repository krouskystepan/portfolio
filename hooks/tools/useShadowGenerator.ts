'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_EXPORT,
  DEFAULT_KIND,
  DEFAULT_SAMPLE,
  DEFAULT_SHARE_PARAM,
  DEFAULT_SURFACE,
  EXPORT_FORMATS,
  MAX_LAYERS,
  MIN_LAYERS,
  SHADOW_KINDS,
  SHADOW_SURFACES,
  addLayer,
  clampAlpha,
  clampAlphaPct,
  clampBlur,
  clampOffset,
  clampSpread,
  createDefaultLayers,
  createPlaceholderLayers,
  exportShadow,
  fromHexAlpha,
  layersFromParsed,
  layersFromPreset,
  parseShareParam,
  patchLayer,
  randomizeLayers,
  removeLayer,
  shadowCssValue,
  toShareParam,
  updateLayerHex,
  type ShadowExportFormat,
  type ShadowKind,
  type ShadowLayer,
  type ShadowPreset,
  type ShadowSurface
} from '@/utils/shadowGenerator'
import {
  bool,
  custom,
  enumParam,
  str,
  useToolUrlState
} from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'

const KIND_IDS = SHADOW_KINDS.map((k) => k.id)
const EXPORT_IDS = EXPORT_FORMATS.map((f) => f.id)
const SURFACE_IDS = SHADOW_SURFACES.map((s) => s.id)

export function useShadowGenerator() {
  const [url, setUrl] = useToolUrlState({
    kind: enumParam<ShadowKind>(DEFAULT_KIND, KIND_IDS),
    export: enumParam<ShadowExportFormat>(DEFAULT_EXPORT, EXPORT_IDS),
    sf: enumParam<ShadowSurface>(DEFAULT_SURFACE, SURFACE_IDS),
    ck: bool(false),
    t: str(DEFAULT_SAMPLE, { text: true }),
    l: custom(
      '',
      (raw) => raw ?? '',
      (value) => (value === '' || value === DEFAULT_SHARE_PARAM ? null : value)
    )
  })

  const [layers, setLayers] = useState<ShadowLayer[]>(() => {
    const parsed = url.l ? parseShareParam(url.l) : null
    return parsed ? layersFromParsed(parsed) : createPlaceholderLayers()
  })
  const [hydrated, setHydrated] = useState(false)
  const [hexFocusId, setHexFocusId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')

  const { copied, flash } = useCopyFeedback()

  useEffect(() => {
    const parsed = url.l ? parseShareParam(url.l) : null
    setLayers(parsed ? layersFromParsed(parsed) : createDefaultLayers())
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const share = toShareParam(layers)
    setUrl((s) => {
      const nextL = share === DEFAULT_SHARE_PARAM ? '' : share
      if (s.l === nextL && s.kind === url.kind && s.export === url.export) {
        return s
      }
      return { ...s, l: nextL, kind: url.kind, export: url.export }
    })
  }, [hydrated, layers, url.kind, url.export, setUrl])

  const cssValue = useMemo(
    () => shadowCssValue(url.kind, layers),
    [url.kind, layers]
  )
  const exportText = useMemo(
    () => exportShadow(url.export, url.kind, layers),
    [url.export, url.kind, layers]
  )

  const setKind = (kind: ShadowKind) =>
    setUrl((s) => (s.kind === kind ? s : { ...s, kind }))
  const setExportFormat = (format: ShadowExportFormat) =>
    setUrl((s) => (s.export === format ? s : { ...s, export: format }))
  const setSurface = (sf: ShadowSurface) =>
    setUrl((s) => (s.sf === sf ? s : { ...s, sf }))
  const setChecker = (ck: boolean) =>
    setUrl((s) => (s.ck === ck ? s : { ...s, ck }))
  const setSampleText = (t: string) =>
    setUrl((s) => (s.t === t ? s : { ...s, t }))

  const handleRandomize = () => {
    setLayers(randomizeLayers(url.kind, layers.length))
    setHexFocusId(null)
  }

  const handleApplyPreset = (preset: ShadowPreset) => {
    setLayers(layersFromPreset(preset))
    setHexFocusId(null)
    setUrl((s) => (s.kind === preset.kind ? s : { ...s, kind: preset.kind }))
  }

  const handleAddLayer = () => {
    const next = addLayer(layers)
    if (!next) return
    setLayers(next)
  }

  const handleRemoveLayer = (id: string) => {
    const next = removeLayer(layers, id)
    if (!next) return
    setLayers(next)
    if (hexFocusId === id) setHexFocusId(null)
  }

  const handleLayerHex = (id: string, raw: string) => {
    setLayers((prev) => updateLayerHex(prev, id, raw))
  }

  const handleLayerColor = (id: string, hex8: string) => {
    const parsed = fromHexAlpha(hex8)
    if (!parsed) return
    setLayers((prev) =>
      patchLayer(prev, id, { hex: parsed.hex, alpha: parsed.alpha })
    )
  }

  const handleLayerOffset = (id: string, axis: 'x' | 'y', value: number) => {
    setLayers((prev) =>
      patchLayer(prev, id, { [axis]: clampOffset(value) })
    )
  }

  const handleLayerBlur = (id: string, value: number) => {
    setLayers((prev) => patchLayer(prev, id, { blur: clampBlur(value) }))
  }

  const handleLayerSpread = (id: string, value: number) => {
    setLayers((prev) => patchLayer(prev, id, { spread: clampSpread(value) }))
  }

  const handleLayerAlphaPct = (id: string, value: number) => {
    setLayers((prev) =>
      patchLayer(prev, id, { alpha: clampAlpha(clampAlphaPct(value) / 100) })
    )
  }

  const handleLayerInset = (id: string, inset: boolean) => {
    setLayers((prev) => patchLayer(prev, id, { inset }))
  }

  const beginHexEdit = (id: string, draft: string) => {
    setHexFocusId(id)
    setEditDraft(draft)
  }

  const endHexEdit = () => setHexFocusId(null)

  return {
    kind: url.kind,
    exportFormat: url.export,
    surface: url.sf,
    checker: url.ck,
    sampleText: url.t,
    layers,
    hydrated,
    hexFocusId,
    editDraft,
    copied,
    flash,
    cssValue,
    exportText,
    setKind,
    setExportFormat,
    setSurface,
    setChecker,
    setSampleText,
    setEditDraft,
    handleRandomize,
    handleApplyPreset,
    handleAddLayer,
    handleRemoveLayer,
    handleLayerHex,
    handleLayerColor,
    handleLayerOffset,
    handleLayerBlur,
    handleLayerSpread,
    handleLayerAlphaPct,
    handleLayerInset,
    beginHexEdit,
    endHexEdit,
    MIN_LAYERS,
    MAX_LAYERS
  }
}
