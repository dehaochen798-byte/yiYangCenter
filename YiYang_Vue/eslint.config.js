import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    ...js.configs.recommended,
  },
  ...pluginVue.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['src/**/*.vue'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        parser: tseslint.parser,
      },
    },
  })),
  {
    files: ['*.config.{js,ts}', 'vite.config.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    ...js.configs.recommended,
  },
  eslintConfigPrettier,
  {
    files: ['src/**/*.{js,ts,vue}', '*.config.{js,ts}', 'vite.config.{js,ts}'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': 'warn',
    },
  },
  {
    files: ['src/**/*.{ts,vue}'],
    rules: {
      // TypeScript plus auto-imports.d.ts already tracks undefined symbols.
      // Keeping no-undef on here causes false positives for Vue auto imports.
      'no-undef': 'off',
    },
  },
]
