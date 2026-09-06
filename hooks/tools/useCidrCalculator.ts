'use client'

import { useEffect, useReducer } from 'react'
import {
  DEFAULT_INPUT,
  type SubnetInput,
  calculateSubnet,
  formatCidr,
  formatIpv4,
  maskToPrefix,
  parseCidr,
  parseIpv4,
  prefixToMask
} from '@/utils/cidrSubnet'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'

const DEFAULT_CIDR = formatCidr(DEFAULT_INPUT)

export type CidrCalculatorState = {
  input: SubnetInput
  cidrText: string
  ipText: string
  maskText: string
  cidrError: string | null
  ipError: string | null
  maskError: string | null
}

type Action =
  | { type: 'setCidrText'; text: string }
  | { type: 'blurCidr' }
  | { type: 'setIpText'; text: string }
  | { type: 'blurIp' }
  | { type: 'setPrefix'; raw: string }
  | { type: 'setMaskText'; text: string }
  | { type: 'blurMask' }
  | { type: 'applyInput'; input: SubnetInput }
  | { type: 'reset' }

function normalizeInput(next: SubnetInput): SubnetInput {
  return {
    ip: next.ip >>> 0,
    prefix: Math.min(32, Math.max(0, Math.trunc(next.prefix)))
  }
}

function mirrorsFromInput(input: SubnetInput) {
  return {
    cidrText: formatCidr(input),
    ipText: formatIpv4(input.ip),
    maskText: formatIpv4(prefixToMask(input.prefix)),
    cidrError: null as string | null,
    ipError: null as string | null,
    maskError: null as string | null
  }
}

function hydrateFromCidr(cidr: string): CidrCalculatorState {
  const result = parseCidr(cidr)
  if (result.ok) {
    const input = normalizeInput(result.input)
    return { input, ...mirrorsFromInput(input) }
  }
  return {
    input: DEFAULT_INPUT,
    ...mirrorsFromInput(DEFAULT_INPUT)
  }
}

function applyNormalized(
  _state: CidrCalculatorState,
  next: SubnetInput
): CidrCalculatorState {
  const input = normalizeInput(next)
  return { input, ...mirrorsFromInput(input) }
}

function reducer(
  state: CidrCalculatorState,
  action: Action
): CidrCalculatorState {
  switch (action.type) {
    case 'setCidrText': {
      const text = action.text
      if (!text.trim()) {
        return { ...state, cidrText: text, cidrError: null }
      }
      const result = parseCidr(text)
      if (result.ok) {
        const input = normalizeInput(result.input)
        return {
          input,
          cidrText: text,
          ipText: formatIpv4(input.ip),
          maskText: formatIpv4(prefixToMask(input.prefix)),
          cidrError: null,
          ipError: null,
          maskError: null
        }
      }
      return { ...state, cidrText: text, cidrError: result.error }
    }
    case 'blurCidr':
      return {
        ...state,
        cidrText: formatCidr(state.input),
        cidrError: null
      }
    case 'setIpText': {
      const text = action.text
      if (!text.trim()) {
        return { ...state, ipText: text, ipError: null }
      }
      const result = parseIpv4(text)
      if (result.ok) {
        const input = normalizeInput({
          ip: result.value,
          prefix: state.input.prefix
        })
        return {
          ...state,
          input,
          ipText: text,
          cidrText: formatCidr(input),
          ipError: null,
          cidrError: null
        }
      }
      return { ...state, ipText: text, ipError: result.error }
    }
    case 'blurIp':
      return {
        ...state,
        ipText: formatIpv4(state.input.ip),
        ipError: null
      }
    case 'setPrefix': {
      if (action.raw.trim() === '') return state
      const n = Number.parseInt(action.raw, 10)
      if (!Number.isFinite(n)) return state
      return applyNormalized(state, {
        ip: state.input.ip,
        prefix: Math.min(32, Math.max(0, n))
      })
    }
    case 'setMaskText': {
      const text = action.text
      if (!text.trim()) {
        return { ...state, maskText: text, maskError: null }
      }
      const ipResult = parseIpv4(text)
      if (!ipResult.ok) {
        return { ...state, maskText: text, maskError: ipResult.error }
      }
      const prefixResult = maskToPrefix(ipResult.value)
      if (!prefixResult.ok) {
        return { ...state, maskText: text, maskError: prefixResult.error }
      }
      const input = normalizeInput({
        ip: state.input.ip,
        prefix: prefixResult.prefix
      })
      return {
        ...state,
        input,
        maskText: text,
        cidrText: formatCidr(input),
        maskError: null,
        cidrError: null
      }
    }
    case 'blurMask':
      return {
        ...state,
        maskText: formatIpv4(prefixToMask(state.input.prefix)),
        maskError: null
      }
    case 'applyInput':
      return applyNormalized(state, action.input)
    case 'reset':
      return applyNormalized(state, DEFAULT_INPUT)
    default:
      return state
  }
}

export function useCidrCalculator() {
  const [url, setUrl] = useToolUrlState({
    cidr: str(DEFAULT_CIDR)
  })

  const [state, dispatch] = useReducer(reducer, url.cidr, hydrateFromCidr)
  const { copied, flash, clear } = useCopyFeedback()

  // Durable: sync canonical CIDR string to the URL.
  useEffect(() => {
    const nextCidr = formatCidr(state.input)
    setUrl((s) => (s.cidr === nextCidr ? s : { cidr: nextCidr }))
  }, [state.input, setUrl])

  const setCidrText = (text: string) =>
    dispatch({ type: 'setCidrText', text })
  const blurCidr = () => dispatch({ type: 'blurCidr' })
  const setIpText = (text: string) => dispatch({ type: 'setIpText', text })
  const blurIp = () => dispatch({ type: 'blurIp' })
  const setPrefix = (raw: string) => dispatch({ type: 'setPrefix', raw })
  const setMaskText = (text: string) =>
    dispatch({ type: 'setMaskText', text })
  const blurMask = () => dispatch({ type: 'blurMask' })
  const applyInput = (input: SubnetInput) =>
    dispatch({ type: 'applyInput', input })
  const applyPreset = (cidr: string) => {
    const result = parseCidr(cidr)
    if (result.ok) dispatch({ type: 'applyInput', input: result.input })
  }
  const reset = () => dispatch({ type: 'reset' })

  const info = calculateSubnet(state.input)

  return {
    state,
    dispatch,
    info,
    copied,
    flash,
    clear,
    setCidrText,
    blurCidr,
    setIpText,
    blurIp,
    setPrefix,
    setMaskText,
    blurMask,
    applyInput,
    applyPreset,
    reset
  }
}
