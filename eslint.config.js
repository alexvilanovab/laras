import css from '@eslint/css'
import js from '@eslint/js'
import json from '@eslint/json'
import markdown from '@eslint/markdown'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const SEVERITY_ERROR = /** @type {2} */ (2)
const SEVERITY_OFF = /** @type {0} */ (0)

export default defineConfig([
  { ignores: ['package-lock.json'] },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  // pluginReact.configs.flat.recommended,
  {
    files: ['**/*.{jsx,tsx}'],
    settings: { react: { version: 'detect' } },
    plugins: { react: pluginReact },
    rules: {
      'react/display-name': SEVERITY_ERROR,
      'react/jsx-key': SEVERITY_ERROR,
      'react/jsx-no-comment-textnodes': SEVERITY_ERROR,
      'react/jsx-no-duplicate-props': SEVERITY_ERROR,
      'react/jsx-no-target-blank': SEVERITY_ERROR,
      'react/jsx-no-undef': SEVERITY_ERROR,
      'react/jsx-uses-react': SEVERITY_ERROR,
      'react/jsx-uses-vars': SEVERITY_ERROR,
      'react/no-children-prop': SEVERITY_ERROR,
      'react/no-danger-with-children': SEVERITY_ERROR,
      'react/no-deprecated': SEVERITY_ERROR,
      'react/no-direct-mutation-state': SEVERITY_ERROR,
      'react/no-find-dom-node': SEVERITY_ERROR,
      'react/no-is-mounted': SEVERITY_ERROR,
      'react/no-render-return-value': SEVERITY_ERROR,
      'react/no-string-refs': SEVERITY_ERROR,
      'react/no-unescaped-entities': SEVERITY_ERROR,
      'react/no-unknown-property': SEVERITY_ERROR,
      'react/no-unsafe': SEVERITY_OFF,
      'react/prop-types': SEVERITY_ERROR,
      // 'react/react-in-jsx-scope': SEVERITY_ERROR,
      'react/require-render-return': SEVERITY_ERROR,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  { files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
  { files: ['**/*.jsonc'], plugins: { json }, language: 'json/jsonc', extends: ['json/recommended'] },
  { files: ['**/*.json5'], plugins: { json }, language: 'json/json5', extends: ['json/recommended'] },
  { files: ['**/*.md'], plugins: { markdown }, language: 'markdown/gfm', extends: ['markdown/recommended'] },
  { files: ['**/*.css'], plugins: { css }, language: 'css/css', extends: ['css/recommended'] },
  eslintConfigPrettier,
])
