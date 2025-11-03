import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: resolve(__dirname),
})

const baseConfig = compat.extends(
  'next/core-web-vitals',
  'next/typescript',
  'plugin:tailwindcss/recommended'
)

const customRules = {
  rules: {
    'react/no-unescaped-entities': 'off',
  },
}

const eslintConfig = [
  ...baseConfig,
  customRules,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
]

export default eslintConfig
