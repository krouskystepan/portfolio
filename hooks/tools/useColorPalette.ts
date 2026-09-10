'use client'

import { useEffect, useReducer, useRef } from 'react'
import {
  BLINDNESS_MODES,
  DEFAULT_PALETTE_COUNT,
  HARMONY_MODES,
  MAX_PALETTE,
  MIN_PALETTE,
  createPlaceholderPalette,
  generatePalette,
  insertMidpointBetween,
  makePaletteColor,
  parseShareParam,
  regenerateUnlocked,
  removeColorAt,
  toShareParam,
  type BlindnessMode,
  type ExportFormat,
  type HarmonyMode,
  type PaletteColor
} from '@/utils/paletteGenerator'
import { hexToRgb, rgbToHex } from '@/utils/colorUtils'
import {
  custom,
  enumParam,
  int,
  useToolUrlState
} from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'

const HARMONY_IDS = HARMONY_MODES.map((m) => m.id)
const BLINDNESS_IDS = BLINDNESS_MODES.map((m) => m.id)
const EXPORT_IDS = [
  'css',
  'tailwind',
  'json',
  'svg',
  'hex'
] as const satisfies readonly ExportFormat[]

const HISTORY_CAP = 50

function clonePalette(colors: PaletteColor[]): PaletteColor[] {
  return colors.map((c) => ({ ...c }))
}

function colorsEqual(a: PaletteColor[], b: PaletteColor[]) {
  if (a.length !== b.length) return false
  return a.every(
    (c, i) =>
      c.id === b[i].id && c.hex === b[i].hex && c.locked === b[i].locked
  )
}

export type ColorPaletteState = {
  mode: HarmonyMode
  count: number
  colors: PaletteColor[]
  blindness: BlindnessMode
  exportFormat: ExportFormat
  past: PaletteColor[][]
  future: PaletteColor[][]
  selectedIndex: number
  hexFocusIndex: number | null
  pickerIndex: number | null
  editDraft: string
  draggingId: string | null
  hydrated: boolean
  motionReady: boolean
}

type Action =
  | { type: 'hydrate'; colors: PaletteColor[]; count: number }
  | { type: 'setMotionReady' }
  | { type: 'setMode'; mode: HarmonyMode }
  | { type: 'setBlindness'; blindness: BlindnessMode }
  | { type: 'setExportFormat'; format: ExportFormat }
  | {
      type: 'commit'
      colors: PaletteColor[]
      recordHistory?: boolean
      selectedIndex?: number
      clearEditUi?: boolean
    }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'setCountAndGenerate'; count: number }
  | { type: 'select'; index: number }
  | {
      type: 'beginHexEdit'
      index: number
      draft: string
    }
  | { type: 'setEditDraft'; draft: string }
  | { type: 'endHexEdit' }
  | { type: 'setPickerIndex'; index: number | null }
  | { type: 'openPicker'; index: number; draft: string }
  | { type: 'setDragging'; id: string | null }
  | {
      type: 'reorder'
      colors: PaletteColor[]
      selectedIndex: number
      hexFocusIndex: number | null
    }
  | { type: 'finishReorder'; snapshot: PaletteColor[] | null }
  | { type: 'setSwatchHex'; index: number; hex: string; recordHistory: boolean }

function initialState(
  mode: HarmonyMode,
  count: number,
  blindness: BlindnessMode,
  exportFormat: ExportFormat
): ColorPaletteState {
  return {
    mode,
    count,
    colors: createPlaceholderPalette(DEFAULT_PALETTE_COUNT),
    blindness,
    exportFormat,
    past: [],
    future: [],
    selectedIndex: 0,
    hexFocusIndex: null,
    pickerIndex: null,
    editDraft: '',
    draggingId: null,
    hydrated: false,
    motionReady: false
  }
}

function pushHistory(
  past: PaletteColor[][],
  colors: PaletteColor[]
): PaletteColor[][] {
  return [...past, clonePalette(colors)].slice(-HISTORY_CAP)
}

function reducer(state: ColorPaletteState, action: Action): ColorPaletteState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        colors: action.colors,
        count: action.count,
        selectedIndex: 0,
        hydrated: true
      }
    case 'setMotionReady':
      return { ...state, motionReady: true }
    case 'setMode':
      return { ...state, mode: action.mode }
    case 'setBlindness':
      return { ...state, blindness: action.blindness }
    case 'setExportFormat':
      return { ...state, exportFormat: action.format }
    case 'commit': {
      const record = action.recordHistory !== false
      const nextPast =
        record && !colorsEqual(state.colors, action.colors)
          ? pushHistory(state.past, state.colors)
          : state.past
      const nextFuture =
        record && !colorsEqual(state.colors, action.colors) ? [] : state.future
      return {
        ...state,
        past: nextPast,
        future: nextFuture,
        colors: action.colors,
        count: action.colors.length,
        selectedIndex:
          action.selectedIndex !== undefined
            ? action.selectedIndex
            : Math.min(state.selectedIndex, action.colors.length - 1),
        ...(action.clearEditUi
          ? { hexFocusIndex: null, pickerIndex: null }
          : {})
      }
    }
    case 'undo': {
      if (state.past.length === 0) return state
      const prev = state.past[state.past.length - 1]
      return {
        ...state,
        past: state.past.slice(0, -1),
        future: [clonePalette(state.colors), ...state.future].slice(
          0,
          HISTORY_CAP
        ),
        colors: clonePalette(prev),
        count: prev.length,
        selectedIndex: Math.min(state.selectedIndex, prev.length - 1)
      }
    }
    case 'redo': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        ...state,
        future: state.future.slice(1),
        past: pushHistory(state.past, state.colors),
        colors: clonePalette(next),
        count: next.length,
        selectedIndex: Math.min(state.selectedIndex, next.length - 1)
      }
    }
    case 'setCountAndGenerate': {
      const n = Math.min(MAX_PALETTE, Math.max(MIN_PALETTE, action.count))
      const colors = generatePalette({
        count: n,
        mode: state.mode,
        existing: state.colors
      })
      const record = !colorsEqual(state.colors, colors)
      return {
        ...state,
        count: n,
        colors,
        past: record ? pushHistory(state.past, state.colors) : state.past,
        future: record ? [] : state.future,
        selectedIndex: Math.min(state.selectedIndex, colors.length - 1)
      }
    }
    case 'select':
      return { ...state, selectedIndex: action.index }
    case 'beginHexEdit':
      return {
        ...state,
        selectedIndex: action.index,
        past: pushHistory(state.past, state.colors),
        future: [],
        editDraft: action.draft,
        hexFocusIndex: action.index
      }
    case 'setEditDraft':
      return { ...state, editDraft: action.draft }
    case 'endHexEdit':
      return { ...state, hexFocusIndex: null }
    case 'setPickerIndex':
      return { ...state, pickerIndex: action.index }
    case 'openPicker':
      return {
        ...state,
        selectedIndex: action.index,
        editDraft: action.draft,
        pickerIndex: action.index
      }
    case 'setDragging':
      return { ...state, draggingId: action.id }
    case 'reorder':
      return {
        ...state,
        colors: action.colors,
        count: action.colors.length,
        selectedIndex: action.selectedIndex,
        hexFocusIndex: action.hexFocusIndex
      }
    case 'finishReorder': {
      const snapshot = action.snapshot
      if (!snapshot || colorsEqual(snapshot, state.colors)) {
        return { ...state, draggingId: null }
      }
      return {
        ...state,
        draggingId: null,
        past: pushHistory(state.past, snapshot),
        future: []
      }
    }
    case 'setSwatchHex': {
      const colors = state.colors.map((c, i) =>
        i === action.index ? { ...c, hex: action.hex } : c
      )
      if (colorsEqual(state.colors, colors)) return state
      return {
        ...state,
        colors,
        past: action.recordHistory
          ? pushHistory(state.past, state.colors)
          : state.past,
        future: action.recordHistory ? [] : state.future
      }
    }
    default:
      return state
  }
}

export function useColorPalette() {
  const [url, setUrl] = useToolUrlState({
    c: custom(
      '',
      (raw) => raw ?? '',
      (value) => (value === '' ? null : value)
    ),
    mode: enumParam<HarmonyMode>('random', HARMONY_IDS),
    n: int(DEFAULT_PALETTE_COUNT, { min: MIN_PALETTE, max: MAX_PALETTE }),
    blind: enumParam<BlindnessMode>('none', BLINDNESS_IDS),
    export: enumParam<ExportFormat>('css', EXPORT_IDS)
  })

  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => initialState(url.mode, url.n, url.blind, url.export)
  )

  const { copied, flash } = useCopyFeedback()

  const editPanelRef = useRef<HTMLDivElement>(null)
  const colorsRef = useRef(state.colors)
  const modeRef = useRef(state.mode)
  const selectedIndexRef = useRef(state.selectedIndex)
  const hexFocusIndexRef = useRef(state.hexFocusIndex)
  const dragSnapshotRef = useRef<PaletteColor[] | null>(null)
  colorsRef.current = state.colors
  modeRef.current = state.mode
  selectedIndexRef.current = state.selectedIndex
  hexFocusIndexRef.current = state.hexFocusIndex

  // Keep durable URL fields in sync with reducer (mode/blind/export from URL hydrate once;
  // colors/count write back after hydrate).
  useEffect(() => {
    if (!state.hydrated) return
    const share = toShareParam(state.colors.map((c) => c.hex))
    setUrl((s) => {
      if (
        s.c === share &&
        s.n === state.count &&
        s.mode === state.mode &&
        s.blind === state.blindness &&
        s.export === state.exportFormat
      ) {
        return s
      }
      return {
        ...s,
        c: share,
        n: state.count,
        mode: state.mode,
        blind: state.blindness,
        export: state.exportFormat
      }
    })
  }, [
    state.hydrated,
    state.colors,
    state.count,
    state.mode,
    state.blindness,
    state.exportFormat,
    setUrl
  ])

  // Client-only: restore ?c= or generate a random palette.
  useEffect(() => {
    const parsed = url.c ? parseShareParam(url.c) : null
    if (parsed) {
      dispatch({
        type: 'hydrate',
        colors: parsed.map((hex) => makePaletteColor(hex)),
        count: parsed.length
      })
      return
    }
    const generated = generatePalette({
      count: url.n,
      mode: url.mode
    })
    dispatch({
      type: 'hydrate',
      colors: generated,
      count: generated.length
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, [])

  useEffect(() => {
    if (!state.hydrated) return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => dispatch({ type: 'setMotionReady' }))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [state.hydrated])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable
      ) {
        return
      }
      if (e.code === 'Space') {
        e.preventDefault()
        dispatch({
          type: 'commit',
          colors: regenerateUnlocked(colorsRef.current, modeRef.current)
        })
      }
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault()
        const idx = selectedIndexRef.current
        dispatch({
          type: 'commit',
          colors: colorsRef.current.map((c, i) =>
            i === idx ? { ...c, locked: !c.locked } : c
          )
        })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (state.pickerIndex === null) return
    const onPointer = (e: MouseEvent) => {
      if (
        editPanelRef.current &&
        !editPanelRef.current.contains(e.target as Node)
      ) {
        dispatch({ type: 'setPickerIndex', index: null })
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [state.pickerIndex])

  const commitColors = (
    next: PaletteColor[],
    opts?: { recordHistory?: boolean; selectedIndex?: number; clearEditUi?: boolean }
  ) => {
    dispatch({
      type: 'commit',
      colors: next,
      recordHistory: opts?.recordHistory,
      selectedIndex: opts?.selectedIndex,
      clearEditUi: opts?.clearEditUi
    })
  }

  const setSwatchHex = (index: number, raw: string, recordHistory = false) => {
    let value = raw.trim()
    if (!value.startsWith('#')) value = `#${value}`
    const rgb = hexToRgb(value)
    if (!rgb) return
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    dispatch({ type: 'setSwatchHex', index, hex, recordHistory })
  }

  const handleReorder = (next: PaletteColor[]) => {
    const selectedId = colorsRef.current[selectedIndexRef.current]?.id
    const focusId =
      hexFocusIndexRef.current !== null
        ? colorsRef.current[hexFocusIndexRef.current]?.id
        : null
    let selectedIndex = selectedIndexRef.current
    let hexFocusIndex = hexFocusIndexRef.current
    if (selectedId) {
      const idx = next.findIndex((c) => c.id === selectedId)
      if (idx >= 0) selectedIndex = idx
    }
    if (focusId) {
      const idx = next.findIndex((c) => c.id === focusId)
      hexFocusIndex = idx >= 0 ? idx : null
    }
    dispatch({ type: 'reorder', colors: next, selectedIndex, hexFocusIndex })
  }

  return {
    state,
    dispatch,
    editPanelRef,
    colorsRef,
    dragSnapshotRef,
    copied,
    flash,
    commitColors,
    setSwatchHex,
    handleReorder,
    clonePalette,
    insertMidpointBetween,
    removeColorAt,
    generatePalette,
    MIN_PALETTE,
    MAX_PALETTE
  }
}
