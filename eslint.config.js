import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 日本語コンテンツの全角スペースは正当。文字列・テンプレート・JSXテキスト・コメント内は許容
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipTemplates: true, skipComments: true, skipJSXText: true, skipRegExps: true },
      ],
      // `_` 接頭辞の未使用引数/変数は意図的（将来用・API互換のためのプレースホルダ）として許容
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // react-hooks v7 の新しい助言系ルールは warn に。
      // 現状の指摘はすべて意図的パターン（useMemo 内シャッフルの安定化・dev 限定の状態同期等）で
      // 実行時バグではないため、エラーではなく警告として可視化する。
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      // Fast Refresh 専用ルール（実行時影響なし）も warn
      'react-refresh/only-export-components': 'warn',
    },
  },
])
