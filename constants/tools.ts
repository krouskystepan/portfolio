type TTools = {
  name: string
  path: string
  description: string
}

// TODOs
/*
- Responsive uuid gen
- Responsive color conv
- Filter out invalid achievements via edited local storage
*/

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
    name: 'Alphabet Sorter',
    path: 'alphabet-sorter',
    description:
      'Sort text alphabetically, with an option to automatically group related items together.',
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
    path: 'timestamp-converter',
    description: 'Convert Unix timestamps to readable dates and vice versa.',
  },
  {
    name: 'JSON to TS Type Generator',
    path: '',
    // path: 'json-to-ts',
    description:
      'Convert JSON objects into clean, typed TypeScript interfaces with one click.',
  },
  {
    name: 'Text Case Converter',
    path: '',
    // path: 'case-converter',
    description:
      'Convert text into camelCase, PascalCase, snake_case, uppercase, and more.',
  },
  {
    name: 'YAML to JSON Converter',
    path: '',
    // path: 'yaml-json',
    description: 'Convert YAML data to JSON and JSON back to YAML instantly.',
  },
]
