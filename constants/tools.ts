type TTools = {
  name: string
  path: string
  description: string
}

export const tools: TTools[] = [
  {
    name: 'Text Compare / Diff Tool',
    path: 'text-diff',
    description:
      'Compare two blocks of text and see the differences highlighted.',
  },
  {
    name: 'JSON Formatter & Validator',
    path: 'json-formatter',
    description:
      'Format, validate, and inspect JSON instantly in your browser.',
  },
  {
    name: 'UUID Generator',
    path: 'uuid-generator',
    description: 'Generate random UUIDs (v4) for identifiers or testing.',
  },
  {
    name: 'Color Converter',
    path: 'color-converter',
    description:
      'Convert colors between HEX, RGB, HSL and more. Live color preview.',
  },
  {
    name: 'Markdown Previewer',
    path: '',
    description: 'Write and preview Markdown with instant rendering.',
  },
  {
    name: 'CSV to JSON Converter',
    path: '',
    description:
      'Convert CSV data into formatted JSON objects and arrays instantly.',
  },
  {
    name: 'HTML / CSS / JS Minifier',
    path: '',
    description:
      'Minify or beautify HTML, CSS, or JavaScript code to optimize performance.',
  },
  {
    name: 'Timestamp Converter',
    path: '',
    description: 'Convert Unix timestamps to readable dates and vice versa.',
  },
]
