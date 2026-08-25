import js from '@eslint/js'
import skipFormatting from 'eslint-config-prettier/flat'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores(['dist', 'node_modules']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  skipFormatting,
  {
    rules: {
      // TypeScript 已负责未定义变量检查，关闭 ESLint 原生 no-undef 避免浏览器全局误报
      'no-undef': 'off',
    },
  },
)
