'use client'

import { useEffect, useMemo, useReducer } from 'react'
import {
  DEFAULT_FIELDS,
  type CronFieldKey,
  type CronFields,
  type CronTimezone,
  cloneFields,
  describeCron,
  fieldsToExpression,
  nextRuns,
  parseExpression
} from '@/utils/cronExpression'
import { enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'

const DEFAULT_EXPR = fieldsToExpression(DEFAULT_FIELDS)

export type CronBuilderState = {
  fields: CronFields
  expressionText: string
  expressionError: string | null
  activeField: CronFieldKey
  ready: boolean
}

type Action =
  | { type: 'applyFields'; fields: CronFields }
  | { type: 'setExpressionText'; text: string }
  | { type: 'blurExpression' }
  | { type: 'setField'; key: CronFieldKey; value: string }
  | { type: 'applyPreset'; expression: string }
  | { type: 'reset' }
  | { type: 'setActiveField'; key: CronFieldKey }
  | { type: 'setReady' }

function hydrateFromExpr(expr: string): Omit<CronBuilderState, 'ready'> {
  const result = parseExpression(expr)
  if (result.ok) {
    return {
      fields: cloneFields(result.fields),
      expressionText: fieldsToExpression(result.fields),
      expressionError: null,
      activeField: 'minute'
    }
  }
  return {
    fields: cloneFields(DEFAULT_FIELDS),
    expressionText: expr.trim() ? expr : DEFAULT_EXPR,
    expressionError: null,
    activeField: 'minute'
  }
}

function withSyncedExpression(fields: CronFields): Pick<
  CronBuilderState,
  'fields' | 'expressionText' | 'expressionError'
> {
  return {
    fields,
    expressionText: fieldsToExpression(fields),
    expressionError: null
  }
}

function reducer(state: CronBuilderState, action: Action): CronBuilderState {
  switch (action.type) {
    case 'applyFields':
      return { ...state, ...withSyncedExpression(action.fields) }
    case 'setExpressionText': {
      const text = action.text
      if (!text.trim()) {
        return { ...state, expressionText: text, expressionError: null }
      }
      const result = parseExpression(text)
      if (result.ok) {
        return {
          ...state,
          expressionText: text,
          fields: result.fields,
          expressionError: null
        }
      }
      return {
        ...state,
        expressionText: text,
        expressionError: result.error
      }
    }
    case 'blurExpression': {
      const expr = fieldsToExpression(state.fields)
      return {
        ...state,
        expressionText: expr,
        expressionError: null
      }
    }
    case 'setField': {
      const fields = {
        ...state.fields,
        [action.key]: action.value.trim() || '*'
      }
      return { ...state, ...withSyncedExpression(fields) }
    }
    case 'applyPreset': {
      const result = parseExpression(action.expression)
      if (!result.ok) return state
      return { ...state, ...withSyncedExpression(result.fields) }
    }
    case 'reset':
      return {
        ...state,
        ...withSyncedExpression(cloneFields(DEFAULT_FIELDS)),
        activeField: 'minute'
      }
    case 'setActiveField':
      return { ...state, activeField: action.key }
    case 'setReady':
      return { ...state, ready: true }
    default:
      return state
  }
}

export function useCronBuilder() {
  const [url, setUrl] = useToolUrlState({
    expr: str(DEFAULT_EXPR),
    tz: enumParam<CronTimezone>('local', ['local', 'UTC'] as const)
  })

  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    (): CronBuilderState => ({
      ...hydrateFromExpr(url.expr),
      ready: false
    })
  )

  const { copied, flash, clear } = useCopyFeedback()
  const timezone = url.tz

  useEffect(() => {
    dispatch({ type: 'setReady' })
  }, [])

  // Durable: keep `expr` in sync with the expression text mirror / built fields.
  useEffect(() => {
    setUrl((s) =>
      s.expr === state.expressionText ? s : { ...s, expr: state.expressionText }
    )
  }, [state.expressionText, setUrl])

  const applyFields = (fields: CronFields) =>
    dispatch({ type: 'applyFields', fields })
  const setExpressionText = (text: string) =>
    dispatch({ type: 'setExpressionText', text })
  const blurExpression = () => dispatch({ type: 'blurExpression' })
  const setField = (key: CronFieldKey, value: string) =>
    dispatch({ type: 'setField', key, value })
  const applyPreset = (expression: string) =>
    dispatch({ type: 'applyPreset', expression })
  const reset = () => {
    dispatch({ type: 'reset' })
    setUrl({ expr: DEFAULT_EXPR, tz: 'local' })
    clear()
  }
  const setActiveField = (key: CronFieldKey) =>
    dispatch({ type: 'setActiveField', key })
  const setTimezone = (tz: CronTimezone) =>
    setUrl((s) => (s.tz === tz ? s : { ...s, tz }))

  const expression = fieldsToExpression(state.fields)

  const description = useMemo(() => {
    try {
      return { value: describeCron(expression), error: null as string | null }
    } catch (err) {
      return {
        value: '',
        error: err instanceof Error ? err.message : 'Invalid expression.'
      }
    }
  }, [expression])

  const runs = useMemo(() => {
    if (!state.ready) {
      return { value: [] as Date[], error: null as string | null }
    }
    try {
      return {
        value: nextRuns(expression, 10, timezone),
        error: null as string | null
      }
    } catch (err) {
      return {
        value: [] as Date[],
        error:
          err instanceof Error ? err.message : 'Could not compute next runs.'
      }
    }
  }, [expression, timezone, state.ready])

  return {
    state,
    dispatch,
    timezone,
    expression,
    description,
    runs,
    copied,
    flash,
    clear,
    applyFields,
    setExpressionText,
    blurExpression,
    setField,
    applyPreset,
    reset,
    setActiveField,
    setTimezone
  }
}
