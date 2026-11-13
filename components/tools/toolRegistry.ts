import type { ComponentType } from 'react'
import type { ToolPath } from '@/constants/tools'

type ToolLoader = () => Promise<{ default: ComponentType }>

const loaders = {
  'data-workbench': () => import('@/components/tools/items/DataWorkbench'),
  'json-query': () => import('@/components/tools/items/JsonQueryTransform'),
  'xml-workbench': () => import('@/components/tools/items/XmlWorkbench'),
  'text-diff': () => import('@/components/tools/items/TextDifference'),
  'case-converter': () => import('@/components/tools/items/TextCaseConverter'),
  'alphabet-sorter': () => import('@/components/tools/items/AlphabetSorter'),
  'regex-tester': () => import('@/components/tools/items/RegexTester'),
  'unicode-ascii': () => import('@/components/tools/items/UnicodeAsciiConverter'),
  'slug-generator': () => import('@/components/tools/items/SlugGenerator'),
  'markdown-editor': () => import('@/components/tools/items/MarkdownEditor'),
  'sql-formatter': () => import('@/components/tools/items/SqlFormatter'),
  'html-entities': () => import('@/components/tools/items/HtmlEntityCodec'),
  'html-css-js-minifier': () => import('@/components/tools/items/CodeMinifier'),
  'url-encoder-decoder': () => import('@/components/tools/items/UrlEncoderDecoder'),
  'url-inspector': () => import('@/components/tools/items/UrlInspector'),
  'jwt-decoder': () => import('@/components/tools/items/JwtDecoder'),
  'curl-to-http': () => import('@/components/tools/items/CurlToHttp'),
  'http-request-builder': () =>
    import('@/components/tools/items/HttpRequestBuilder'),
  'openapi-viewer': () => import('@/components/tools/items/OpenApiViewer'),
  'image-base64': () => import('@/components/tools/items/ImageBase64'),
  'base64-hex': () => import('@/components/tools/items/Base64HexCodec'),
  'uuid-generator': () => import('@/components/tools/items/UuidGenerator'),
  'password-generator': () =>
    import('@/components/tools/items/PasswordGenerator'),
  'color-converter': () => import('@/components/tools/items/ColorConverter'),
  'timestamp-converter': () =>
    import('@/components/tools/items/TimestampConverter'),
  'timezone-converter': () =>
    import('@/components/tools/items/TimezoneConverter'),
  'number-base-converter': () =>
    import('@/components/tools/items/NumberBaseConverter'),
  'qr-code': () => import('@/components/tools/items/QrCodeGenerator'),
  'color-palette': () => import('@/components/tools/items/ColorPalette'),
  'gradient-generator': () =>
    import('@/components/tools/items/GradientGenerator'),
  'blob-wave': () => import('@/components/tools/items/SvgBlobWaveGenerator'),
  'shadow-generator': () =>
    import('@/components/tools/items/ShadowGenerator'),
  'chmod-calculator': () => import('@/components/tools/items/ChmodCalculator'),
  'escape-unescape': () =>
    import('@/components/tools/items/EscapeUnescapeToolbox'),
  'cidr-calculator': () => import('@/components/tools/items/CidrCalculator'),
  'ip-inspector': () => import('@/components/tools/items/IpInspector'),
  'dns-lookup': () => import('@/components/tools/items/DnsLookup'),
  'cron-builder': () => import('@/components/tools/items/CronExpressionBuilder'),
  'hash-generator': () => import('@/components/tools/items/HashGenerator'),
  'lorem-generator': () => import('@/components/tools/items/LoremGenerator'),
  'mock-data': () => import('@/components/tools/items/MockDataGenerator'),
  'sql-insert-generator': () =>
    import('@/components/tools/items/SqlInsertGenerator'),
  'log-analyzer': () => import('@/components/tools/items/LogAnalyzer'),
  'json-assertion-builder': () =>
    import('@/components/tools/items/JsonAssertionBuilder'),
  'api-response-validator': () =>
    import('@/components/tools/items/ApiResponseValidator'),
  'http-status-codes': () =>
    import('@/components/tools/items/HttpStatusCodes')
} as const satisfies Record<ToolPath, ToolLoader>

export type { ToolPath }

export function isToolPath(path: string): path is ToolPath {
  return path in loaders
}

export async function loadTool(path: ToolPath) {
  const { default: Component } = await loaders[path]()
  return Component
}
