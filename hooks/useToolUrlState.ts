'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type ParamPrimitive = string | number | boolean | string[]

export type ParamCodec<T extends ParamPrimitive> = {
  default: T
  /** Method syntax keeps assignability into ParamCodec<ParamPrimitive> (bivariant). */
  parse(raw: string | null): T
  serialize(value: T): string | null
  /** Large text fields: omit from URL when encoded length exceeds the guard. */
  text?: boolean
}

export type ToolUrlSchema = Record<string, ParamCodec<ParamPrimitive>>

type InferState<S extends ToolUrlSchema> = {
  [K in keyof S]: S[K]['default']
}

type UseToolUrlStateOptions = {
  debounceMs?: number
  /** Max encoded length for `text: true` fields before they are omitted. */
  maxTextEncodedLength?: number
}

const DEFAULT_DEBOUNCE_MS = 250
const DEFAULT_MAX_TEXT_ENCODED = 2000

function parseState<S extends ToolUrlSchema>(
  schema: S,
  searchParams: URLSearchParams
): InferState<S> {
  const state = {} as InferState<S>
  for (const key of Object.keys(schema) as (keyof S)[]) {
    state[key] = schema[key].parse(searchParams.get(String(key))) as InferState<S>[typeof key]
  }
  return state
}

function buildQueryString<S extends ToolUrlSchema>(
  schema: S,
  state: InferState<S>,
  currentSearch: string,
  maxTextEncodedLength: number
): string {
  const qs = new URLSearchParams(currentSearch)

  for (const key of Object.keys(schema) as (keyof S)[]) {
    qs.delete(String(key))
  }

  for (const key of Object.keys(schema) as (keyof S)[]) {
    const codec = schema[key]
    const value = state[key] as ParamPrimitive
    const serialized = codec.serialize(value)
    if (serialized === null) continue
    if (
      codec.text &&
      encodeURIComponent(serialized).length > maxTextEncodedLength
    ) {
      continue
    }
    qs.set(String(key), serialized)
  }

  return qs.toString()
}

/**
 * Sync a flat tool state object to the URL query string.
 * Defaults are omitted; text fields over the size guard are omitted.
 * Wrap the consumer in `<Suspense>` (uses `useSearchParams`).
 */
export function useToolUrlState<S extends ToolUrlSchema>(
  schema: S,
  options?: UseToolUrlStateOptions
): [InferState<S>, Dispatch<SetStateAction<InferState<S>>>] {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS
  const maxTextEncodedLength =
    options?.maxTextEncodedLength ?? DEFAULT_MAX_TEXT_ENCODED

  const schemaRef = useRef(schema)
  schemaRef.current = schema

  const initial = useMemo(
    () => parseState(schema, searchParams),
    // Hydrate once from the URL on mount; subsequent URL writes are ours.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [state, setState] = useState<InferState<S>>(initial)
  const stateRef = useRef(state)
  stateRef.current = state

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const currentSearch =
        typeof window !== 'undefined'
          ? window.location.search.slice(1)
          : searchParams.toString()
      const nextQ = buildQueryString(
        schemaRef.current,
        stateRef.current,
        currentSearch,
        maxTextEncodedLength
      )
      const currentQ = new URLSearchParams(
        typeof window !== 'undefined'
          ? window.location.search
          : `?${currentSearch}`
      ).toString()

      if (nextQ === currentQ) return
      router.replace(nextQ ? `${pathname}?${nextQ}` : pathname, {
        scroll: false
      })
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [state, debounceMs, maxTextEncodedLength, pathname, router, searchParams])

  return [state, setState]
}

// --- Codecs -----------------------------------------------------------------

export function str(
  defaultValue: string,
  opts?: { text?: boolean }
): ParamCodec<string> {
  return {
    default: defaultValue,
    text: opts?.text,
    parse: (raw) => (raw === null ? defaultValue : raw),
    serialize: (value) => (value === defaultValue ? null : value)
  }
}

export function int(
  defaultValue: number,
  opts?: { min?: number; max?: number }
): ParamCodec<number> {
  return {
    default: defaultValue,
    parse: (raw) => {
      if (raw === null) return defaultValue
      const n = Number.parseInt(raw, 10)
      if (!Number.isFinite(n)) return defaultValue
      let v = n
      if (opts?.min !== undefined) v = Math.max(opts.min, v)
      if (opts?.max !== undefined) v = Math.min(opts.max, v)
      return v
    },
    serialize: (value) => (value === defaultValue ? null : String(value))
  }
}

export function bool(defaultValue: boolean): ParamCodec<boolean> {
  return {
    default: defaultValue,
    parse: (raw) => {
      if (raw === null) return defaultValue
      if (raw === '1' || raw === 'true') return true
      if (raw === '0' || raw === 'false') return false
      return defaultValue
    },
    serialize: (value) => {
      if (value === defaultValue) return null
      return value ? '1' : '0'
    }
  }
}

export function enumParam<T extends string>(
  defaultValue: T,
  allowed: readonly T[]
): ParamCodec<T> {
  const set = new Set<string>(allowed)
  return {
    default: defaultValue,
    parse: (raw) => {
      if (raw === null || !set.has(raw)) return defaultValue
      return raw as T
    },
    serialize: (value) => (value === defaultValue ? null : value)
  }
}

export function csv(
  defaultValue: string[],
  opts?: { text?: boolean }
): ParamCodec<string[]> {
  const defaultSerialized = defaultValue.join(',')
  return {
    default: defaultValue,
    text: opts?.text,
    parse: (raw) => {
      if (raw === null) return [...defaultValue]
      if (raw === '') return []
      return raw.split(',')
    },
    serialize: (value) => {
      const s = value.join(',')
      return s === defaultSerialized ? null : s
    }
  }
}

/** Custom codec when serialize/parse need domain helpers (e.g. palette `c=`). */
export function custom<T extends ParamPrimitive>(
  defaultValue: T,
  parse: (raw: string | null) => T,
  serialize: (value: T) => string | null,
  opts?: { text?: boolean }
): ParamCodec<T> {
  return { default: defaultValue, parse, serialize, text: opts?.text }
}
