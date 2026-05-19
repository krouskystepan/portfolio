import type { ComponentType } from 'react'
import type { ToolPath } from '@/constants/tools'

type ToolLoader = () => Promise<{ default: ComponentType }>

const loaders = {
  'data-workbench': () => import('@/components/tools/items/DataWorkbench'),
  'text-diff': () => import('@/components/tools/items/TextDifference'),
  'case-converter': () => import('@/components/tools/items/TextCaseConverter'),
  'alphabet-sorter': () => import('@/components/tools/items/AlphabetSorter'),
  'regex-tester': () => import('@/components/tools/items/RegexTester'),
  'slug-generator': () => import('@/components/tools/items/SlugGenerator'),
  'html-css-js-minifier': () => import('@/components/tools/items/CodeMinifier'),
  'url-encoder-decoder': () => import('@/components/tools/items/UrlEncoderDecoder'),
  'jwt-decoder': () => import('@/components/tools/items/JwtDecoder'),
  'uuid-generator': () => import('@/components/tools/items/UuidGenerator'),
  'color-converter': () => import('@/components/tools/items/ColorConverter'),
  'timestamp-converter': () => import('@/components/tools/items/TimestampConverter')
} as const satisfies Record<ToolPath, ToolLoader>

export type { ToolPath }

export function isToolPath(path: string): path is ToolPath {
  return path in loaders
}

export async function loadTool(path: ToolPath) {
  const { default: Component } = await loaders[path]()
  return Component
}
