const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const security = require('eslint-plugin-security');
const sonarjs = require('eslint-plugin-sonarjs');

module.exports = [
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
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
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'security': security,
      'sonarjs': sonarjs,
    },
    rules: {
      // TypeScript ESLint rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Security rules - relaxed for Node.js/VS Code extension environment
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'error',
      
      // SonarJS rules - relaxed complexity for VS Code extension
      'sonarjs/cognitive-complexity': ['warn', 25],
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-identical-functions': 'error',
      
      // General rules
      'no-console': 'off', // Allowed for VS Code extension development
      'no-debugger': 'error',
      'no-unused-vars': 'off', // Disabled in favor of @typescript-eslint/no-unused-vars
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: ['out/**', 'node_modules/**', '**/*.d.ts'],
  },
];
