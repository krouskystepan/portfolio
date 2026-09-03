export type CodeKind = 'html' | 'css' | 'javascript' | 'python'

const HOLD = '\u0000'

function restoreHeld(source: string, held: string[]): string {
  return source.replace(new RegExp(`${HOLD}(\\d+)${HOLD}`, 'g'), (_, i) => held[Number(i)])
}

function parkMatches(source: string, pattern: RegExp, held: string[]): string {
  return source.replace(pattern, (match) => {
    const id = held.length
    held.push(match)
    return `${HOLD}${id}${HOLD}`
  })
}

export function minifyCss(input: string): string {
  let i = 0
  let out = ''
  const n = input.length

  const copyQuoted = (quote: string) => {
    out += quote
    i++
    while (i < n) {
      const c = input[i]
      out += c
      if (c === '\\' && i + 1 < n) {
        out += input[i + 1]
        i += 2
        continue
      }
      if (c === quote) {
        i++
        break
      }
      i++
    }
  }

  while (i < n) {
    const c = input[i]
    const next = i + 1 < n ? input[i + 1] : ''

    if (c === '/' && next === '*') {
      i += 2
      while (i + 1 < n && !(input[i] === '*' && input[i + 1] === '/')) i++
      i += 2
      continue
    }

    if (c === '"' || c === "'") {
      copyQuoted(c)
      continue
    }

    if (/\s/.test(c)) {
      while (i < n && /\s/.test(input[i])) i++
      const prev = out.at(-1) ?? ''
      const peek = input[i] ?? ''
      if (
        prev &&
        peek &&
        !'{}():;,>+~[]'.includes(prev) &&
        !'{}():;,>+~[]'.includes(peek)
      ) {
        out += ' '
      }
      continue
    }

    out += c
    i++
  }

  return out.trim()
}

export function minifyHtml(input: string): string {
  const held: string[] = []
  let s = input
  s = parkMatches(s, /<pre\b[\s\S]*?<\/pre>/gi, held)
  s = parkMatches(s, /<textarea\b[\s\S]*?<\/textarea>/gi, held)
  s = parkMatches(s, /<script\b[\s\S]*?<\/script>/gi, held)
  s = parkMatches(s, /<style\b[\s\S]*?<\/style>/gi, held)
  s = s.replace(/<!--[\s\S]*?-->/g, '')
  s = s.replace(/>\s+</g, '><')
  s = s.replace(/\s{2,}/g, ' ')
  return restoreHeld(s, held).trim()
}

async function getPrettier() {
  const [prettier, babel, estree, html, postcss] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/babel'),
    import('prettier/plugins/estree'),
    import('prettier/plugins/html'),
    import('prettier/plugins/postcss')
  ])

  return { prettier, babel, estree, html, postcss }
}

function prettierParser(kind: Exclude<CodeKind, 'python'>) {
  if (kind === 'html') return 'html' as const
  if (kind === 'css') return 'css' as const
  return 'babel-ts' as const
}

export async function beautifyCode(
  kind: CodeKind,
  input: string
): Promise<string> {
  if (kind === 'python') return beautifyPython(input)

  const { prettier, babel, estree, html, postcss } = await getPrettier()
  const parser = prettierParser(kind)
  const plugins =
    parser === 'html'
      ? [html]
      : parser === 'css'
        ? [postcss]
        : [babel, estree]

  return (
    await prettier.format(input, {
      parser,
      plugins,
      semi: true,
      singleQuote: true
    })
  ).trimEnd()
}

export async function minifyCode(kind: CodeKind, input: string): Promise<string> {
  if (kind === 'python') return minifyPython(input).trimEnd()
  if (kind === 'css') return minifyCss(input)
  if (kind === 'html') return minifyHtml(input)
  return minifyJavascript(input)
}

export async function minifyJavascript(input: string): Promise<string> {
  const [{ parse }, generateMod] = await Promise.all([
    import('@babel/parser'),
    import('@babel/generator')
  ])
  const generate =
    generateMod.default ??
    (generateMod as { generate: typeof generateMod.default }).generate

  const plugins = [
    'jsx',
    ['typescript', {}],
    'decorators-legacy',
    'exportDefaultFrom'
  ] satisfies import('@babel/parser').ParserPlugin[]

  const parseOptions = {
    plugins,
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
    errorRecovery: false
  }

  let ast
  try {
    ast = parse(input, { ...parseOptions, sourceType: 'unambiguous' })
  } catch {
    ast = parse(input, { ...parseOptions, sourceType: 'script' })
  }

  const { code } = generate(ast, {
    compact: true,
    comments: false,
    minified: true,
    jsescOption: { minimal: true }
  })

  return code.trim()
}

const PY_STRING_PREFIX = /[rRfFbBuU]/

export function minifyPython(input: string): string {
  return transformPython(input, { stripComments: true, dropBlankLines: true })
}

export function beautifyPython(input: string): string {
  return transformPython(input, { stripComments: false, dropBlankLines: false })
}

function transformPython(
  input: string,
  opts: { stripComments: boolean; dropBlankLines: boolean }
): string {
  const n = input.length
  let i = 0
  let out = ''
  let lineStart = true
  let pendingIndent = ''
  let blankRun = 0

  const peek = (offset = 0) => input[i + offset] ?? ''

  const startsString = (): { quote: string; triple: boolean } | null => {
    let p = i
    while (p < n && PY_STRING_PREFIX.test(input[p]!)) p++
    const q = input[p]
    if (q !== '"' && q !== "'") return null
    const triple = input.slice(p, p + 3) === q.repeat(3)
    return { quote: q, triple }
  }

  const flushIndent = () => {
    if (pendingIndent) {
      out += pendingIndent
      pendingIndent = ''
    }
  }

  const copyString = (quote: string, triple: boolean) => {
    flushIndent()
    while (i < n && PY_STRING_PREFIX.test(peek())) {
      out += peek()
      i++
    }
    const open = triple ? quote.repeat(3) : quote
    out += open
    i += open.length
    while (i < n) {
      const c = peek()
      if (c === '\\' && !triple) {
        out += c + peek(1)
        i += 2
        continue
      }
      if (triple && input.slice(i, i + 3) === quote.repeat(3)) {
        out += quote.repeat(3)
        i += 3
        return
      }
      if (!triple && c === quote) {
        out += c
        i++
        return
      }
      out += c
      i++
    }
  }

  const emitNewline = () => {
    pendingIndent = ''
    if (opts.dropBlankLines) {
      if (lineStart) return
      out += '\n'
      lineStart = true
      return
    }
    if (lineStart) {
      blankRun++
      if (blankRun > 2) return
    } else {
      blankRun = 0
    }
    out += '\n'
    lineStart = true
  }

  while (i < n) {
    const c = peek()

    if (c === '\r') {
      i++
      continue
    }

    if (lineStart && (c === ' ' || c === '\t')) {
      pendingIndent += c
      i++
      continue
    }

    const str = startsString()
    if (str) {
      lineStart = false
      blankRun = 0
      copyString(str.quote, str.triple)
      continue
    }

    if (opts.stripComments && c === '#') {
      while (i < n && peek() !== '\n') i++
      continue
    }

    if (c === '\n') {
      i++
      emitNewline()
      continue
    }

    if (c === ' ' || c === '\t') {
      while (i < n && (peek() === ' ' || peek() === '\t')) i++
      const next = peek()
      if (next && next !== '\n' && next !== '#') out += ' '
      continue
    }

    flushIndent()
    out += c
    lineStart = false
    blankRun = 0
    i++
  }

  return out
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '\n')
}
