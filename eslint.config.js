const eslint = require('@eslint/js')
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsparser = require('@typescript-eslint/parser')
const security = require('eslint-plugin-security')
const sonarjs = require('eslint-plugin-sonarjs')

module.exports = [
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        console: 'readonly',
        Buffer: 'readonly',
        process: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        exports: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      security,
      sonarjs
    },
    rules: {
      // TypeScript ESLint rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Security rules - comprehensive coverage
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',

      // SonarJS rules - relaxed complexity for VS Code extension
      'sonarjs/cognitive-complexity': ['warn', 25],
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-identical-functions': 'error',

      // Built-in ESLint complexity rules
      'complexity': ['error', { max: 10 }],
      'max-depth': ['warn', 4],
      'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true }],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-nested-callbacks': ['warn', 3],
      'max-params': ['warn', 5],
      'max-statements': ['warn', 20],

      // General rules
      'no-console': 'off', // Allowed for VS Code extension development
      'no-debugger': 'error',
      'no-unused-vars': 'off', // Disabled in favor of @typescript-eslint/no-unused-vars
      'prefer-const': 'error',
      'no-var': 'error',
      'no-case-declarations': 'error'
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        Buffer: 'readonly',
        process: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  // Test files configuration
  {
    files: ['tests/**/*.js', 'tests/**/*.ts', '**/*.test.js', '**/*.test.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'sonarjs/no-duplicate-string': 'off'
    }
  },
  {
    ignores: [
      'out/**',
      'node_modules/**',
      '**/*.d.ts',
      '*.vsix',
      'tests/extension-typescript.mocha.test.ts',
      'tests/extension-typescript.vitest.test.ts'
    ]
  }
]
