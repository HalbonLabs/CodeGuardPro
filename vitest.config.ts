import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'tests/**/*.vitest.{test,spec}.{js,ts}',
      'tests/**/vitest/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/out/**',
      '**/*.d.ts',
      'tests/**/*.mocha.{test,spec}.{js,ts}',
      'tests/**/*.jest.{test,spec}.{js,ts}',
      'tests/**/jest/**/*',
      'tests/**/mocha/**/*',
      'tests/**/playwright/**/*',
      'tests/**/cypress/**/*'
    ],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__x00__*',
        '**/\x00*',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/tests/**',
        '**/__tests__/**'
      ]
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vscode': path.resolve(__dirname, './vitest.setup.ts')
    }
  },
  esbuild: {
    target: 'node16'
  }
})
